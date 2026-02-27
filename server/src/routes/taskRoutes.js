const express = require("express");
const { createTask, listTasks, updateTask } = require("../controllers/taskController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/", listTasks);
router.post("/", authorize("project_manager", "site_engineer"), createTask);
router.patch("/:taskId", authorize("project_manager", "site_engineer"), updateTask);

module.exports = router;
