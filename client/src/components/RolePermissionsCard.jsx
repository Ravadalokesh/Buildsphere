const actionLabels = [
  { key: "projects", label: "Create or update projects" },
  { key: "tasks", label: "Create or update tasks" },
  { key: "logs", label: "Add daily site logs" },
  { key: "read", label: "View dashboard and risk insights" }
];

const rolePermissions = {
  project_manager: { projects: true, tasks: true, logs: true, read: true },
  site_engineer: { projects: false, tasks: true, logs: true, read: true },
  vendor: { projects: false, tasks: false, logs: false, read: true },
  viewer: { projects: false, tasks: false, logs: false, read: true }
};

const roleLabel = {
  project_manager: "Project Manager",
  site_engineer: "Site Engineer",
  vendor: "Vendor",
  viewer: "Viewer"
};

export default function RolePermissionsCard({ role }) {
  const currentRole = role || "viewer";
  const currentPermissions = rolePermissions[currentRole] || rolePermissions.viewer;

  return (
    <section className="card">
      <h3>Role Permissions</h3>
      <p className="hint-text">
        Signed in as <strong>{roleLabel[currentRole] || currentRole}</strong>
      </p>

      <div className="permission-grid">
        {actionLabels.map((action) => (
          <div className="permission-row" key={action.key}>
            <span>{action.label}</span>
            <span className={currentPermissions[action.key] ? "permission-yes" : "permission-no"}>
              {currentPermissions[action.key] ? "Allowed" : "Not allowed"}
            </span>
          </div>
        ))}
      </div>

      <p className="hint-text">
        Intelligence enabled: OCR document ingestion and predictive delay ML baseline.
      </p>
    </section>
  );
}
