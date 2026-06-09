const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  sendSignupOtp,
  verifySignupOtp,
  getProfile,
  updateProfile,
  changePassword,
  updateProfileImage,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/send-signup-otp", sendSignupOtp);
router.post("/verify-signup-otp", verifySignupOtp);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.get("/me", authMiddleware, getProfile);
router.put("/change-password", authMiddleware, changePassword);
router.put(
  "/profile/image",
  authMiddleware,
  upload.single("profileImage"),
  updateProfileImage
);

module.exports = router;