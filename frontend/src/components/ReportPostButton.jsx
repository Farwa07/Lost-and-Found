import "./ReportPostButton.css";

import { useState } from "react";
import { createPortal } from "react-dom";
import { FaFlag, FaTimes } from "react-icons/fa";
import { reportPost } from "../api/reportApi";
import { useAuth } from "../context/AuthContext";

export default function ReportPostButton({ report }) {
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");

  const getReportTitle = () => {
    return report?.title || report?.name || report?.itemName || "this post";
  };

  const getReportId = () => report?._id || report?.id;

  const isBackendReportId = (id) => /^[a-f\d]{24}$/i.test(String(id || ""));

  const isOwnReport = () => {
    const userId = currentUser?._id || currentUser?.id || currentUser?.userId;
    const ownerId = report?.userId?._id || report?.userId || report?.ownerId;

    return userId && ownerId && String(userId) === String(ownerId);
  };

  const openModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOwnReport()) {
      alert("You cannot report your own post.");
      return;
    }

    setShowModal(true);
  };

  const closeModal = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setShowModal(false);
    setReason("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!reason) {
      alert("Please select a reason.");
      return;
    }

    try {
      const reportId = getReportId();

      if (!isBackendReportId(reportId)) {
        alert("This post is not connected with the backend database. Please refresh the page and try again.");
        return;
      }

      await reportPost(reportId, reason);
      alert("Post reported successfully. Admin will review it.");

      setShowModal(false);
      setReason("");
    } catch (error) {
      alert(error.message || "Unable to report this post.");
    }
  };

  const modalContent = (
    <div
      className="report-post-overlay"
      onClick={closeModal}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        className="report-post-modal"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="report-post-close"
          onClick={closeModal}
        >
          <FaTimes />
        </button>

        <div className="report-post-icon">
          <FaFlag />
        </div>

        <h2>Report Post</h2>

        <p>
          Why do you want to report <b>{getReportTitle()}</b>?
        </p>

        <form onSubmit={handleSubmit}>
          <label>Reason</label>

          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            required
          >
            <option value="">Select reason</option>
            <option value="Fake report">Fake report</option>
            <option value="Wrong information">Wrong information</option>
            <option value="Inappropriate content">
              Inappropriate content
            </option>
            <option value="Spam">Spam</option>
            <option value="Duplicate report">Duplicate report</option>
            <option value="Other">Other</option>
          </select>

          <button
            type="submit"
            className="report-post-submit"
            onClick={(e) => e.stopPropagation()}
          >
            Submit Report
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        className="report-post-btn"
        onClick={openModal}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <FaFlag />
        Report Post
      </button>

      {showModal && createPortal(modalContent, document.body)}
    </>
  );
}