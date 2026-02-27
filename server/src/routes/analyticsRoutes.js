const express = require("express");
const { getProjectRisk } = require("../controllers/analyticsController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/project/:projectId/risk", getProjectRisk);

module.exports = router;
