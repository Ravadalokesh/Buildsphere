import React from "react";

const initialTask = {
  title: "",
  description: "",
  category: "execution",
  priority: "medium",
  status: "todo",
  assignee: "",
  dueDate: ""
};

export default function TaskBoard({ tasks, onCreateTask, onUpdateTask, loading, canCreate, canUpdate }) {
  const [task, setTask] = React.useState(initialTask);

  function handleChange(event) {
    const { name, value } = event.target;
    setTask((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canCreate) return;
    await onCreateTask(task);
    setTask(initialTask);
  }

  return (
    <section className="card">
      <h3>Task Workflow</h3>
      {!canCreate ? (
        <p className="hint-text">Only Project Manager and Site Engineer can create or update tasks.</p>
      ) : null}
      <form onSubmit={handleSubmit} className="inline-form">
        <input
          name="title"
          value={task.title}
          onChange={handleChange}
          placeholder="Task Title"
          required
          disabled={!canCreate}
        />
        <input
          name="assignee"
          value={task.assignee}
          onChange={handleChange}
          placeholder="Assignee"
          disabled={!canCreate}
        />
        <input
          name="description"
          value={task.description}
          onChange={handleChange}
          placeholder="Description (optional)"
          disabled={!canCreate}
        />
        <select name="category" value={task.category} onChange={handleChange} disabled={!canCreate}>
          <option value="procurement">Procurement</option>
          <option value="execution">Execution</option>
          <option value="qa_qc">QA/QC</option>
          <option value="safety">Safety</option>
          <option value="billing">Billing</option>
        </select>
        <select name="priority" value={task.priority} onChange={handleChange} disabled={!canCreate}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select name="status" value={task.status} onChange={handleChange} disabled={!canCreate}>
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="blocked">Blocked</option>
          <option value="done">Done</option>
        </select>
        <input type="date" name="dueDate" value={task.dueDate} onChange={handleChange} disabled={!canCreate} />
        <button type="submit" disabled={loading || !canCreate}>
          Add Task
        </button>
      </form>

      <div className="task-list">
        {tasks.map((item) => (
          <div className="task-row" key={item._id}>
            <div className="task-info">
              <strong>{item.title}</strong>
              <p className="task-meta">
                {item.category} | Priority: {item.priority} | Assignee: {item.assignee || "NA"}
              </p>
              <p className="task-meta">
                Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "NA"}
              </p>
              {item.description ? <p className="task-desc">{item.description}</p> : null}
            </div>
            <select
              value={item.status}
              className="status-select"
              disabled={!canUpdate}
              onChange={(event) => onUpdateTask(item._id, { status: event.target.value })}
            >
              <option value="todo">Todo</option>
              <option value="in_progress">In Progress</option>
              <option value="blocked">Blocked</option>
              <option value="done">Done</option>
            </select>
          </div>
        ))}
        {tasks.length === 0 ? <p>No tasks yet.</p> : null}
      </div>
    </section>
  );
}
