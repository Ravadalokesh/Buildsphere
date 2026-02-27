const { z } = require("zod");
const Project = require("../models/Project");

const createProjectSchema = z.object({
  name: z.string().min(3),
  client: z.string().min(2),
  location: z.string().min(2),
  startDate: z.string(),
  endDate: z.string(),
  budget: z.number().nonnegative(),
  status: z.enum(["planning", "active", "delayed", "completed"]).optional(),
  progress: z.number().min(0).max(100).optional()
});

const updateProjectSchema = z.object({
  status: z.enum(["planning", "active", "delayed", "completed"]).optional(),
  progress: z.number().min(0).max(100).optional(),
  budget: z.number().nonnegative().optional()
});

async function createProject(req, res, next) {
  try {
    const data = createProjectSchema.parse(req.body);
    const project = await Project.create({
      ...data,
      createdBy: req.user.id
    });
    return res.status(201).json(project);
  } catch (error) {
    return next(error);
  }
}

async function listProjects(req, res, next) {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    return res.json(projects);
  } catch (error) {
    return next(error);
  }
}

async function getProject(req, res, next) {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });
    return res.json(project);
  } catch (error) {
    return next(error);
  }
}

async function updateProject(req, res, next) {
  try {
    const data = updateProjectSchema.parse(req.body);
    const project = await Project.findByIdAndUpdate(req.params.projectId, data, {
      new: true
    });
    if (!project) return res.status(404).json({ message: "Project not found" });
    return res.json(project);
  } catch (error) {
    return next(error);
  }
}

module.exports = { createProject, listProjects, getProject, updateProject };
