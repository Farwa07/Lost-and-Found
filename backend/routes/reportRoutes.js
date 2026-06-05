const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  createLostItemReport,
  createFoundItemReport,
  createMissingPersonReport,
  createFoundPersonReport,
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

// Create Missing Person Report
router.post(
  "/missing-person",
  upload.fields([
    { name: "missingPersonImage", maxCount: 1 },
    { name: "reporterIdCardImage", maxCount: 1 },
    { name: "firReportImage", maxCount: 1 },
  ]),
  createMissingPersonReport
);

// Create Found Person Report
router.post(
  "/found-person",
  upload.fields([
    { name: "foundPersonImage", maxCount: 1 },
    { name: "reporterIdCardImage", maxCount: 1 },
  ]),
  createFoundPersonReport
);

module.exports = router;