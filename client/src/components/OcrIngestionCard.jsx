import React from "react";

export default function OcrIngestionCard({
  disabled,
  canUpload,
  loading,
  onUpload,
  result
}) {
  const [file, setFile] = React.useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file || disabled || !canUpload) return;
    await onUpload(file);
    setFile(null);
    event.target.reset();
  }

  return (
    <section className="card">
      <h3>OCR Ingestion</h3>
      {!canUpload ? (
        <p className="hint-text">Only Project Manager and Site Engineer can upload OCR documents.</p>
      ) : (
        <p className="hint-text">Upload site report image or text file to extract progress signals.</p>
      )}
      <form onSubmit={handleSubmit} className="inline-form">
        <input
          type="file"
          accept=".txt,.csv,.json,image/png,image/jpeg,image/jpg,image/webp"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          disabled={disabled || !canUpload}
        />
        <button type="submit" disabled={disabled || !canUpload || loading || !file}>
          {loading ? "Processing..." : "Upload & Extract"}
        </button>
      </form>
      {file ? <p className="hint-text">Selected: {file.name}</p> : null}

      {result ? (
        <div className="intelligence-output">
          <p>
            <strong>File:</strong> {result.document.originalFileName}
          </p>
          <p>
            <strong>Extracted text chars:</strong> {result.ocr.textLength}
          </p>
          <p>
            <strong>Parsed planned/actual:</strong>{" "}
            {result.parsedSignals.plannedProgress ?? "NA"} / {result.parsedSignals.actualProgress ?? "NA"}
          </p>
          <p>
            <strong>Blockers detected:</strong> {(result.parsedSignals.blockers || []).length}
          </p>
          <p>
            <strong>Preview:</strong> {result.ocr.textPreview || "No text extracted"}
          </p>
        </div>
      ) : null}
    </section>
  );
}
