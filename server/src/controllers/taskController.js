const { z } = require("zod");
const Task = require("../models/Task");
const Project = require("../models/Project");

const createTaskSchema = z.object({
  projectId: z.string(),
  title: z.string().min(3),
  description: z.string().optional(),
  category: z
    .enum(["procurement", "execution", "qa_qc", "safety", "billing"])
    .optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  status: z.enum(["todo", "in_progress", "blocked", "done"]).optional(),
  assignee: z.string().optional(),
  dueDate: z.string().optional()
});

const updateTaskSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  category: z.enum(["procurement", "execution", "qa_qc", "safety", "billing"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  status: z.enum(["todo", "in_progress", "blocked", "done"]).optional(),
  assignee: z.string().optional(),
  dueDate: z.string().optional()
});

async function createTask(req, res, next) {
  try {
    const data = createTaskSchema.parse(req.body);

    const project = await Project.findById(data.projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const task = await Task.create(data);
    return res.status(201).json(task);
  } catch (error) {
    return next(error);
  }
}

async function listTasks(req, res, next) {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      return res.status(400).json({ message: "projectId query param is required" });
    }
    const tasks = await Task.find({ projectId }).sort({ createdAt: -1 });
    return res.json(tasks);
  } catch (error) {
    return next(error);
  }
}

async function updateTask(req, res, next) {
  try {
    const data = updateTaskSchema.parse(req.body);
    if (data.status === "done") data.completedAt = new Date();

    const task = await Task.findByIdAndUpdate(req.params.taskId, data, { new: true });
    if (!task) return res.status(404).json({ message: "Task not found" });
    return res.json(task);
  } catch (error) {
    return next(error);
  }
}

module.exports = { createTask, listTasks, updateTask };
