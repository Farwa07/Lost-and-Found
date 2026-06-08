const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  addComment,
  getCommentsByReport,
  addReply,
  deleteComment,
  deleteReply,
} = require("../controllers/commentController");

// Add comment on report
router.post("/reports/:id/comments", authMiddleware, addComment);

// Get comments of report
router.get("/reports/:id/comments", getCommentsByReport);

// Add reply on comment
router.post("/reports/comments/:commentId/replies", authMiddleware, addReply);

// Delete comment
router.delete("/reports/comments/:commentId", authMiddleware, deleteComment);

// Delete reply
router.delete(
  "/reports/comments/:commentId/replies/:replyId",
  authMiddleware,
  deleteReply
);

module.exports = router;