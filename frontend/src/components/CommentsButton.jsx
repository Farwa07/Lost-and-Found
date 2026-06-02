import { useState } from "react";
import { createPortal } from "react-dom";
import {
  FaRegCommentDots,
  FaTimes,
  FaReply,
  FaPaperPlane,
  FaTrash,
} from "react-icons/fa";

import "./CommentsButton.css";

export default function CommentsButton({
  reportTitle = "Report",
  initialComments = [],
  currentUser = "John Doe",
}) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

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

  const getInitials = (name) => {
    return name
      .split(" ")
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

    const text = commentText.trim();

    if (!text) {
      alert("Comment cannot be empty");
      return;
    }

    const newComment = {
      id: Date.now(),
      user: currentUser,
      text,
      createdAt: new Date().toISOString(),
      replies: [],
    };

    setComments((prev) => [...prev, newComment]);
    setCommentText("");
  };

  const handleDeleteComment = (commentId) => {
    const confirmDelete = window.confirm("Delete this comment?");

    if (!confirmDelete) return;

    setComments((prev) =>
      prev.filter((comment) => comment.id !== commentId)
    );
  };

  const handleAddReply = (e, commentId) => {
    e.preventDefault();

    const text = replyText.trim();

    if (!text) {
      alert("Reply cannot be empty");
      return;
    }

    const newReply = {
      id: Date.now(),
      user: currentUser,
      text,
      createdAt: new Date().toISOString(),
    };

    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              replies: [...(comment.replies || []), newReply],
            }
          : comment
      )
    );

    setReplyText("");
    setReplyingTo(null);
  };

  const handleDeleteReply = (commentId, replyId) => {
    const confirmDelete = window.confirm("Delete this reply?");

    if (!confirmDelete) return;

    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              replies: (comment.replies || []).filter(
                (reply) => reply.id !== replyId
              ),
            }
          : comment
      )
    );
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

                      <button
                        type="button"
                        className="comment-delete-btn"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>

                    <p>{comment.text}</p>

                    <button
                      type="button"
                      className="comment-reply-btn"
                      onClick={() =>
                        setReplyingTo(
                          replyingTo === comment.id ? null : comment.id
                        )
                      }
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

                            <button
                              type="button"
                              className="comment-delete-btn"
                              onClick={() =>
                                handleDeleteReply(comment.id, reply.id)
                              }
                            >
                              <FaTrash />
                            </button>
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
            placeholder="Write your comment here..."
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