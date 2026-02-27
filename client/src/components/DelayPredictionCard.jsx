export default function DelayPredictionCard({ disabled, loading, onPredict, prediction }) {
  return (
    <section className="card">
      <h3>Predictive Delay ML (Baseline)</h3>
      <p className="hint-text">
        Generates delay days, probability, confidence, and drivers from current project signals.
      </p>
      <button onClick={onPredict} disabled={disabled || loading}>
        {loading ? "Predicting..." : "Run Delay Prediction"}
      </button>

      {prediction ? (
        <div className="intelligence-output">
          <div className="prediction-grid">
            <p>
              <strong>Predicted delay days:</strong> {prediction.prediction.predictedDelayDays}
            </p>
            <p>
              <strong>Delay probability:</strong> {Math.round(prediction.prediction.delayProbability * 100)}%
            </p>
            <p>
              <strong>Risk band:</strong> {prediction.prediction.riskBand.toUpperCase()}
            </p>
            <p>
              <strong>Confidence:</strong> {prediction.prediction.confidence.toUpperCase()}
            </p>
          </div>
          <p>
            <strong>Main drivers:</strong>{" "}
            {prediction.drivers.slice(0, 3).map((item) => item.factor).join(", ") || "NA"}
          </p>
          <p>
            <strong>Recommendation:</strong> {prediction.recommendations[0]}
          </p>
        </div>
      ) : null}
    </section>
  );
}
