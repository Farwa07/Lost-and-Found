const express = require("express");
const router = express.Router();

const { getStatistics } = require("../controllers/statsController");

router.get("/", getStatistics);

module.exports = router;