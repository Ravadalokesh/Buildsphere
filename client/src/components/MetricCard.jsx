export default function MetricCard({ label, value }) {
  return (
    <div className="metric-card">
      <p className="metric-label">{label}</p>
      <h3 className="metric-value">{value}</h3>
    </div>
  );
}
