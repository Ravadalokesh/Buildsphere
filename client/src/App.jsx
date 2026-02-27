import React from "react";
import api, { setAuthToken } from "./api/http";
import MetricCard from "./components/MetricCard";
import ProjectForm from "./components/ProjectForm";
import TaskBoard from "./components/TaskBoard";
import DailyLogForm from "./components/DailyLogForm";
import RiskPanel from "./components/RiskPanel";
import RolePermissionsCard from "./components/RolePermissionsCard";
import OcrIngestionCard from "./components/OcrIngestionCard";
import DelayPredictionCard from "./components/DelayPredictionCard";

const STORAGE_TOKEN_KEY = "buildsphere_token";
const STORAGE_USER_KEY = "buildsphere_user";
const STORAGE_PROJECT_KEY = "buildsphere_selected_project";

const initialAuth = {
  name: "",
  email: "",
  password: "",
  role: "project_manager"
};

function App() {
  const [isRegister, setIsRegister] = React.useState(false);
  const [auth, setAuth] = React.useState(initialAuth);
  const [token, setToken] = React.useState("");
  const [user, setUser] = React.useState(null);
  const [projects, setProjects] = React.useState([]);
  const [selectedProjectId, setSelectedProjectId] = React.useState("");
  const [tasks, setTasks] = React.useState([]);
  const [logs, setLogs] = React.useState([]);
  const [insights, setInsights] = React.useState(null);
  const [ocrResult, setOcrResult] = React.useState(null);
  const [delayPrediction, setDelayPrediction] = React.useState(null);
  const [ocrLoading, setOcrLoading] = React.useState(false);
  const [predictionLoading, setPredictionLoading] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [isSessionBooting, setIsSessionBooting] = React.useState(true);

  const selectedProject = React.useMemo(
    () => projects.find((item) => item._id === selectedProjectId),
    [projects, selectedProjectId]
  );
  const canManageProjects = user?.role === "project_manager";
  const canManageTasks = ["project_manager", "site_engineer"].includes(user?.role || "");
  const canManageLogs = ["project_manager", "site_engineer"].includes(user?.role || "");

  function clearSession() {
    setToken("");
    setUser(null);
    setProjects([]);
    setSelectedProjectId("");
    setTasks([]);
    setLogs([]);
    setInsights(null);
    setDelayPrediction(null);
    setOcrResult(null);
    setAuthToken("");
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem(STORAGE_PROJECT_KEY);
  }

  async function fetchProjects() {
    const { data } = await api.get("/projects");
    setProjects(data);
    if (data.length === 0) {
      setSelectedProjectId("");
      return;
    }

    const selectedExists = selectedProjectId && data.some((item) => item._id === selectedProjectId);
    if (!selectedExists) {
      setSelectedProjectId(data[0]._id);
    }
  }

  async function fetchProjectData(projectId) {
    if (!projectId) return;
    const [taskRes, logRes, riskRes] = await Promise.all([
      api.get(`/tasks?projectId=${projectId}`),
      api.get(`/daily-logs?projectId=${projectId}`),
      api.get(`/analytics/project/${projectId}/risk`)
    ]);
    setTasks(taskRes.data);
    setLogs(logRes.data);
    setInsights(riskRes.data);
    setDelayPrediction(null);
    setOcrResult(null);
  }

  React.useEffect(() => {
    try {
      const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
      const storedUser = localStorage.getItem(STORAGE_USER_KEY);
      const storedProjectId = localStorage.getItem(STORAGE_PROJECT_KEY);

      if (storedToken) {
        setToken(storedToken);
        setAuthToken(storedToken);
      }
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedProjectId) {
        setSelectedProjectId(storedProjectId);
      }
    } catch (_error) {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_USER_KEY);
      localStorage.removeItem(STORAGE_PROJECT_KEY);
    } finally {
      setIsSessionBooting(false);
    }
  }, []);

  React.useEffect(() => {
    if (!token) return;
    fetchProjects().catch((err) => {
      if (err.response?.status === 401) {
        clearSession();
        return;
      }
      setError(err.response?.data?.message || err.message);
    });
  }, [token]);

  React.useEffect(() => {
    if (!token || !selectedProjectId) return;
    fetchProjectData(selectedProjectId).catch((err) =>
      {
        if (err.response?.status === 401) {
          clearSession();
          return;
        }
        setError(err.response?.data?.message || err.message);
      }
    );
  }, [token, selectedProjectId]);

  React.useEffect(() => {
    if (!token) return;
    if (selectedProjectId) localStorage.setItem(STORAGE_PROJECT_KEY, selectedProjectId);
    else localStorage.removeItem(STORAGE_PROJECT_KEY);
  }, [token, selectedProjectId]);

  function handleAuthChange(event) {
    const { name, value } = event.target;
    setAuth((prev) => ({ ...prev, [name]: value }));
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const payload = isRegister
        ? auth
        : { email: auth.email, password: auth.password };

      const { data } = await api.post(endpoint, payload);
      setToken(data.token);
      setUser(data.user);
      setAuthToken(data.token);
      localStorage.setItem(STORAGE_TOKEN_KEY, data.token);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(data.user));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProject(payload) {
    if (!canManageProjects) {
      setError("Only Project Manager can create projects.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/projects", payload);
      await fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTask(payload) {
    if (!selectedProjectId) return;
    if (!canManageTasks) {
      setError("Only Project Manager and Site Engineer can create tasks.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/tasks", { ...payload, projectId: selectedProjectId });
      await fetchProjectData(selectedProjectId);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateTask(taskId, payload) {
    if (!canManageTasks) {
      setError("Only Project Manager and Site Engineer can update tasks.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.patch(`/tasks/${taskId}`, payload);
      await fetchProjectData(selectedProjectId);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateLog(payload) {
    if (!selectedProjectId) return;
    if (!canManageLogs) {
      setError("Only Project Manager and Site Engineer can add daily logs.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/daily-logs", { ...payload, projectId: selectedProjectId });
      await fetchProjects();
      await fetchProjectData(selectedProjectId);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleOcrUpload(file) {
    if (!selectedProjectId) {
      setError("Select a project before OCR upload.");
      return;
    }
    if (!canManageLogs) {
      setError("Only Project Manager and Site Engineer can upload OCR documents.");
      return;
    }
    setOcrLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("projectId", selectedProjectId);
      const { data } = await api.post("/intelligence/ocr", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setOcrResult(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setOcrLoading(false);
    }
  }

  async function handlePredictDelay() {
    if (!selectedProjectId) {
      setError("Select a project before running prediction.");
      return;
    }
    setPredictionLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/intelligence/project/${selectedProjectId}/delay-prediction`);
      setDelayPrediction(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setPredictionLoading(false);
    }
  }

  function handleLogout() {
    clearSession();
  }

  if (isSessionBooting) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <h1>BuildSphere</h1>
          <p>Restoring session...</p>
        </section>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <h1>BuildSphere</h1>
          <p>Construction Project Intelligence (MERN)</p>
          <form onSubmit={handleAuthSubmit} className="auth-form">
            {isRegister ? (
              <>
                <input
                  name="name"
                  placeholder="Full Name"
                  value={auth.name}
                  onChange={handleAuthChange}
                  required
                />
                <select name="role" value={auth.role} onChange={handleAuthChange}>
                  <option value="project_manager">Project Manager</option>
                  <option value="site_engineer">Site Engineer</option>
                  <option value="vendor">Vendor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </>
            ) : null}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={auth.email}
              onChange={handleAuthChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={auth.password}
              onChange={handleAuthChange}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}
            </button>
          </form>
          <button className="link-btn" onClick={() => setIsRegister((prev) => !prev)}>
            {isRegister ? "Already registered? Login" : "New user? Register"}
          </button>
          {error ? <p className="error-text">{error}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="app-container">
        <header className="topbar">
          <div>
            <h1>BuildSphere Command Center</h1>
            <p>
              Logged in as {user?.name} ({user?.role})
            </p>
          </div>
          <button onClick={handleLogout}>Logout</button>
        </header>

        <section className="project-context">
          <span className="context-label">Selected Project</span>
          <span className="context-value">{selectedProject?.name || "No project selected"}</span>
        </section>

        <section className="metrics-row">
          <MetricCard label="Projects" value={projects.length} />
          <MetricCard label="Open Tasks" value={insights?.metrics?.openTasks ?? 0} />
          <MetricCard label="Risk Score" value={insights?.riskScore ?? 0} />
          <MetricCard label="Progress" value={`${selectedProject?.progress ?? 0}%`} />
        </section>

        {error ? <p className="error-text">{error}</p> : null}

        <section className="layout-grid">
          <aside className="left-column">
            <ProjectForm onCreate={handleCreateProject} loading={loading} canCreate={canManageProjects} />

            <section className="card">
              <h3>Projects</h3>
              <div className="project-list">
                {projects.map((project) => (
                  <button
                    key={project._id}
                    className={`project-item ${project._id === selectedProjectId ? "active" : ""}`}
                    onClick={() => setSelectedProjectId(project._id)}
                  >
                    <strong>{project.name}</strong>
                    <span>
                      {project.location} | {project.progress}% | {project.status}
                    </span>
                  </button>
                ))}
                {projects.length === 0 ? <p>No projects yet.</p> : null}
              </div>
            </section>
          </aside>

          <section className="right-column">
            <RolePermissionsCard role={user?.role} />
            <OcrIngestionCard
              disabled={!selectedProjectId}
              canUpload={canManageLogs}
              loading={ocrLoading}
              onUpload={handleOcrUpload}
              result={ocrResult}
            />
            <DelayPredictionCard
              disabled={!selectedProjectId}
              loading={predictionLoading}
              onPredict={handlePredictDelay}
              prediction={delayPrediction}
            />
            <TaskBoard
              tasks={tasks}
              onCreateTask={handleCreateTask}
              onUpdateTask={handleUpdateTask}
              loading={loading}
              canCreate={canManageTasks}
              canUpdate={canManageTasks}
            />
            <DailyLogForm
              onCreateLog={handleCreateLog}
              logs={logs}
              loading={loading}
              canCreate={canManageLogs}
            />
            <RiskPanel insights={insights} />
          </section>
        </section>
      </div>
    </main>
  );
}

export default App;
