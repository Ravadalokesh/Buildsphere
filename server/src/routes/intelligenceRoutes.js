const express = require("express");
const multer = require("multer");
const { protect, authorize } = require("../middleware/auth");
const { ingestOcrDocument, predictDelay } = require("../controllers/intelligenceController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }
});

router.use(protect);

router.post(
  "/ocr",
  authorize("project_manager", "site_engineer"),
  upload.single("document"),
  ingestOcrDocument
);

router.get("/project/:projectId/delay-prediction", predictDelay);

module.exports = router;
