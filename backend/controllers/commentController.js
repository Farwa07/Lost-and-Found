const Comment = require("../models/comment");
const Report = require("../models/report");
const User = require("../models/user");
const Notification = require("../models/notification");

const getReportTitle = (report = {}) => {
  return (
    report.itemName ||
    report.missingPersonName ||
    report.foundPersonName ||
    report.title ||
    "your report"
  );
};

const getReportCity = (report = {}) => {
  return report.city || "All Cities";
};

const getPreviewText = (value = "", limit = 90) => {
  const cleanText = String(value).replace(/\s+/g, " ").trim();

  if (cleanText.length <= limit) {
    return cleanText;
  }

  return `${cleanText.slice(0, limit).trim()}...`;
};

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

    const user = await User.findById(req.user.id).select("fullName email");

    const newComment = new Comment({
      reportId,
      userId: req.user.id,
      userName: user?.fullName || "User",
      userEmail: user?.email || "",
      text: text.trim(),
    });

    await newComment.save();

    // Owner ko har flag/post report par notification nahi milti,
    // lekin comments par owner ko useful notification milni chahiye.
    // Notification text backend se generate hota hai so frontend only renders data.
    if (report.userId && String(report.userId) !== String(req.user.id)) {
      const reportTitle = getReportTitle(report);
      const commentPreview = getPreviewText(text);

      await Notification.create({
        userId: report.userId,
        reportId: report._id,
        commentId: newComment._id,
        type: "Comment",
        title: `New comment on ${reportTitle}`,
        message: `${user?.fullName || "Someone"} commented on your report "${reportTitle}": ${commentPreview}`,
        caseTitle: reportTitle,
        city: getReportCity(report),
        actionUrl: `/reports?reportId=${report._id}&openComments=true&commentId=${newComment._id}`,
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

    const user = await User.findById(req.user.id).select("fullName email");

    comment.replies.push({
      userId: req.user.id,
      userName: user?.fullName || "User",
      userEmail: user?.email || "",
      text: text.trim(),
    });

    await comment.save();

    const savedReply = comment.replies[comment.replies.length - 1];
    const report = await Report.findById(comment.reportId);

    if (report?.userId && String(report.userId) !== String(req.user.id)) {
      const reportTitle = getReportTitle(report);
      const replyPreview = getPreviewText(text);

      await Notification.create({
        userId: report.userId,
        reportId: report._id,
        commentId: comment._id,
        type: "Comment",
        title: `New reply on ${reportTitle}`,
        message: `${user?.fullName || "Someone"} replied on your report "${reportTitle}": ${replyPreview}`,
        caseTitle: reportTitle,
        city: getReportCity(report),
        actionUrl: `/reports?reportId=${report._id}&openComments=true&commentId=${comment._id}&replyId=${savedReply?._id || ""}`,
      });
    }

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
