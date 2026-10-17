import { createElement, useEffect, useId, useMemo, useRef, useState } from "react";
import { FaFilePdf, FaTimes, FaUpload } from "react-icons/fa";
import compressImage from "../utils/compressImage";
import { toast } from "../utils/notify";
import "./FileField.css";

const MAX_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const formatSize = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

// Upload box with drag & drop, preview, validation and in-browser image
// compression. `onChange` receives an event-like object ({ target: { name, files } })
// so existing handleFileChange(e) handlers keep working.
export default function FileField({
  name,
  label,
  icon = FaUpload,
  hint,
  file,
  onChange,
  required = false,
  allowPdf = false,
}) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const allowedTypes = allowPdf ? [...IMAGE_TYPES, "application/pdf"] : IMAGE_TYPES;

  const preview = useMemo(
    () => (file?.type?.startsWith("image/") ? URL.createObjectURL(file) : ""),
    [file]
  );

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  // Clear the native input when the parent resets the form.
  useEffect(() => {
    if (!file && inputRef.current) inputRef.current.value = "";
  }, [file]);

  const emit = (nextFile) => onChange({ target: { name, files: nextFile ? [nextFile] : [] } });

  const handleFile = async (selected) => {
    if (!selected) return;

    if (!allowedTypes.includes(selected.type)) {
      toast.error(allowPdf ? "Please choose a JPG, PNG, WEBP, GIF or PDF file." : "Please choose a JPG, PNG, WEBP or GIF image.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setIsProcessing(true);
    const prepared = await compressImage(selected);
    setIsProcessing(false);

    if (prepared.size > MAX_BYTES) {
      toast.error(`This file is ${formatSize(prepared.size)}. The maximum size is 5 MB.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    emit(prepared);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  const clearFile = () => {
    if (inputRef.current) inputRef.current.value = "";
    emit(null);
  };

  return (
    <div className="file-field">
      <span className="file-field__label">
        {label}
        {!required && <span className="file-field__optional"> (optional)</span>}
      </span>

      {/* Kept in the DOM (visually hidden) so the browser's required validation still works. */}
      <input
        ref={inputRef}
        id={inputId}
        className="file-field__input"
        type="file"
        name={name}
        accept={allowedTypes.join(",")}
        required={required && !file}
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      {file ? (
        <div className="file-field__selected">
          {preview ? (
            <img src={preview} alt="" className="file-field__thumb" />
          ) : (
            <span className="file-field__thumb file-field__thumb--doc">
              <FaFilePdf aria-hidden="true" />
            </span>
          )}
          <div className="file-field__meta">
            <span className="file-field__name">{file.name}</span>
            <span className="file-field__size">{formatSize(file.size)}</span>
          </div>
          <button type="button" className="file-field__remove" onClick={clearFile} aria-label={`Remove ${label}`}>
            <FaTimes aria-hidden="true" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className={`file-field__drop ${isDragging ? "is-dragging" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {createElement(icon, { className: "file-field__icon", "aria-hidden": "true" })}
          <span className="file-field__cta">
            {isProcessing ? "Preparing image..." : "Click to upload or drag a file here"}
          </span>
          <span className="file-field__hint">
            {hint || (allowPdf ? "JPG, PNG, WEBP or PDF, up to 5 MB" : "JPG, PNG or WEBP, up to 5 MB")}
          </span>
        </label>
      )}

    </div>
  );
}
