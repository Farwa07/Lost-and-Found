const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getNotifications,
  getNotificationSummary,
  markNotificationAsRead,
  deleteNotification,
  clearAllNotifications,
} = require("../controllers/notificationController");

router.get("/summary", authMiddleware, getNotificationSummary);

router.get("/", authMiddleware, getNotifications);

router.patch("/:id/read", authMiddleware, markNotificationAsRead);

router.delete("/:id", authMiddleware, deleteNotification);

router.delete("/", authMiddleware, clearAllNotifications);

module.exports = router;
