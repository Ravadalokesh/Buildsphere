const Project = require("../models/Project");
const Task = require("../models/Task");
const DailyLog = require("../models/DailyLog");
const { buildRiskInsights } = require("../services/riskEngine");

async function getProjectRisk(req, res, next) {
  try {
    const { projectId } = req.params;

    const [project, tasks, logs] = await Promise.all([
      Project.findById(projectId),
      Task.find({ projectId }),
      DailyLog.find({ projectId }).sort({ date: -1 }).limit(10)
    ]);

    if (!project) return res.status(404).json({ message: "Project not found" });

    const insights = buildRiskInsights({ project, tasks, logs });
    return res.json(insights);
  } catch (error) {
    return next(error);
  }
}

module.exports = { getProjectRisk };
