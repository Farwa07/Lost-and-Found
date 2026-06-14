const Report = require("../models/report");

// Helper: admin status readable text
const getAdminStatus = (status) => {
  if (status === "pending") return "Pending Review";
  if (status === "verified") return "Verified";
  if (status === "matched") return "Matched";
  if (status === "closed") return "Closed";
  if (status === "rejected") return "Rejected";
  return "Pending Review";
};

// Helper: city from report.city first, then location
const getCity = (report, fallbackLocation = "") => {
  return report.city || fallbackLocation || "Unknown";
};

// GET STATISTICS REPORTS DATA
const getStatistics = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });

    const normalizedReports = reports.map((report) => {
      let title = "Untitled Report";
      let city = "Unknown";
      let date = report.createdAt;
      let type = "";
      let category = "";

      if (report.category === "item") {
        category = "Item";

        if (report.reportType === "lost") {
          type = "Lost";
          title = report.itemName || "Lost Item";
          city = getCity(report, report.lostLocation);
          date = report.lostDate || report.createdAt;
        }

        if (report.reportType === "found") {
          type = "Found";
          title = report.itemName || "Found Item";
          city = getCity(report, report.foundLocation);
          date = report.foundDate || report.createdAt;
        }
      }

      if (report.category === "person") {
        category = "Person";

        if (report.reportType === "lost") {
          type = "Missing";
          title = report.missingPersonName || "Missing Person";
          city = getCity(report, report.missingPersonLastSeenLocation);
          date = report.missingPersonLastSeenDate || report.createdAt;
        }

        if (report.reportType === "found") {
          type = "Found";
          title = report.foundPersonName || "Found Person";
          city = getCity(report, report.foundLocation);
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

        adminStatus: getAdminStatus(report.status),
        reportStatus: report.status,

        caseStatus: report.caseStatus || "Unsolved",

        flagCount: report.flagCount || 0,
        isVerified: report.isVerified || false,

        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
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

    const closedReports = reports.filter(
      (report) => report.status === "closed"
    ).length;

    const rejectedReports = reports.filter(
      (report) => report.status === "rejected"
    ).length;

    const solvedCases = reports.filter(
      (report) => report.caseStatus === "Solved"
    ).length;

    const unsolvedCases = reports.filter(
      (report) => report.caseStatus === "Unsolved"
    ).length;

    const closedCases = reports.filter(
      (report) => report.caseStatus === "Closed"
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
      closedReports,
      rejectedReports,

      solvedCases,
      unsolvedCases,
      closedCases,

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