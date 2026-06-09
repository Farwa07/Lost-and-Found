const Report = require("../models/report");
const User = require("../models/user");
const ReportComplaint = require("../models/reportComplaint");
const Notification = require("../models/notification");
const AdminLog = require("../models/adminLog");
const ReportMatch = require("../models/reportMatch");

// GET ALL REPORTS FOR ADMIN
const getAdminReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("userId", "fullName email phone role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Admin reports fetched successfully",
      count: reports.length,
      reports,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE REPORT ADMIN STATUS
const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["pending", "verified", "matched", "closed", "rejected"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const updateData = {
      status,
      isVerified: status === "verified" || status === "matched",
    };

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    // AUTO NOTIFICATION ON VERIFY / REJECT / MATCHED
    if (report.userId && ["verified", "rejected", "matched"].includes(status)) {
      let notificationTitle = "Report Status Updated";
      let notificationMessage = `Your report status has been updated to ${status}.`;

      if (status === "verified") {
        notificationTitle = "Report Verified";
        notificationMessage = "Admin has verified your report.";
      }

      if (status === "rejected") {
        notificationTitle = "Report Rejected";
        notificationMessage = "Admin has rejected your report.";
      }

      if (status === "matched") {
        notificationTitle = "Report Matched";
        notificationMessage = "Admin has marked your report as matched.";
      }

      await Notification.create({
        userId: report.userId,
        reportId: report._id,
        type: "Status",
        title: notificationTitle,
        message: notificationMessage,
        actionUrl: `/reports/${report._id}`,
      });
    }

    res.status(200).json({
      message: "Report status updated successfully",
      report,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
   

// DELETE FAKE OR INAPPROPRIATE REPORT
const deleteAdminReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    res.status(200).json({
      message: "Report deleted successfully by admin",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL USERS FOR ADMIN
const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -resetOtp -resetOtpExpire")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Users fetched successfully",
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE USER ROLE
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    const allowedRoles = ["user", "admin"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role value",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select("-password -resetOtp -resetOtpExpire");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User role updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET REPORT COMPLAINTS
const getReportComplaints = async (req, res) => {
  try {
    const complaints = await ReportComplaint.find()
      .populate("reportId")
      .populate("userId", "fullName email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Complaints fetched successfully",
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE COMPLAINT STATUS
const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["pending", "reviewed", "dismissed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid complaint status",
      });
    }

    const complaint = await ReportComplaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      message: "Complaint status updated successfully",
      complaint,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// BLOCK USER
const blockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "blocked" },
      { new: true, runValidators: true }
    ).select("-password -resetOtp -resetOtpExpire");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User blocked successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UNBLOCK USER
const unblockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "active" },
      { new: true, runValidators: true }
    ).select("-password -resetOtp -resetOtpExpire");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User unblocked successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// SEND ADMIN ALERT FOR A REPORT
const sendAdminAlert = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const reportId = req.params.id;

    if (!title || !message) {
      return res.status(400).json({
        message: "Title and message are required",
      });
    }

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    if (!report.userId) {
      return res.status(400).json({
        message: "This report has no user attached",
      });
    }

    const notification = new Notification({
      userId: report.userId,
      reportId: report._id,
      type: type || "Alert",
      title,
      message,
      caseTitle:
        report.itemName ||
        report.missingPersonName ||
        report.foundPersonName ||
        "Report Alert",
      city:
        report.lostLocation ||
        report.foundLocation ||
        report.missingPersonLastSeenLocation ||
        "Unknown",
      actionUrl: `/reports/${report._id}`,
    });

    await notification.save();

    res.status(201).json({
      message: "Admin alert sent successfully",
      notification,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ADMIN LOGS
const getAdminLogs = async (req, res) => {
  try {
    const logs = await AdminLog.find()
      .populate("adminId", "fullName email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Admin logs fetched successfully",
      count: logs.length,
      logs,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// helper function to normalize text for comparison
const normalizeText = (value = "") => {
  return String(value).trim().toLowerCase();
};

const calculateMatchScore = (lostReport, foundReport) => {
  let score = 0;
  const reasons = [];

  if (normalizeText(lostReport.category) === normalizeText(foundReport.category)) {
    score += 25;
    reasons.push("Same category");
  }

  if (normalizeText(lostReport.city) === normalizeText(foundReport.city)) {
    score += 20;
    reasons.push("Same city");
  }

  const lostTitle =
    lostReport.itemName ||
    lostReport.missingPersonName ||
    lostReport.title ||
    "";

  const foundTitle =
    foundReport.itemName ||
    foundReport.foundPersonName ||
    foundReport.title ||
    "";

  if (
    normalizeText(lostTitle) &&
    normalizeText(foundTitle) &&
    normalizeText(lostTitle) === normalizeText(foundTitle)
  ) {
    score += 25;
    reasons.push("Same title/name");
  }

  if (
    lostReport.description &&
    foundReport.description &&
    normalizeText(foundReport.description).includes(normalizeText(lostReport.description).slice(0, 10))
  ) {
    score += 10;
    reasons.push("Similar description");
  }

  const lostLocation =
    lostReport.lostLocation ||
    lostReport.missingPersonLastSeenLocation ||
    lostReport.location ||
    "";

  const foundLocation =
    foundReport.foundLocation ||
    foundReport.location ||
    "";

  if (
    normalizeText(lostLocation) &&
    normalizeText(foundLocation) &&
    normalizeText(lostLocation) === normalizeText(foundLocation)
  ) {
    score += 20;
    reasons.push("Same location");
  }

  return {
    score,
    reasons,
  };
};

// GET MATCH SUGGESTIONS
const getMatchSuggestions = async (req, res) => {
  try {
    const lostReports = await Report.find({
      reportType: { $in: ["lost", "missing"] },
      status: { $ne: "matched" },
    });

    const foundReports = await Report.find({
      reportType: "found",
      status: { $ne: "matched" },
    });

    const suggestions = [];

    for (const lostReport of lostReports) {
      for (const foundReport of foundReports) {
        const { score, reasons } = calculateMatchScore(lostReport, foundReport);

        if (score >= 50) {
          let match = await ReportMatch.findOne({
            lostReportId: lostReport._id,
            foundReportId: foundReport._id,
          });

          if (!match) {
            match = await ReportMatch.create({
              lostReportId: lostReport._id,
              foundReportId: foundReport._id,
              score,
              reasons,
              status: "suggested",
            });
          }

          suggestions.push({
            matchId: match._id,
            score: match.score,
            reasons: match.reasons,
            status: match.status,
            lostReport,
            foundReport,
          });
        }
      }
    }

    res.status(200).json({
      message: "Match suggestions fetched successfully",
      count: suggestions.length,
      suggestions,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// CONFIRM MATCH
const confirmMatch = async (req, res) => {
  try {
    const match = await ReportMatch.findById(req.params.matchId)
      .populate("lostReportId")
      .populate("foundReportId");

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    match.status = "confirmed";
    match.confirmedBy = req.user.id;
    match.confirmedAt = new Date();
    await match.save();

    await Report.findByIdAndUpdate(match.lostReportId._id, {
      status: "matched",
      caseStatus: "Solved",
    });

    await Report.findByIdAndUpdate(match.foundReportId._id, {
      status: "matched",
      caseStatus: "Solved",
    });

    if (match.lostReportId.userId) {
      await Notification.create({
        userId: match.lostReportId.userId,
        reportId: match.lostReportId._id,
        type: "Match",
        title: "Match Confirmed",
        message: "Admin has confirmed a match for your report.",
        actionUrl: `/matches/${match._id}`,
      });
    }

    if (match.foundReportId.userId) {
      await Notification.create({
        userId: match.foundReportId.userId,
        reportId: match.foundReportId._id,
        type: "Match",
        title: "Match Confirmed",
        message: "Admin has confirmed a match for your report.",
        actionUrl: `/matches/${match._id}`,
      });
    }

    res.status(200).json({
      message: "Match confirmed successfully",
      match,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DISMISS MATCH
const dismissMatch = async (req, res) => {
  try {
    const match = await ReportMatch.findByIdAndUpdate(
      req.params.matchId,
      { status: "dismissed" },
      { new: true, runValidators: true }
    );

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    res.status(200).json({
      message: "Match dismissed successfully",
      match,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET SINGLE MATCH DETAILS
const getMatchById = async (req, res) => {
  try {
    const match = await ReportMatch.findById(req.params.matchId)
      .populate("lostReportId")
      .populate("foundReportId")
      .populate("confirmedBy", "fullName email role");

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    res.status(200).json({
      message: "Match fetched successfully",
      match,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getAdminReports,
  updateReportStatus,
  deleteAdminReport,
  getAdminUsers,
  updateUserRole,
  getReportComplaints,
  updateComplaintStatus,
  blockUser,
  unblockUser,
  sendAdminAlert,
  getAdminLogs,
  getMatchSuggestions,
  confirmMatch,
  dismissMatch,
  getMatchById,
};