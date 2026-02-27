const mongoose = require("mongoose");

const dailyLogSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },
    date: { type: Date, default: Date.now },
    plannedProgress: { type: Number, min: 0, max: 100, required: true },
    actualProgress: { type: Number, min: 0, max: 100, required: true },
    manpower: { type: Number, min: 0, default: 0 },
    weather: {
      type: String,
      enum: ["clear", "rain", "storm", "heatwave", "unknown"],
      default: "unknown"
    },
    safetyIncidents: { type: Number, min: 0, default: 0 },
    blockers: [{ type: String }],
    notes: { type: String, trim: true }
  },
  { timestamps: true }
);

const DailyLog = mongoose.model("DailyLog", dailyLogSchema);

module.exports = DailyLog;
