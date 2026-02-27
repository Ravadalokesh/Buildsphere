import React from "react";

const initialLog = {
  plannedProgress: "",
  actualProgress: "",
  manpower: "",
  weather: "unknown",
  safetyIncidents: "",
  notes: "",
  blockersText: ""
};

export default function DailyLogForm({ onCreateLog, logs, loading, canCreate }) {
  const [log, setLog] = React.useState(initialLog);

  function handleChange(event) {
    const { name, value } = event.target;
    setLog((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canCreate) return;
    const blockers = log.blockersText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    await onCreateLog({
      plannedProgress: Number(log.plannedProgress),
      actualProgress: Number(log.actualProgress),
      manpower: Number(log.manpower || 0),
      weather: log.weather,
      safetyIncidents: Number(log.safetyIncidents || 0),
      notes: log.notes,
      blockers
    });
    setLog(initialLog);
  }

  return (
    <section className="card">
      <h3>Daily Site Log</h3>
      {!canCreate ? <p className="hint-text">Only Project Manager and Site Engineer can add daily logs.</p> : null}
      <form onSubmit={handleSubmit} className="inline-form">
        <input
          type="number"
          name="plannedProgress"
          placeholder="Planned %"
          value={log.plannedProgress}
          onChange={handleChange}
          min="0"
          max="100"
          required
          disabled={!canCreate}
        />
        <input
          type="number"
          name="actualProgress"
          placeholder="Actual %"
          value={log.actualProgress}
          onChange={handleChange}
          min="0"
          max="100"
          required
          disabled={!canCreate}
        />
        <input
          type="number"
          name="manpower"
          placeholder="Manpower"
          value={log.manpower}
          onChange={handleChange}
          min="0"
          disabled={!canCreate}
        />
        <input
          type="number"
          name="safetyIncidents"
          placeholder="Safety Incidents"
          value={log.safetyIncidents}
          onChange={handleChange}
          min="0"
          disabled={!canCreate}
        />
        <select name="weather" value={log.weather} onChange={handleChange} disabled={!canCreate}>
          <option value="unknown">Unknown</option>
          <option value="clear">Clear</option>
          <option value="rain">Rain</option>
          <option value="storm">Storm</option>
          <option value="heatwave">Heatwave</option>
        </select>
        <input
          type="text"
          name="notes"
          placeholder="Notes (optional)"
          value={log.notes}
          onChange={handleChange}
          disabled={!canCreate}
        />
        <input
          type="text"
          name="blockersText"
          placeholder="Blockers (comma-separated)"
          value={log.blockersText}
          onChange={handleChange}
          disabled={!canCreate}
        />
        <button type="submit" disabled={loading || !canCreate}>
          Add Log
        </button>
      </form>

      <div className="log-list">
        {logs.slice(0, 5).map((item) => (
          <div key={item._id} className="log-row">
            <p>
              <strong>{new Date(item.date).toLocaleDateString()}</strong> | Planned {item.plannedProgress}% vs
              Actual {item.actualProgress}%
            </p>
            <p>
              Manpower: {item.manpower || 0} | Weather: {item.weather} | Incidents: {item.safetyIncidents || 0} |
              Blockers: {(item.blockers || []).length}
            </p>
            {item.notes ? <p className="log-note">Note: {item.notes}</p> : null}
          </div>
        ))}
        {logs.length === 0 ? <p>No logs yet.</p> : null}
      </div>
    </section>
  );
}
