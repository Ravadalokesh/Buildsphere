const express = require("express");
const {
  createProject,
  listProjects,
  getProject,
  updateProject
} = require("../controllers/projectController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/", listProjects);
router.post("/", authorize("project_manager"), createProject);
router.get("/:projectId", getProject);
router.patch("/:projectId", authorize("project_manager"), updateProject);

module.exports = router;
