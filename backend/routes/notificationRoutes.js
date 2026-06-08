const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
  clearAllNotifications,
} = require("../controllers/notificationController");

router.get("/", authMiddleware, getNotifications);

router.patch("/:id/read", authMiddleware, markNotificationAsRead);

router.delete("/:id", authMiddleware, deleteNotification);

router.delete("/", authMiddleware, clearAllNotifications);

module.exports = router;