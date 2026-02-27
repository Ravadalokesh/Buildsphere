function buildRiskInsights({ project, tasks, logs }) {
  const openTasks = tasks.filter((task) => task.status !== "done");
  const blockedTasks = tasks.filter((task) => task.status === "blocked");
  const highPriorityOpen = tasks.filter(
    (task) => task.status !== "done" && task.priority === "high"
  );
  const delayedTasks = tasks.filter((task) => {
    if (!task.dueDate || task.status === "done") return false;
    return new Date(task.dueDate).getTime() < Date.now();
  });

  const lastLog = logs[0];
  const scheduleGap = lastLog
    ? Math.max(0, lastLog.plannedProgress - lastLog.actualProgress)
    : 0;

  const previousLog = logs[1];
  const previousGap = previousLog
    ? Math.max(0, previousLog.plannedProgress - previousLog.actualProgress)
    : 0;
  const scheduleGapTrend = scheduleGap - previousGap;

  const recentLogs = logs.slice(0, 3);
  const recentSafetyIncidents = recentLogs.reduce(
    (total, log) => total + (log.safetyIncidents || 0),
    0
  );

  let score = 0;
  if (scheduleGap >= 15) score += 35;
  else if (scheduleGap >= 8) score += 20;
  else if (scheduleGap >= 5) score += 10;

  score += Math.min(blockedTasks.length * 8, 24);
  score += Math.min(highPriorityOpen.length * 5, 20);
  score += Math.min(delayedTasks.length * 5, 15);
  score += Math.min(recentSafetyIncidents * 6, 18);
  if (scheduleGapTrend >= 3) score += 8;

  const normalized = Math.min(100, score);

  let level = "low";
  if (normalized >= 60) level = "high";
  else if (normalized >= 30) level = "medium";

  const recommendations = [];
  if (scheduleGap >= 8) {
    recommendations.push("Immediate recovery plan required with milestone-by-milestone tracking.");
  } else if (scheduleGap > 0) {
    recommendations.push("Track schedule variance daily and run focused catch-up planning.");
  }
  if (scheduleGapTrend >= 3) {
    recommendations.push("Schedule gap is worsening. Activate night shift or parallel work fronts.");
  }
  if (blockedTasks.length > 0) {
    recommendations.push("Escalate blocked tasks to project manager and assign owners.");
  }
  if (delayedTasks.length > 0) {
    recommendations.push("Resolve delayed tasks first to avoid cascading timeline impact.");
  }
  if (highPriorityOpen.length > 2) {
    recommendations.push("Prioritize high-impact execution tasks for next 48 hours.");
  }
  if (recentSafetyIncidents >= 2) {
    recommendations.push("Immediate EHS intervention required before continuing high-risk activities.");
  } else if (recentSafetyIncidents > 0) {
    recommendations.push("Conduct toolbox talk and enforce daily safety checklist.");
  }
  if (normalized >= 70) {
    recommendations.push("Run executive war-room review until risk drops below medium.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Project is stable. Continue daily monitoring and variance checks.");
  }

  return {
    project: {
      id: project._id,
      name: project.name,
      status: project.status,
      progress: project.progress
    },
    metrics: {
      openTasks: openTasks.length,
      blockedTasks: blockedTasks.length,
      delayedTasks: delayedTasks.length,
      scheduleGap,
      safetyIncidents: recentSafetyIncidents
    },
    riskScore: normalized,
    riskLevel: level,
    recommendations
  };
}

module.exports = { buildRiskInsights };
