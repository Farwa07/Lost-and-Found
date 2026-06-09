const express = require("express");
const router = express.Router();
const multer = require("multer");

const authMiddleware = require("../middleware/authMiddleware");

const {
  getProfile,
  updateProfile,
  updateProfileImage,
} = require("../controllers/authController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/", authMiddleware, getProfile);
router.put("/", authMiddleware, updateProfile);

router.put(
  "/image",
  authMiddleware,
  upload.single("profileImage"),
  updateProfileImage
);

module.exports = router;