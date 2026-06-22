const Report = require("../models/report");

const monthOptions = [
  "All Months",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const allMonths = monthOptions.filter((month) => month !== "All Months");

const monthShortNames = {
  January: "Jan",
  February: "Feb",
  March: "Mar",
  April: "Apr",
  May: "May",
  June: "Jun",
  July: "Jul",
  August: "Aug",
  September: "Sep",
  October: "Oct",
  November: "Nov",
  December: "Dec",
};

const normalizeFilterValue = (value = "") => String(value || "").trim();

const getAdminStatus = (status = "pending") => {
  const statuses = {
    pending: "Pending Review",
    verified: "Verified",
    matched: "Matched",
    closed: "Closed",
    rejected: "Rejected",
  };

  return statuses[status] || "Pending Review";
};

const cleanCityName = (value = "") => {
  return String(value || "")
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, " ");
};

const titleCaseCity = (value = "") => {
  return cleanCityName(value)
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const getCity = (report) => {
  if (report.city) {
    return titleCaseCity(report.city);
  }

  const fallbackLocation =
    report.lostLocation ||
    report.foundLocation ||
    report.missingPersonLastSeenLocation ||
    report.reporterAddress ||
    "";

  const locationParts = String(fallbackLocation)
    .split(",")
    .map((part) => cleanCityName(part))
    .filter(Boolean);

  if (locationParts.length > 1) {
    return titleCaseCity(locationParts[locationParts.length - 1]);
  }

  const words = cleanCityName(fallbackLocation).split(" ").filter(Boolean);

  if (words.length > 0) {
    return titleCaseCity(words[words.length - 1]);
  }

  return "Unknown";
};

const getReportDate = (report) => {
  if (report.category === "item" && report.reportType === "lost") {
    return report.lostDate || report.createdAt;
  }

  if (report.category === "item" && report.reportType === "found") {
    return report.foundDate || report.createdAt;
  }

  if (report.category === "person" && report.reportType === "lost") {
    return report.missingPersonLastSeenDate || report.createdAt;
  }

  if (report.category === "person" && report.reportType === "found") {
    return report.foundDate || report.createdAt;
  }

  return report.createdAt;
};

const getMonthName = (dateValue) => {
  if (!dateValue) {
    return "Unknown";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString("en-US", { month: "long" });
};

const isResolvedReport = (report) => {
  return (
    report.caseStatus === "Solved" ||
    report.caseStatus === "Closed" ||
    report.status === "matched" ||
    report.status === "closed"
  );
};

const getSuccessRate = (resolved, total) => {
  if (!total) {
    return 0;
  }

  return Math.round((resolved / total) * 100);
};

const getReportTitle = (report) => {
  if (report.category === "item") {
    return report.itemName || "Untitled Item";
  }

  if (report.reportType === "lost") {
    return report.missingPersonName || "Untitled Person";
  }

  return report.foundPersonName || "Untitled Person";
};

const normalizeReport = (report) => {
  const type = report.reportType === "found" ? "Found" : report.category === "person" ? "Missing" : "Lost";
  const date = getReportDate(report);

  return {
    id: String(report._id),
    _id: String(report._id),
    type,
    status: type,
    category: report.category === "person" ? "Person" : "Item",
    reportCategory: report.category,
    reportType: report.reportType,
    title: getReportTitle(report),
    city: getCity(report),
    date,
    month: getMonthName(date),
    itemCategory: report.itemCategory || "Other",
    adminStatus: getAdminStatus(report.status),
    reportStatus: report.status,
    caseStatus: report.caseStatus || "Unsolved",
    flagCount: report.flagCount || 0,
    isResolved: isResolvedReport(report),
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
  };
};

const getSummary = (reports, activeType) => {
  const mainType = activeType === "persons" ? "Missing" : "Lost";
  const main = reports.filter((report) => report.type === mainType).length;
  const found = reports.filter((report) => report.type === "Found").length;
  const resolved = reports.filter((report) => report.isResolved).length;
  const total = reports.length;

  return {
    main,
    found,
    resolved,
    total,
    successRate: getSuccessRate(resolved, total),
  };
};

const buildMonthlyTrend = (reports, activeType, selectedMonth) => {
  const months = selectedMonth === "All Months" ? allMonths : [selectedMonth];
  const mainType = activeType === "persons" ? "Missing" : "Lost";

  return months.map((monthName) => {
    const monthReports = reports.filter((report) => report.month === monthName);

    return {
      month: monthShortNames[monthName] || monthName,
      fullMonth: monthName,
      main: monthReports.filter((report) => report.type === mainType).length,
      found: monthReports.filter((report) => report.type === "Found").length,
      resolved: monthReports.filter((report) => report.isResolved).length,
    };
  });
};

const buildCityWiseCases = (reports) => {
  const grouped = reports.reduce((acc, report) => {
    const city = report.city || "Unknown";

    if (!acc[city]) {
      acc[city] = {
        city,
        total: 0,
      };
    }

    acc[city].total += 1;
    return acc;
  }, {});

  return Object.values(grouped).sort((a, b) => b.total - a.total || a.city.localeCompare(b.city));
};

const buildDetailedStats = (reports, activeType) => {
  const mainType = activeType === "persons" ? "Missing" : "Lost";

  const grouped = reports.reduce((acc, report) => {
    const city = report.city || "Unknown";
    const month = report.month || "Unknown";
    const key = `${city}-${month}`;

    if (!acc[key]) {
      acc[key] = {
        city,
        month,
        main: 0,
        found: 0,
        resolved: 0,
        total: 0,
        successRate: 0,
      };
    }

    if (report.type === mainType) {
      acc[key].main += 1;
    }

    if (report.type === "Found") {
      acc[key].found += 1;
    }

    if (report.isResolved) {
      acc[key].resolved += 1;
    }

    acc[key].total += 1;
    acc[key].successRate = getSuccessRate(acc[key].resolved, acc[key].total);

    return acc;
  }, {});

  return Object.values(grouped).sort((a, b) => {
    if (a.city === b.city) {
      return allMonths.indexOf(a.month) - allMonths.indexOf(b.month);
    }

    return a.city.localeCompare(b.city);
  });
};

const getStatistics = async (req, res) => {
  try {
    const activeType = req.query.type === "items" ? "items" : "persons";
    const selectedCity = normalizeFilterValue(req.query.city) || "All Cities";
    const selectedMonth = normalizeFilterValue(req.query.month) || "All Months";

    const reports = await Report.find({ status: { $ne: "rejected" } }).sort({ createdAt: -1 });
    const normalizedReports = reports.map(normalizeReport);

    const categoryReports = normalizedReports.filter((report) =>
      activeType === "persons" ? report.reportCategory === "person" : report.reportCategory === "item"
    );

    const cityOptions = [
      "All Cities",
      ...new Set(categoryReports.map((report) => report.city).filter(Boolean)),
    ].sort((a, b) => {
      if (a === "All Cities") return -1;
      if (b === "All Cities") return 1;
      return a.localeCompare(b);
    });

    const filteredReports = categoryReports.filter((report) => {
      const cityMatch = selectedCity === "All Cities" || report.city === selectedCity;
      const monthMatch = selectedMonth === "All Months" || report.month === selectedMonth;

      return cityMatch && monthMatch;
    });

    const trendBaseReports = categoryReports.filter((report) => {
      return selectedCity === "All Cities" || report.city === selectedCity;
    });

    const summary = getSummary(filteredReports, activeType);
    const monthlyTrend = buildMonthlyTrend(trendBaseReports, activeType, selectedMonth);
    const cityWiseCases = buildCityWiseCases(filteredReports);
    const detailedStats = buildDetailedStats(filteredReports, activeType);

    const totalReports = normalizedReports.length;
    const lostItems = normalizedReports.filter(
      (report) => report.reportCategory === "item" && report.reportType === "lost"
    ).length;
    const foundItems = normalizedReports.filter(
      (report) => report.reportCategory === "item" && report.reportType === "found"
    ).length;
    const missingPersons = normalizedReports.filter(
      (report) => report.reportCategory === "person" && report.reportType === "lost"
    ).length;
    const foundPersons = normalizedReports.filter(
      (report) => report.reportCategory === "person" && report.reportType === "found"
    ).length;

    res.status(200).json({
      message: "Statistics fetched successfully",
      activeType,
      filters: {
        city: selectedCity,
        month: selectedMonth,
      },
      monthOptions,
      cityOptions,
      summary,
      monthlyTrend,
      cityWiseCases,
      detailedStats,
      reports: filteredReports,
      totals: {
        totalReports,
        lostItems,
        foundItems,
        missingPersons,
        foundPersons,
      },
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
