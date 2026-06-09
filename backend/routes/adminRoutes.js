const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
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
} = require("../controllers/adminController");

// Admin Reports
router.get("/reports", authMiddleware, adminMiddleware, getAdminReports);

router.patch(
  "/reports/:id/status",
  authMiddleware,
  adminMiddleware,
  updateReportStatus
);

router.post(
  "/reports/:id/alert",
  authMiddleware,
  adminMiddleware,
  sendAdminAlert
);

router.delete(
  "/reports/:id",
  authMiddleware,
  adminMiddleware,
  deleteAdminReport
);

// Admin Users
router.get("/users", authMiddleware, adminMiddleware, getAdminUsers);

router.patch(
  "/users/:id/role",
  authMiddleware,
  adminMiddleware,
  updateUserRole
);
router.patch("/users/:id/block", authMiddleware, adminMiddleware, blockUser);

router.patch("/users/:id/unblock", authMiddleware, adminMiddleware, unblockUser);

// Report Complaints
router.get(
  "/complaints",
  authMiddleware,
  adminMiddleware,
  getReportComplaints
);

router.patch(
  "/complaints/:id/status",
  authMiddleware,
  adminMiddleware,
  updateComplaintStatus
);

// Admin Logs
router.get("/logs", authMiddleware, adminMiddleware, getAdminLogs);

// ADMIN MATCHING ROUTES
router.get(
  "/matches/suggestions",
  authMiddleware,
  adminMiddleware,
  getMatchSuggestions
);

router.post(
  "/matches/:matchId/confirm",
  authMiddleware,
  adminMiddleware,
  confirmMatch
);

router.post(
  "/matches/:matchId/dismiss",
  authMiddleware,
  adminMiddleware,
  dismissMatch
);

router.get(
  "/matches/:matchId",
  authMiddleware,
  adminMiddleware,
  getMatchById
);

module.exports = router;