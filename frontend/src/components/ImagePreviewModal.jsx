import { createPortal } from "react-dom";
import { FaTimes, FaExternalLinkAlt } from "react-icons/fa";
import "./ImagePreviewModal.css";

export default function ImagePreviewModal({ image, alt = "Report image", onClose }) {
  if (!image) return null;

  return createPortal(
    <div className="image-preview-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="image-preview-modal" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          className="image-preview-close"
          onClick={onClose}
          aria-label="Close image preview"
        >
          <FaTimes />
        </button>

        <img src={image} alt={alt} />

        <div className="image-preview-actions">
          <span>Full image preview</span>
          <a href={image} target="_blank" rel="noreferrer">
            <FaExternalLinkAlt /> Open in new tab
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
}
