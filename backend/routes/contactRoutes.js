const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  submitContactMessage,
  getContactMessages,
  markContactMessageRead,
  deleteContactMessage,
} = require("../controllers/contactController");

// Public contact form submit
router.post("/", submitContactMessage);

// Admin contact messages
router.get("/", authMiddleware, adminMiddleware, getContactMessages);

router.patch(
  "/:id/read",
  authMiddleware,
  adminMiddleware,
  markContactMessageRead
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteContactMessage
);

module.exports = router;