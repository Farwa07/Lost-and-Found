const express = require("express");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");

const {
  createLostItemReport,
  createFoundItemReport,
  createMissingPersonReport,
  createFoundPersonReport,
  getAllReports,
  getItemReports,
  getPersonReports,
  getReportById,
  getMyReports,
  reportPost,
  deleteMyReport,
  updateMyReportStatus,
  updateMyReport,
  searchReports,
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
  authMiddleware,
  upload.fields([
    { name: "lostItemImage", maxCount: 1 },
    { name: "reporterIdCardImage", maxCount: 1 },
  ]),
  createLostItemReport
);

// Create Found Item Report
router.post(
  "/found-item",
  authMiddleware,
  upload.fields([
    { name: "foundItemImage", maxCount: 1 },
    { name: "reporterIdCardImage", maxCount: 1 },
  ]),
  createFoundItemReport
);

// Create Missing Person Report
router.post(
  "/missing-person",
  authMiddleware,
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
  authMiddleware,
  upload.fields([
    { name: "foundPersonImage", maxCount: 1 },
    { name: "reporterIdCardImage", maxCount: 1 },
  ]),
  createFoundPersonReport
);

// Report a post
router.post("/:id/report-post", authMiddleware, reportPost);

// Get all reports
router.get("/", getAllReports);

// Get item reports only
router.get("/items", getItemReports);

// Get person reports only
router.get("/persons", getPersonReports);

// Get my reports
router.get("/my-reports", authMiddleware, getMyReports);

// Search and filter reports
router.get("/search", searchReports);

// Delete my report
router.delete("/my-reports/:id", authMiddleware, deleteMyReport);

// Update my report status
router.patch("/my-reports/:id/status", authMiddleware, updateMyReportStatus);

// Update my report details
router.put("/my-reports/:id", authMiddleware, updateMyReport);

// Get single report by ID
router.get("/:id", getReportById);

module.exports = router;