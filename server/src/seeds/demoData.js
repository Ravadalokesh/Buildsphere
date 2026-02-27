require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Project = require("../models/Project");
const Task = require("../models/Task");
const DailyLog = require("../models/DailyLog");

async function seedDemo() {
  await connectDB();

  const demoEmail = "pm.demo@buildsphere.com";
  const demoPassword = "Demo@123";
  const demoProjectName = "Hyderabad Tech Park Tower A";

  const existingProject = await Project.findOne({ name: demoProjectName });
  if (existingProject) {
    await Task.deleteMany({ projectId: existingProject._id });
    await DailyLog.deleteMany({ projectId: existingProject._id });
    await Project.deleteOne({ _id: existingProject._id });
  }

  let demoUser = await User.findOne({ email: demoEmail });
  if (demoUser) {
    await User.deleteOne({ _id: demoUser._id });
  }

  demoUser = await User.create({
    name: "Ravi Kumar",
    email: demoEmail,
    password: demoPassword,
    role: "project_manager"
  });

  const project = await Project.create({
    name: "Hyderabad Tech Park Tower A",
    client: "Infranova Realty Pvt Ltd",
    location: "HITEC City, Hyderabad",
    startDate: new Date("2025-09-01"),
    endDate: new Date("2026-08-31"),
    budget: 185000000,
    status: "active",
    progress: 42,
    createdBy: demoUser._id
  });

  await Task.insertMany([
    {
      projectId: project._id,
      title: "Basement slab concrete - Block B2",
      description: "Complete concrete pour and vibration for B2 segment.",
      category: "execution",
      priority: "high",
      status: "done",
      assignee: "Civil Team A",
      dueDate: new Date("2026-01-28"),
      completedAt: new Date("2026-01-27")
    },
    {
      projectId: project._id,
      title: "Rebar procurement for podium floor",
      description: "Vendor finalization and PO release for TMT steel.",
      category: "procurement",
      priority: "high",
      status: "blocked",
      assignee: "Procurement Lead",
      dueDate: new Date("2026-02-15")
    },
    {
      projectId: project._id,
      title: "MEP sleeves inspection - Zone 3",
      description: "QA check before slab casting.",
      category: "qa_qc",
      priority: "medium",
      status: "in_progress",
      assignee: "QA Engineer",
      dueDate: new Date("2026-03-03")
    },
    {
      projectId: project._id,
      title: "Safety harness compliance audit",
      description: "Weekly audit for work-at-height areas.",
      category: "safety",
      priority: "high",
      status: "todo",
      assignee: "EHS Officer",
      dueDate: new Date("2026-02-22")
    },
    {
      projectId: project._id,
      title: "Subcontractor RA bill verification",
      description: "Validate quantities for February billing cycle.",
      category: "billing",
      priority: "medium",
      status: "todo",
      assignee: "QS Team",
      dueDate: new Date("2026-02-20")
    }
  ]);

  await DailyLog.insertMany([
    {
      projectId: project._id,
      date: new Date("2026-02-21"),
      plannedProgress: 44,
      actualProgress: 41,
      manpower: 126,
      weather: "clear",
      safetyIncidents: 0,
      blockers: ["Rebar delivery pending from vendor"],
      notes: "Formwork completed in Zone 2."
    },
    {
      projectId: project._id,
      date: new Date("2026-02-22"),
      plannedProgress: 45,
      actualProgress: 41,
      manpower: 109,
      weather: "rain",
      safetyIncidents: 1,
      blockers: ["Rain interruption", "Scaffolding rework in podium edge"],
      notes: "Concrete pour moved to next day."
    },
    {
      projectId: project._id,
      date: new Date("2026-02-23"),
      plannedProgress: 46,
      actualProgress: 42,
      manpower: 133,
      weather: "clear",
      safetyIncidents: 0,
      blockers: ["Mechanical pump availability limited"],
      notes: "Partial recovery achieved."
    }
  ]);

  console.log("Demo seed completed.");
  console.log(`Login Email: ${demoEmail}`);
  console.log(`Login Password: ${demoPassword}`);
  console.log(`Project: ${project.name}`);
  console.log(`ProjectId: ${project._id}`);
}

seedDemo()
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
