const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { getMatchById, getMatchByReportId } = require("../controllers/adminController");

router.get("/by-report/:reportId", authMiddleware, getMatchByReportId);
router.get("/:matchId", authMiddleware, getMatchById);

module.exports = router;
