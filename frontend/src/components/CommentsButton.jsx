import { useEffect, useRef, useState } from "react";
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
import {
  addCommentReply,
  addReportComment,
  deleteCommentReply,
  deleteReportComment,
  getReportComments,
} from "../api/commentApi";

import "./CommentsButton.css";

const createId = () => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const normalizeText = (value = "") => {
  return String(value).trim().toLowerCase();
};

const mapApiComment = (comment = {}) => ({
  id: comment._id || comment.id,
  user: comment.userName || comment.user || "User",
  userEmail: comment.userEmail || "",
  text: comment.text || "",
  createdAt: comment.createdAt,
  replies: (comment.replies || []).map((reply) => ({
    id: reply._id || reply.id,
    user: reply.userName || reply.user || "User",
    userEmail: reply.userEmail || "",
    text: reply.text || "",
    createdAt: reply.createdAt,
  })),
});

export default function CommentsButton({
  reportId = "",
  reportTitle,
  initialComments = [],
  currentUser = "User",
  autoOpenKey = "",
  highlightedCommentId = "",
}) {
  const navigate = useNavigate();
  const highlightedCommentRef = useRef(null);

  const { isLoggedIn, isRegistered, currentUser: authUser } = useAuth();

  const activeUserName = authUser?.fullName || currentUser || "User";
  const activeUserEmail = authUser?.email || "";

  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadComments = async () => {
      if (!reportId) {
        setComments(Array.isArray(initialComments) ? initialComments : []);
        return;
      }

      try {
        const response = await getReportComments(reportId);
        const apiComments = (response?.comments || []).map(mapApiComment);

        if (!ignore) {
          setComments(apiComments);
        }
      } catch (error) {
        console.error("Comments load error:", error);

        if (!ignore) {
          setComments(Array.isArray(initialComments) ? initialComments : []);
        }
      }
    };

    loadComments();

    return () => {
      ignore = true;
    };
  }, [reportId, initialComments]);

  useEffect(() => {
    if (autoOpenKey) {
      setOpen(true);
    }
  }, [autoOpenKey]);

  useEffect(() => {
    if (!open || !highlightedCommentId) {
      return;
    }

    const timer = setTimeout(() => {
      highlightedCommentRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [open, highlightedCommentId, comments]);

  const syncCommentsToReport = (nextComments) => {
    setComments(nextComments);
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

  const handleAddComment = async (e) => {
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

    try {
      const response = await addReportComment(reportId, text);
      const savedComment = response?.comment || {};
      const newComment = {
        id: savedComment._id || savedComment.id || createId(),
        user: savedComment.userName || activeUserName,
        userEmail: savedComment.userEmail || activeUserEmail,
        text: savedComment.text || text,
        createdAt: savedComment.createdAt || new Date().toISOString(),
        replies: [],
      };

      syncCommentsToReport([newComment, ...comments]);
      setCommentText("");
    } catch (error) {
      alert(error.message || "Unable to add comment.");
    }
  };

  const handleDeleteComment = async (commentId) => {
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

    try {
      await deleteReportComment(commentId);
      const nextComments = comments.filter(
        (comment) => String(comment.id) !== String(commentId)
      );

      syncCommentsToReport(nextComments);
    } catch (error) {
      alert(error.message || "Unable to delete comment.");
    }
  };

  const handleReplyClick = (commentId) => {
    if (!isLoggedIn) {
      showAuthPrompt("reply");
      return;
    }

    setReplyingTo(replyingTo === commentId ? null : commentId);
  };

  const handleAddReply = async (e, commentId) => {
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

    try {
      const response = await addCommentReply(commentId, text);
      const savedComment = response?.comment;
      const savedReply = savedComment?.replies?.[savedComment.replies.length - 1] || {};

      const newReply = {
        id: savedReply._id || savedReply.id || createId(),
        user: savedReply.userName || activeUserName,
        userEmail: savedReply.userEmail || activeUserEmail,
        text: savedReply.text || text,
        createdAt: savedReply.createdAt || new Date().toISOString(),
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
      setReplyText("");
      setReplyingTo(null);
    } catch (error) {
      alert(error.message || "Unable to add reply.");
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
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

    try {
      await deleteCommentReply(commentId, replyId);
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
    } catch (error) {
      alert(error.message || "Unable to delete reply.");
    }
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
            comments.map((comment) => {
              const isHighlighted =
                highlightedCommentId &&
                String(comment.id) === String(highlightedCommentId);

              return (
                <div
                  className={`comment-box ${isHighlighted ? "comment-box--highlighted" : ""}`}
                  key={comment.id}
                  ref={isHighlighted ? highlightedCommentRef : null}
                >
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
              );
            })
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
