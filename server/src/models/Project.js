const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    client: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    budget: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["planning", "active", "delayed", "completed"],
      default: "planning"
    },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
