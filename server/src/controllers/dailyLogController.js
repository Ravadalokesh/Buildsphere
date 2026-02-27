const { z } = require("zod");
const DailyLog = require("../models/DailyLog");
const Project = require("../models/Project");

const createLogSchema = z.object({
  projectId: z.string(),
  date: z.string().optional(),
  plannedProgress: z.number().min(0).max(100),
  actualProgress: z.number().min(0).max(100),
  manpower: z.number().min(0).optional(),
  weather: z.enum(["clear", "rain", "storm", "heatwave", "unknown"]).optional(),
  safetyIncidents: z.number().min(0).optional(),
  blockers: z.array(z.string()).optional(),
  notes: z.string().optional()
});

async function createLog(req, res, next) {
  try {
    const data = createLogSchema.parse(req.body);
    const project = await Project.findById(data.projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const log = await DailyLog.create(data);

    if (typeof data.actualProgress === "number") {
      project.progress = data.actualProgress;
      if (project.progress >= 100) project.status = "completed";
      await project.save();
    }

    return res.status(201).json(log);
  } catch (error) {
    return next(error);
  }
}

async function listLogs(req, res, next) {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      return res.status(400).json({ message: "projectId query param is required" });
    }
    const logs = await DailyLog.find({ projectId }).sort({ date: -1, createdAt: -1 });
    return res.json(logs);
  } catch (error) {
    return next(error);
  }
}

module.exports = { createLog, listLogs };
