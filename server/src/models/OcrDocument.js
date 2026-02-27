const mongoose = require("mongoose");

const ocrDocumentSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    originalFileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    storagePath: { type: String, required: true },
    extractedText: { type: String, default: "" },
    parsedSignals: {
      plannedProgress: { type: Number, default: null },
      actualProgress: { type: Number, default: null },
      blockers: [{ type: String }],
      mentionedDate: { type: String, default: "" }
    }
  },
  { timestamps: true }
);

const OcrDocument = mongoose.model("OcrDocument", ocrDocumentSchema);

module.exports = OcrDocument;
