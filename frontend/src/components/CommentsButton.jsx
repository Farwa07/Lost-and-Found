import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

import {
  FaRegCommentDots,
  FaTimes,
  FaReply,
  FaPaperPlane,
  FaTrash,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";

import "./CommentsButton.css";

const REPORTS_KEY = "lostFoundReports";
const NOTIFICATIONS_KEY = "lostFoundNotifications";

const safeParse = (value, fallback = null) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const readReports = () => {
  const reports = safeParse(localStorage.getItem(REPORTS_KEY), []);
  return Array.isArray(reports) ? reports : [];
};

const writeReports = (reports) => {
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  window.dispatchEvent(new Event("lostFoundReportsUpdated"));
};

const readNotifications = () => {
  const notifications = safeParse(localStorage.getItem(NOTIFICATIONS_KEY), []);
  return Array.isArray(notifications) ? notifications : [];
};

const writeNotifications = (notifications) => {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  window.dispatchEvent(new Event("lostFoundNotificationsUpdated"));
};

const createId = () => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const normalizeText = (value = "") => {
  return String(value).trim().toLowerCase();
};

export default function CommentsButton({
  reportId = "",
  reportTitle,
  initialComments = [],
  currentUser = "John Doe",
  autoOpenKey = "",
}) {
  const navigate = useNavigate();

  const { isLoggedIn, isRegistered, currentUser: authUser } = useAuth();

  const activeUserName = authUser?.fullName || currentUser || "John Doe";
  const activeUserEmail = authUser?.email || "";

  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  const storageReport = useMemo(() => {
    const reports = readReports();

    if (reportId) {
      return reports.find(
        (report) => String(report.id) === String(reportId)
      );
    }

    return reports.find(
      (report) =>
        normalizeText(report.title || report.name || report.itemName) ===
        normalizeText(reportTitle)
    );
  }, [reportId, reportTitle, open]);

  useEffect(() => {
    const reports = readReports();

    const matchedReport = reportId
      ? reports.find((report) => String(report.id) === String(reportId))
      : reports.find(
          (report) =>
            normalizeText(report.title || report.name || report.itemName) ===
            normalizeText(reportTitle)
        );

    if (matchedReport && Array.isArray(matchedReport.comments)) {
      setComments(matchedReport.comments);
      return;
    }

    setComments(Array.isArray(initialComments) ? initialComments : []);
  }, [reportId, reportTitle, initialComments]);

  useEffect(() => {
    if (autoOpenKey) {
      setOpen(true);
    }
  }, [autoOpenKey]);

  const syncCommentsToReport = (nextComments) => {
    setComments(nextComments);

    const reports = readReports();

    const reportIndex = reports.findIndex((report) => {
      if (reportId) {
        return String(report.id) === String(reportId);
      }

      return (
        normalizeText(report.title || report.name || report.itemName) ===
        normalizeText(reportTitle)
      );
    });

    if (reportIndex === -1) {
      return;
    }

    const nextReports = reports.map((report, index) =>
      index === reportIndex
        ? {
            ...report,
            comments: nextComments,
          }
        : report
    );

    writeReports(nextReports);
  };

  const addCommentNotification = (actionType, text) => {
    const reports = readReports();

    const targetReport = reportId
      ? reports.find((report) => String(report.id) === String(reportId))
      : storageReport;

    if (!targetReport) {
      return;
    }

    const ownerEmail =
      targetReport.ownerEmail ||
      targetReport.reporterEmail ||
      "";

    if (
      activeUserEmail &&
      ownerEmail &&
      normalizeText(activeUserEmail) === normalizeText(ownerEmail)
    ) {
      return;
    }

    const notifications = readNotifications();

    const notification = {
      id: createId(),
      reportId: targetReport.id,
      type: "Comment",
      title: actionType === "reply" ? "New Reply on Your Report" : "New Comment on Your Report",
      message:
        actionType === "reply"
          ? `${activeUserName} replied on your report "${targetReport.title || reportTitle}": ${text}`
          : `${activeUserName} commented on your report "${targetReport.title || reportTitle}": ${text}`,
      caseTitle: targetReport.title || reportTitle || "Report",
      city: targetReport.city || "N/A",
      time: "Just now",
      createdAt: new Date().toISOString(),
      isRead: false,
      actionUrl: `/reports?reportId=${targetReport.id}&openComments=true`,
    };

    writeNotifications([notification, ...notifications]);
  };

  const showAuthPrompt = (actionText) => {
    alert(
      isRegistered
        ? `Please login to ${actionText}.`
        : `Please create an account to ${actionText}.`
    );

    navigate(isRegistered ? "/login" : "/signup");
  };

  const formatDateTime = (value) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const handleOpen = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setReplyingTo(null);
    setReplyText("");
  };

  const handleAddComment = (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      showAuthPrompt("comment");
      return;
    }

    const text = commentText.trim();

    if (!text) {
      alert("Comment cannot be empty");
      return;
    }

    const newComment = {
      id: createId(),
      user: activeUserName,
      userEmail: activeUserEmail,
      text,
      createdAt: new Date().toISOString(),
      replies: [],
    };

    const nextComments = [...comments, newComment];

    syncCommentsToReport(nextComments);
    addCommentNotification("comment", text);

    setCommentText("");
  };

  const handleDeleteComment = (commentId) => {
    if (!isLoggedIn) {
      showAuthPrompt("delete comments");
      return;
    }

    const targetComment = comments.find(
      (comment) => String(comment.id) === String(commentId)
    );

    if (!canDeleteComment(targetComment)) {
      alert("You can delete only your own comment.");
      return;
    }

    const confirmDelete = window.confirm("Delete this comment?");

    if (!confirmDelete) return;

    const nextComments = comments.filter(
      (comment) => String(comment.id) !== String(commentId)
    );

    syncCommentsToReport(nextComments);
  };

  const handleReplyClick = (commentId) => {
    if (!isLoggedIn) {
      showAuthPrompt("reply");
      return;
    }

    setReplyingTo(replyingTo === commentId ? null : commentId);
  };

  const handleAddReply = (e, commentId) => {
    e.preventDefault();

    if (!isLoggedIn) {
      showAuthPrompt("reply");
      return;
    }

    const text = replyText.trim();

    if (!text) {
      alert("Reply cannot be empty");
      return;
    }

    const newReply = {
      id: createId(),
      user: activeUserName,
      userEmail: activeUserEmail,
      text,
      createdAt: new Date().toISOString(),
    };

    const nextComments = comments.map((comment) =>
      String(comment.id) === String(commentId)
        ? {
            ...comment,
            replies: [...(comment.replies || []), newReply],
          }
        : comment
    );

    syncCommentsToReport(nextComments);
    addCommentNotification("reply", text);

    setReplyText("");
    setReplyingTo(null);
  };

  const handleDeleteReply = (commentId, replyId) => {
    if (!isLoggedIn) {
      showAuthPrompt("delete replies");
      return;
    }

    const targetComment = comments.find(
      (comment) => String(comment.id) === String(commentId)
    );

    const targetReply = targetComment?.replies?.find(
      (reply) => String(reply.id) === String(replyId)
    );

    if (!canDeleteComment(targetReply)) {
      alert("You can delete only your own reply.");
      return;
    }

    const confirmDelete = window.confirm("Delete this reply?");

    if (!confirmDelete) return;

    const nextComments = comments.map((comment) =>
      String(comment.id) === String(commentId)
        ? {
            ...comment,
            replies: (comment.replies || []).filter(
              (reply) => String(reply.id) !== String(replyId)
            ),
          }
        : comment
    );

    syncCommentsToReport(nextComments);
  };

  const canDeleteComment = (comment) => {
    if (!isLoggedIn || !comment) {
      return false;
    }

    if (
      comment.userEmail &&
      activeUserEmail &&
      normalizeText(comment.userEmail) === normalizeText(activeUserEmail)
    ) {
      return true;
    }

    return normalizeText(comment.user) === normalizeText(activeUserName);
  };

  const modalContent = (
    <div className="comments-modal-overlay" onClick={handleClose}>
      <div
        className="comments-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="comments-modal-close"
          onClick={handleClose}
        >
          <FaTimes />
        </button>

        <div className="comments-modal-header">
          <span>Discussion</span>
          <h2>Comments</h2>
          <p>{reportTitle}</p>
        </div>

        <div className="comments-list">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div className="comment-box" key={comment.id}>
                <div className="comment-main">
                  <div className="comment-avatar">
                    {getInitials(comment.user)}
                  </div>

                  <div className="comment-content">
                    <div className="comment-top">
                      <div>
                        <h4>{comment.user}</h4>
                        <span>{formatDateTime(comment.createdAt)}</span>
                      </div>

                      {canDeleteComment(comment) && (
                        <button
                          type="button"
                          className="comment-delete-btn"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>

                    <p>{comment.text}</p>

                    <button
                      type="button"
                      className="comment-reply-btn"
                      onClick={() => handleReplyClick(comment.id)}
                    >
                      <FaReply />
                      Reply
                    </button>
                  </div>
                </div>

                {(comment.replies || []).length > 0 && (
                  <div className="reply-list">
                    {comment.replies.map((reply) => (
                      <div className="reply-box" key={reply.id}>
                        <div className="comment-avatar reply-avatar">
                          {getInitials(reply.user)}
                        </div>

                        <div className="comment-content">
                          <div className="comment-top">
                            <div>
                              <h4>{reply.user}</h4>
                              <span>{formatDateTime(reply.createdAt)}</span>
                            </div>

                            {canDeleteComment(reply) && (
                              <button
                                type="button"
                                className="comment-delete-btn"
                                onClick={() =>
                                  handleDeleteReply(comment.id, reply.id)
                                }
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>

                          <p>{reply.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {replyingTo === comment.id && (
                  <form
                    className="reply-form"
                    onSubmit={(e) => handleAddReply(e, comment.id)}
                  >
                    <textarea
                      placeholder="Write your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />

                    <button type="submit">
                      <FaPaperPlane />
                      Reply
                    </button>
                  </form>
                )}
              </div>
            ))
          ) : (
            <div className="no-comments">
              <FaRegCommentDots />
              <h3>No comments yet</h3>
              <p>Be the first one to comment on this report.</p>
            </div>
          )}
        </div>

        <form className="add-comment-form" onSubmit={handleAddComment}>
          <textarea
            placeholder={
              isLoggedIn
                ? "Write your comment here..."
                : "Login or create an account to write a comment..."
            }
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />

          <button type="submit">
            <FaPaperPlane />
            Add Comment
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        className="comments-open-btn"
        onClick={handleOpen}
      >
        <FaRegCommentDots />
        Comments
        <span>{comments.length}</span>
      </button>

      {open && createPortal(modalContent, document.body)}
    </>
  );
}