function sigmoid(value) {
  return 1 / (1 + Math.exp(-value));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function buildDelayPrediction({ project, tasks, logs }) {
  const openTasks = tasks.filter((task) => task.status !== "done");
  const blockedTasks = tasks.filter((task) => task.status === "blocked");
  const delayedTasks = tasks.filter((task) => {
    if (!task.dueDate || task.status === "done") return false;
    return new Date(task.dueDate).getTime() < Date.now();
  });
  const highPriorityOpen = tasks.filter(
    (task) => task.status !== "done" && task.priority === "high"
  );

  const latestLog = logs[0];
  const scheduleGap = latestLog
    ? Math.max(0, latestLog.plannedProgress - latestLog.actualProgress)
    : 0;
  const recentLogs = logs.slice(0, 5);
  const safetyIncidents = recentLogs.reduce(
    (total, log) => total + (log.safetyIncidents || 0),
    0
  );
  const weatherRisk = recentLogs.reduce((total, log) => {
    if (log.weather === "storm") return total + 2;
    if (log.weather === "rain" || log.weather === "heatwave") return total + 1;
    return total;
  }, 0);

  const budgetScale = clamp((project.budget || 0) / 100000000, 0, 3);

  const rawScore =
    -1.4 +
    scheduleGap * 0.09 +
    blockedTasks.length * 0.45 +
    delayedTasks.length * 0.3 +
    highPriorityOpen.length * 0.22 +
    safetyIncidents * 0.18 +
    weatherRisk * 0.16 +
    budgetScale * 0.15;

  const delayProbability = clamp(sigmoid(rawScore), 0.02, 0.98);
  const predictedDelayDays = Math.max(
    0,
    Math.round(
      delayProbability * 30 +
        scheduleGap * 0.6 +
        blockedTasks.length * 1.5 +
        delayedTasks.length * 1.2
    )
  );

  let confidence = "low";
  if (logs.length >= 5) confidence = "high";
  else if (logs.length >= 2) confidence = "medium";

  let riskBand = "low";
  if (delayProbability >= 0.7) riskBand = "high";
  else if (delayProbability >= 0.4) riskBand = "medium";

  const drivers = [
    { factor: "Schedule variance", value: scheduleGap, impact: scheduleGap * 0.09 },
    { factor: "Blocked tasks", value: blockedTasks.length, impact: blockedTasks.length * 0.45 },
    { factor: "Delayed tasks", value: delayedTasks.length, impact: delayedTasks.length * 0.3 },
    { factor: "High-priority open tasks", value: highPriorityOpen.length, impact: highPriorityOpen.length * 0.22 },
    { factor: "Recent safety incidents", value: safetyIncidents, impact: safetyIncidents * 0.18 },
    { factor: "Recent weather disruption", value: weatherRisk, impact: weatherRisk * 0.16 }
  ]
    .filter((item) => item.value > 0)
    .sort((a, b) => b.impact - a.impact);

  const recommendations = [];
  if (scheduleGap > 0) {
    recommendations.push("Run rolling 2-week lookahead with daily variance closure.");
  }
  if (blockedTasks.length > 0) {
    recommendations.push("Escalate and clear blocked dependencies within 24 hours.");
  }
  if (delayedTasks.length > 0) {
    recommendations.push("Prioritize delayed tasks to avoid critical path spillover.");
  }
  if (safetyIncidents > 0) {
    recommendations.push("Execute targeted EHS intervention before next high-risk activity.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Maintain current execution rhythm and monitor lag indicators daily.");
  }

  return {
    project: {
      id: project._id,
      name: project.name,
      progress: project.progress,
      status: project.status
    },
    features: {
      openTasks: openTasks.length,
      blockedTasks: blockedTasks.length,
      delayedTasks: delayedTasks.length,
      highPriorityOpen: highPriorityOpen.length,
      scheduleGap,
      safetyIncidents,
      weatherRisk
    },
    prediction: {
      predictedDelayDays,
      delayProbability: Number(delayProbability.toFixed(3)),
      riskBand,
      confidence
    },
    drivers,
    recommendations
  };
}

module.exports = { buildDelayPrediction };
