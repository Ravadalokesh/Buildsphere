export default function RiskPanel({ insights }) {
  if (!insights) {
    return (
      <section className="card">
        <h3>Risk Panel</h3>
        <p className="hint-text">Create tasks and logs to generate project risk insights.</p>
      </section>
    );
  }

  return (
    <section className="card">
      <h3>Risk Panel</h3>
      <div className="risk-header">
        <p>
          Risk Score: <strong>{insights.riskScore}</strong>
        </p>
        <span className={`risk-pill risk-${insights.riskLevel}`}>{insights.riskLevel.toUpperCase()}</span>
      </div>

      <div className="risk-metrics">
        <p>Open Tasks: {insights.metrics.openTasks}</p>
        <p>Blocked Tasks: {insights.metrics.blockedTasks}</p>
        <p>Delayed Tasks: {insights.metrics.delayedTasks}</p>
        <p>Schedule Gap: {insights.metrics.scheduleGap}%</p>
        <p>Safety Incidents: {insights.metrics.safetyIncidents}</p>
      </div>

      <strong>Recommendations</strong>
      <ul className="recommendation-list">
        {insights.recommendations.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
