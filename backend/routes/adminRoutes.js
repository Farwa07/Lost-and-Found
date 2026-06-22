const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  getAdminReports,
  updateReportStatus,
  updateReportCaseStatus,
  verifyReport,
  rejectReport,
  deleteAdminReport,
  clearReportFlags,
  getAdminUsers,
  updateUserRole,
  deleteAdminUser,
  getReportComplaints,
  updateComplaintStatus,
  blockUser,
  unblockUser,
  sendAdminAlert,
  sendGeneralAlert,
  getAdminLogs,
  getMatchSuggestions,
  confirmMatch,
  dismissMatch,
  getMatchById,
} = require("../controllers/adminController");

router.get("/reports", authMiddleware, adminMiddleware, getAdminReports);
router.patch("/reports/:id/status", authMiddleware, adminMiddleware, updateReportStatus);
router.patch("/reports/:id/case-status", authMiddleware, adminMiddleware, updateReportCaseStatus);
router.patch("/reports/:id/verify", authMiddleware, adminMiddleware, verifyReport);
router.patch("/reports/:id/reject", authMiddleware, adminMiddleware, rejectReport);
router.post("/reports/:id/alert", authMiddleware, adminMiddleware, sendAdminAlert);
router.patch("/reports/:id/flags/clear", authMiddleware, adminMiddleware, clearReportFlags);
router.delete("/reports/:id", authMiddleware, adminMiddleware, deleteAdminReport);

router.post("/alerts", authMiddleware, adminMiddleware, sendGeneralAlert);

router.get("/users", authMiddleware, adminMiddleware, getAdminUsers);
router.patch("/users/:id/role", authMiddleware, adminMiddleware, updateUserRole);
router.patch("/users/:id/block", authMiddleware, adminMiddleware, blockUser);
router.patch("/users/:id/unblock", authMiddleware, adminMiddleware, unblockUser);
router.delete("/users/:id", authMiddleware, adminMiddleware, deleteAdminUser);

router.get("/complaints", authMiddleware, adminMiddleware, getReportComplaints);
router.patch("/complaints/:id/status", authMiddleware, adminMiddleware, updateComplaintStatus);

router.get("/logs", authMiddleware, adminMiddleware, getAdminLogs);

router.get("/matches/suggestions", authMiddleware, adminMiddleware, getMatchSuggestions);
router.post("/matches/:matchId/confirm", authMiddleware, adminMiddleware, confirmMatch);
router.post("/matches/:matchId/dismiss", authMiddleware, adminMiddleware, dismissMatch);
router.get("/matches/:matchId", authMiddleware, adminMiddleware, getMatchById);

module.exports = router;
