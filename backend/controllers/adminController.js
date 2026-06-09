const Report = require("../models/report");
const User = require("../models/user");
const ReportComplaint = require("../models/reportComplaint");
const Notification = require("../models/notification");

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
};