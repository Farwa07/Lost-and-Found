const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { upload } = require("../utils/uploads");

const {
  getProfile,
  updateProfile,
  updateProfileImage,
} = require("../controllers/authController");

router.get("/", authMiddleware, getProfile);
router.put("/", authMiddleware, updateProfile);

router.put(
  "/image",
  authMiddleware,
  upload.single("profileImage"),
  updateProfileImage
);

module.exports = router;
