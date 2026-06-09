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
} = require("../controllers/adminController");

// Admin Reports
router.get("/reports", authMiddleware, adminMiddleware, getAdminReports);

router.patch(
  "/reports/:id/status",
  authMiddleware,
  adminMiddleware,
  updateReportStatus
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

module.exports = router;