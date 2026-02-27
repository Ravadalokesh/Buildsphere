const express = require("express");
const { createLog, listLogs } = require("../controllers/dailyLogController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/", listLogs);
router.post("/", authorize("project_manager", "site_engineer"), createLog);

module.exports = router;
