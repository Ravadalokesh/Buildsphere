const fs = require("fs/promises");
const path = require("path");
const { z } = require("zod");
const Project = require("../models/Project");
const Task = require("../models/Task");
const DailyLog = require("../models/DailyLog");
const OcrDocument = require("../models/OcrDocument");
const { buildDelayPrediction } = require("../services/delayPredictor");

const imageMimeTypes = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);
const textMimeTypes = new Set(["text/plain", "text/csv", "application/json"]);

function parseSignalsFromText(text) {
  const plannedMatch = text.match(/planned(?:\s+progress)?\s*[:=-]?\s*(\d{1,3})%?/i);
  const actualMatch = text.match(/actual(?:\s+progress)?\s*[:=-]?\s*(\d{1,3})%?/i);
  const dateMatch = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/);

  const blockers = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /blocker|delay|issue|pending/i.test(line))
    .slice(0, 5);

  return {
    plannedProgress: plannedMatch ? Number(plannedMatch[1]) : null,
    actualProgress: actualMatch ? Number(actualMatch[1]) : null,
    blockers,
    mentionedDate: dateMatch ? dateMatch[1] : ""
  };
}

async function extractTextFromFile(file) {
  if (textMimeTypes.has(file.mimetype)) {
    return file.buffer.toString("utf8");
  }

  if (imageMimeTypes.has(file.mimetype)) {
    const { createWorker } = require("tesseract.js");
    const worker = await createWorker("eng");
    try {
      const { data } = await worker.recognize(file.buffer);
      return data.text || "";
    } finally {
      await worker.terminate();
    }
  }

  const unsupportedError = new Error("Unsupported file type. Use image or text files.");
  unsupportedError.statusCode = 415;
  throw unsupportedError;
}

async function ingestOcrDocument(req, res, next) {
  try {
    const projectId = req.body?.projectId || null;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Document file is required" });
    }

    if (projectId) {
      const parsed = z.string().parse(projectId);
      const project = await Project.findById(parsed);
      if (!project) return res.status(404).json({ message: "Project not found" });
    }

    const uploadDir = path.join(__dirname, "../../uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const extension = path.extname(file.originalname) || ".bin";
    const storedFileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extension}`;
    const storagePath = path.join(uploadDir, storedFileName);
    await fs.writeFile(storagePath, file.buffer);

    let extractedText = "";
    try {
      extractedText = await extractTextFromFile(file);
    } catch (error) {
      const ocrError = new Error(
        `OCR extraction failed: ${error.message}. For demo, upload .txt/.csv or clear images.`
      );
      ocrError.statusCode = error.statusCode || 422;
      throw ocrError;
    }

    const parsedSignals = parseSignalsFromText(extractedText);

    const document = await OcrDocument.create({
      projectId,
      uploadedBy: req.user.id,
      originalFileName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      storagePath,
      extractedText,
      parsedSignals
    });

    return res.status(201).json({
      document: {
        id: document._id,
        originalFileName: document.originalFileName,
        mimeType: document.mimeType,
        sizeBytes: document.sizeBytes,
        uploadedAt: document.createdAt
      },
      ocr: {
        textLength: extractedText.length,
        textPreview: extractedText.slice(0, 350)
      },
      parsedSignals
    });
  } catch (error) {
    return next(error);
  }
}

async function predictDelay(req, res, next) {
  try {
    const { projectId } = req.params;
    const [project, tasks, logs] = await Promise.all([
      Project.findById(projectId),
      Task.find({ projectId }),
      DailyLog.find({ projectId }).sort({ date: -1 }).limit(20)
    ]);

    if (!project) return res.status(404).json({ message: "Project not found" });

    const prediction = buildDelayPrediction({ project, tasks, logs });
    return res.json(prediction);
  } catch (error) {
    return next(error);
  }
}

module.exports = { ingestOcrDocument, predictDelay };
