const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const dailyLogRoutes = require("./routes/dailyLogRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const intelligenceRoutes = require("./routes/intelligenceRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "buildsphere-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/daily-logs", dailyLogRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/intelligence", intelligenceRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
