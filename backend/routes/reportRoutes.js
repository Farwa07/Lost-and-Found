const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  createLostItemReport,
  createFoundItemReport,
} = require("../controllers/reportController");

// Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Create Lost Item Report
router.post(
  "/lost-item",
  upload.fields([
    { name: "lostItemImage", maxCount: 1 },
    { name: "reporterIdCardImage", maxCount: 1 },
  ]),
  createLostItemReport
);

// Create Found Item Report
router.post(
  "/found-item",
  upload.fields([
    { name: "foundItemImage", maxCount: 1 },
    { name: "reporterIdCardImage", maxCount: 1 },
  ]),
  createFoundItemReport
);

module.exports = router;