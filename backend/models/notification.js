const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: false,
    },

    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReportMatch",
      required: false,
      default: null,
    },

    type: {
      type: String,
      enum: ["Match", "Verification", "Comment", "Alert", "Status"],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    caseTitle: {
      type: String,
      default: "System Update",
    },

    city: {
      type: String,
      default: "All Cities",
    },

    actionUrl: {
      type: String,
      default: "",
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
