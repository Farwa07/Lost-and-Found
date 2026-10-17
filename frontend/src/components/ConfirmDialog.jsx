import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaExclamationTriangle } from "react-icons/fa";
import { CONFIRM_EVENT } from "../utils/notify";
import "./ConfirmDialog.css";

export default function ConfirmDialogHost() {
  const [dialog, setDialog] = useState(null);
  const confirmButtonRef = useRef(null);

  const close = useCallback(
    (result) => {
      dialog?.resolve(result);
      setDialog(null);
    },
    [dialog]
  );

  useEffect(() => {
    const handleConfirm = (event) => setDialog(event.detail);
    window.addEventListener(CONFIRM_EVENT, handleConfirm);
    return () => window.removeEventListener(CONFIRM_EVENT, handleConfirm);
  }, []);

  useEffect(() => {
    if (!dialog) return undefined;

    confirmButtonRef.current?.focus();

    const handleKey = (event) => {
      if (event.key === "Escape") close(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [dialog, close]);

  if (!dialog) return null;

  return createPortal(
    <div className="confirm-overlay" onClick={() => close(false)}>
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={`confirm-dialog__icon ${dialog.danger ? "is-danger" : ""}`}>
          <FaExclamationTriangle aria-hidden="true" />
        </div>
        <h2 id="confirm-title">{dialog.title}</h2>
        <p id="confirm-message">{dialog.message}</p>
        <div className="confirm-dialog__actions">
          <button type="button" className="confirm-dialog__cancel" onClick={() => close(false)}>
            {dialog.cancelText}
          </button>
          <button
            type="button"
            ref={confirmButtonRef}
            className={`confirm-dialog__confirm ${dialog.danger ? "is-danger" : ""}`}
            onClick={() => close(true)}
          >
            {dialog.confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
