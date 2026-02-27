const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: {
      type: String,
      enum: ["procurement", "execution", "qa_qc", "safety", "billing"],
      default: "execution"
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "blocked", "done"],
      default: "todo"
    },
    assignee: { type: String, trim: true },
    dueDate: { type: Date },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
