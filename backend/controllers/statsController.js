const Report = require("../models/report");

// GET STATISTICS REPORTS DATA
const getStatistics = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });

    const normalizedReports = reports.map((report) => {
      let title = "Untitled Report";
      let city = "Unknown";
      let date = "";
      let type = "";
      let category = "";

      if (report.category === "item") {
        category = "Item";

        if (report.reportType === "lost") {
          type = "Lost";
          title = report.itemName || "Lost Item";
          city = report.lostLocation || "Unknown";
          date = report.lostDate || report.createdAt;
        }

        if (report.reportType === "found") {
          type = "Found";
          title = report.itemName || "Found Item";
          city = report.foundLocation || "Unknown";
          date = report.foundDate || report.createdAt;
        }
      }

      if (report.category === "person") {
        category = "Person";

        if (report.reportType === "lost") {
          type = "Missing";
          title = report.missingPersonName || "Missing Person";
          city = report.missingPersonLastSeenLocation || "Unknown";
          date = report.missingPersonLastSeenDate || report.createdAt;
        }

        if (report.reportType === "found") {
          type = "Found";
          title = report.foundPersonName || "Found Person";
          city = report.foundLocation || "Unknown";
          date = report.foundDate || report.createdAt;
        }
      }

      return {
        id: report._id,
        _id: report._id,
        type,
        status: type,
        category,
        title,
        city,
        date,
        itemCategory: report.itemCategory || "Other",
        adminStatus:
          report.status === "verified"
            ? "Verified"
            : report.status === "matched"
            ? "Matched"
            : report.status === "closed"
            ? "Resolved"
            : "Pending Review",
        caseStatus:
          report.status === "matched" || report.status === "closed"
            ? "Solved"
            : "Unsolved",
        createdAt: report.createdAt,
      };
    });

    const totalReports = reports.length;

    const lostItems = reports.filter(
      (report) => report.category === "item" && report.reportType === "lost"
    ).length;

    const foundItems = reports.filter(
      (report) => report.category === "item" && report.reportType === "found"
    ).length;

    const missingPersons = reports.filter(
      (report) => report.category === "person" && report.reportType === "lost"
    ).length;

    const foundPersons = reports.filter(
      (report) => report.category === "person" && report.reportType === "found"
    ).length;

    const pendingReports = reports.filter(
      (report) => report.status === "pending"
    ).length;

    const verifiedReports = reports.filter(
      (report) => report.status === "verified"
    ).length;

    const matchedReports = reports.filter(
      (report) => report.status === "matched"
    ).length;

    res.status(200).json({
      message: "Statistics fetched successfully",
      totalReports,
      lostItems,
      foundItems,
      missingPersons,
      foundPersons,
      pendingReports,
      verifiedReports,
      matchedReports,
      reports: normalizedReports,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getStatistics,
};