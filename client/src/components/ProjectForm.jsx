import React from "react";

const initialProject = {
  name: "",
  client: "",
  location: "",
  startDate: "",
  endDate: "",
  budget: ""
};

export default function ProjectForm({ onCreate, loading, canCreate }) {
  const [project, setProject] = React.useState(initialProject);

  function handleChange(event) {
    const { name, value } = event.target;
    setProject((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canCreate) return;
    await onCreate({
      ...project,
      budget: Number(project.budget),
      progress: 0,
      status: "planning"
    });
    setProject(initialProject);
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h3>Create Project</h3>
      {!canCreate ? <p className="hint-text">Only Project Manager can create projects.</p> : null}
      <input
        name="name"
        value={project.name}
        onChange={handleChange}
        placeholder="Project Name"
        required
        disabled={!canCreate}
      />
      <input
        name="client"
        value={project.client}
        onChange={handleChange}
        placeholder="Client Name"
        required
        disabled={!canCreate}
      />
      <input
        name="location"
        value={project.location}
        onChange={handleChange}
        placeholder="Location"
        required
        disabled={!canCreate}
      />
      <label>
        Start Date
        <input
          type="date"
          name="startDate"
          value={project.startDate}
          onChange={handleChange}
          required
          disabled={!canCreate}
        />
      </label>
      <label>
        End Date
        <input
          type="date"
          name="endDate"
          value={project.endDate}
          onChange={handleChange}
          required
          disabled={!canCreate}
        />
      </label>
      <input
        type="number"
        name="budget"
        value={project.budget}
        onChange={handleChange}
        placeholder="Budget"
        min="0"
        required
        disabled={!canCreate}
      />
      <button type="submit" disabled={loading || !canCreate}>
        {loading ? "Saving..." : "Create"}
      </button>
    </form>
  );
}
