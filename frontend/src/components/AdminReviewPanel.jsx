import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBan,
  FaCheckCircle,
  FaCheckDouble,
  FaFileAlt,
  FaFlag,
  FaIdCard,
  FaTrash,
  FaUserShield,
} from "react-icons/fa";
import {
  clearAdminReportFlags,
  deleteAdminReport,
  rejectAdminReport,
  verifyAdminReport,
} from "../api/adminApi";
import { fetchReportDocument } from "../api/reportApi";
import { confirmDialog, toast } from "../utils/notify";
import { formatDisplayDate } from "../utils/reportLinks";
import ImagePreviewModal from "./ImagePreviewModal";
import "./AdminReviewPanel.css";

const STATUS_LABELS = {
  pending: "Pending review",
  verified: "Verified",
  rejected: "Rejected",
  matched: "Matched",
  closed: "Closed",
};

// Admin-only tools shown on the report details page: moderation status,
// private documents (CNIC / FIR), user flags and delete.
// `report` is the raw report returned by the API for an admin.
export default function AdminReviewPanel({ report, onChanged }) {
  const navigate = useNavigate();
  const [busyAction, setBusyAction] = useState("");
  const [documentPreview, setDocumentPreview] = useState(null);

  const status = String(report.status || "pending").toLowerCase();
  const flags = Array.isArray(report.flags) ? report.flags : [];
  const isPerson = String(report.category).toLowerCase() === "person";
  const showFir = isPerson && String(report.reportType).toLowerCase() === "lost";

  const run = async (action, task, successMessage) => {
    setBusyAction(action);
    try {
      await task();
      toast.success(successMessage);
      onChanged?.();
    } catch (error) {
      toast.error(error.message || "Action failed. Please try again.");
    } finally {
      setBusyAction("");
    }
  };

  const handleReject = async () => {
    const confirmed = await confirmDialog("The report will be hidden from the public.", {
      title: "Reject this report?",
      confirmText: "Reject",
    });
    if (confirmed) run("reject", () => rejectAdminReport(report._id), "Report rejected.");
  };

  const handleDelete = async () => {
    const confirmed = await confirmDialog(
      "This permanently deletes the report, its comments and uploaded files.",
      { title: "Delete this report?", confirmText: "Delete" }
    );
    if (!confirmed) return;

    setBusyAction("delete");
    try {
      await deleteAdminReport(report._id);
      toast.success("Report deleted.");
      navigate("/admin-panel", { replace: true });
    } catch (error) {
      toast.error(error.message || "Unable to delete the report.");
      setBusyAction("");
    }
  };

  const openDocument = async (field, label) => {
    setBusyAction(field);
    try {
      const { url, type } = await fetchReportDocument(report._id, field);
      if (type.startsWith("image/")) {
        setDocumentPreview({ src: url, alt: label });
      } else {
        window.open(url, "_blank", "noopener");
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      }
    } catch (error) {
      toast.error(error.message || `Unable to open the ${label}.`);
    } finally {
      setBusyAction("");
    }
  };

  const closePreview = () => {
    if (documentPreview?.src) URL.revokeObjectURL(documentPreview.src);
    setDocumentPreview(null);
  };

  return (
    <section className="admin-review" aria-labelledby="admin-review-heading">
      <header className="admin-review__header">
        <h2 id="admin-review-heading">
          <FaUserShield aria-hidden="true" /> Admin review
        </h2>
        <span className={`admin-review__status is-${status}`}>{STATUS_LABELS[status] || status}</span>
      </header>

      <div className="admin-review__grid">
        <div>
          <h3>Moderation</h3>
          <div className="admin-review__actions">
            <button
              type="button"
              className="admin-review__btn is-success"
              onClick={() => run("verify", () => verifyAdminReport(report._id), "Report verified and published.")}
              disabled={Boolean(busyAction) || status === "verified"}
            >
              <FaCheckCircle aria-hidden="true" /> {status === "verified" ? "Verified" : "Verify"}
            </button>
            <button
              type="button"
              className="admin-review__btn is-warning"
              onClick={handleReject}
              disabled={Boolean(busyAction) || status === "rejected"}
            >
              <FaBan aria-hidden="true" /> {status === "rejected" ? "Rejected" : "Reject"}
            </button>
            <button
              type="button"
              className="admin-review__btn is-danger"
              onClick={handleDelete}
              disabled={Boolean(busyAction)}
            >
              <FaTrash aria-hidden="true" /> Delete
            </button>
          </div>
        </div>

        <div>
          <h3>Private documents</h3>
          <div className="admin-review__actions">
            <button
              type="button"
              className="admin-review__btn"
              onClick={() => openDocument("reporterIdCardImage", "CNIC")}
              disabled={!report.reporterIdCardImage || Boolean(busyAction)}
            >
              <FaIdCard aria-hidden="true" /> {report.reporterIdCardImage ? "View CNIC" : "No CNIC"}
            </button>
            {showFir && (
              <button
                type="button"
                className="admin-review__btn"
                onClick={() => openDocument("firReportImage", "FIR report")}
                disabled={!report.firReportImage || Boolean(busyAction)}
              >
                <FaFileAlt aria-hidden="true" /> {report.firReportImage ? "View FIR" : "No FIR"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="admin-review__flags">
        <div className="admin-review__flags-header">
          <h3>
            <FaFlag aria-hidden="true" /> User flags ({flags.length})
          </h3>
          {flags.length > 0 && (
            <button
              type="button"
              className="admin-review__btn"
              onClick={() => run("flags", () => clearAdminReportFlags(report._id), "Flags cleared.")}
              disabled={Boolean(busyAction)}
            >
              <FaCheckDouble aria-hidden="true" /> Mark reviewed
            </button>
          )}
        </div>

        {flags.length === 0 ? (
          <p className="admin-review__muted">No one has flagged this report.</p>
        ) : (
          <ul>
            {flags.map((flag, index) => (
              <li key={flag._id || index}>
                <b>{flag.userName || "User"}</b>: {flag.reason || "No reason"}
                {flag.date && <span className="admin-review__muted"> · {formatDisplayDate(flag.date)}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <ImagePreviewModal image={documentPreview?.src} alt={documentPreview?.alt} onClose={closePreview} />
    </section>
  );
}
