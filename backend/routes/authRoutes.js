const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  sendSignupOtp,
  verifySignupOtp,
  getProfile,
  updateProfile,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/send-signup-otp", sendSignupOtp);
router.post("/verify-signup-otp", verifySignupOtp);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

module.exports = router;