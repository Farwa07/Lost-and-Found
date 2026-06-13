const Comment = require("../models/comment");
const Report = require("../models/report");
const User = require("../models/user");
const Notification = require("../models/notification");


// ADD COMMENT
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const reportId = req.params.id;

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Comment cannot be empty",
      });
    }

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    const user = await User.findById(req.user.id);

    const newComment = new Comment({
      reportId,
      userId: req.user.id,
      userName: user.fullName,
      userEmail: user.email,
      text: text.trim(),
    });

    await newComment.save();

    // AUTO NOTIFICATION ON COMMENT
    if (report.userId && String(report.userId) !== String(req.user.id)) {
      await Notification.create({
        userId: report.userId,
        reportId: report._id,
        type: "Comment",
        title: "New Comment",
        message: "Someone commented on your report.",
        actionUrl: `/reports?reportId=${report._id}&openComments=true`,
      });
    }

    res.status(201).json({
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET COMMENTS BY REPORT
const getCommentsByReport = async (req, res) => {
  try {
    const reportId = req.params.id;

    const comments = await Comment.find({ reportId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      message: "Comments fetched successfully",
      comments,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ADD REPLY
const addReply = async (req, res) => {
  try {
    const { text } = req.body;
    const commentId = req.params.commentId;

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Reply cannot be empty",
      });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    const user = await User.findById(req.user.id);

    comment.replies.push({
      userId: req.user.id,
      userName: user.fullName,
      userEmail: user.email,
      text: text.trim(),
    });

    await comment.save();

    res.status(201).json({
      message: "Reply added successfully",
      comment,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE COMMENT
const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can delete only your own comment",
      });
    }

    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE REPLY
const deleteReply = async (req, res) => {
  try {
    const { commentId, replyId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    const reply = comment.replies.id(replyId);

    if (!reply) {
      return res.status(404).json({
        message: "Reply not found",
      });
    }

    if (reply.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can delete only your own reply",
      });
    }

    reply.deleteOne();

    await comment.save();

    res.status(200).json({
      message: "Reply deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  addComment,
  getCommentsByReport,
  addReply,
  deleteComment,
  deleteReply,
};