const mongoose = require("mongoose");

const reportMatchSchema = new mongoose.Schema(
  {
    lostReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: true,
    },

    foundReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: true,
    },

    score: {
      type: Number,
      default: 0,
    },

    reasons: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["suggested", "confirmed", "dismissed"],
      default: "suggested",
    },

    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    confirmedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReportMatch", reportMatchSchema);