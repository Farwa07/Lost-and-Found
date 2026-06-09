const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const { getMatchById } = require("../controllers/adminController");

// GET SINGLE MATCH DETAILS FOR USER
router.get("/:matchId", authMiddleware, getMatchById);

module.exports = router;