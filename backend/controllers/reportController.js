const Report = require("../models/report");
const ReportComplaint = require("../models/reportComplaint");
const User = require("../models/user");

const publicStatuses = ["verified", "matched", "closed"];

const getImageUrl = (req, filePath) => {
  if (!filePath) return "";

  const cleanPath = filePath.replace(/\\/g, "/").replace(/^\/+/, "");

  return `${req.protocol}://${req.get("host")}/${cleanPath}`;
};

const getCity = (city, location = "") => {
  if (city) return city;

  const parts = String(location)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts[parts.length - 1] : "";
};

const escapeRegex = (value = "") => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const normalizeQueryValue = (value = "") => String(value || "").trim();

const normalizeReportTypeFilter = (value = "") => {
  const normalized = normalizeQueryValue(value).toLowerCase();

  if (!normalized || normalized === "all") return "";

  if (["lost", "missing"].includes(normalized)) return "lost";
  if (normalized === "found") return "found";

  return "";
};

const buildPublicReportQuery = (queryParams = {}, fixedCategory = "") => {
  const {
    keyword,
    search,
    category,
    reportType,
    status,
    gender,
    itemCategory,
    city,
  } = queryParams;

  const query = {
    status: { $in: publicStatuses },
  };

  const selectedCategory = normalizeQueryValue(fixedCategory || category).toLowerCase();

  if (["item", "person"].includes(selectedCategory)) {
    query.category = selectedCategory;
  }

  const selectedReportType = normalizeReportTypeFilter(reportType || status);

  if (selectedReportType) {
    query.reportType = selectedReportType;
  }

  const selectedCity = normalizeQueryValue(city);

  if (selectedCity && selectedCity.toLowerCase() !== "all") {
    query.city = { $regex: escapeRegex(selectedCity), $options: "i" };
  }

  const selectedItemCategory = normalizeQueryValue(itemCategory);

  if (selectedItemCategory && selectedItemCategory.toLowerCase() !== "all") {
    query.itemCategory = {
      $regex: `^${escapeRegex(selectedItemCategory)}$`,
      $options: "i",
    };
  }

  const selectedGender = normalizeQueryValue(gender);

  if (selectedGender && selectedGender.toLowerCase() !== "all") {
    query.$or = [
      {
        missingPersonGender: {
          $regex: `^${escapeRegex(selectedGender)}$`,
          $options: "i",
        },
      },
      {
        foundPersonGender: {
          $regex: `^${escapeRegex(selectedGender)}$`,
          $options: "i",
        },
      },
    ];
  }

  const keywordValue = normalizeQueryValue(keyword || search);

  if (keywordValue) {
    const keywordRegex = { $regex: escapeRegex(keywordValue), $options: "i" };

    const keywordSearch = [
      { city: keywordRegex },
      { itemName: keywordRegex },
      { itemCategory: keywordRegex },
      { itemColor: keywordRegex },
      { itemBrand: keywordRegex },
      { itemDescription: keywordRegex },
      { lostLocation: keywordRegex },
      { foundLocation: keywordRegex },
      { currentLocation: keywordRegex },
      { missingPersonName: keywordRegex },
      { missingPersonGender: keywordRegex },
      { missingPersonLastSeenLocation: keywordRegex },
      { missingPersonDescription: keywordRegex },
      { foundPersonName: keywordRegex },
      { foundPersonGender: keywordRegex },
      { foundPersonDescription: keywordRegex },
      { reporterFullName: keywordRegex },
      { reporterEmail: keywordRegex },
      { reporterAddress: keywordRegex },
    ];

    if (query.$or) {
      query.$and = [{ $or: query.$or }, { $or: keywordSearch }];
      delete query.$or;
    } else {
      query.$or = keywordSearch;
    }
  }

  return query;
};

const getPublicFilterOptions = async (category = "") => {
  const baseQuery = {
    status: { $in: publicStatuses },
  };

  if (category) {
    baseQuery.category = category;
  }

  const [cities, categories] = await Promise.all([
    Report.distinct("city", baseQuery),
    category === "item" ? Report.distinct("itemCategory", baseQuery) : [],
  ]);

  return {
    cities: cities.filter(Boolean).sort((a, b) => a.localeCompare(b)),
    categories: categories.filter(Boolean).sort((a, b) => a.localeCompare(b)),
  };
};

const getPublicReportsResponse = async (req, res, fixedCategory = "", message = "Reports fetched successfully") => {
  try {
    const query = buildPublicReportQuery(req.query, fixedCategory);
    const limitValue = Number(req.query.limit || 0);
    const limit = Number.isFinite(limitValue) && limitValue > 0 ? limitValue : 0;

    const reportsQuery = Report.find(query).sort({ createdAt: -1 });

    if (limit) {
      reportsQuery.limit(limit);
    }

    const [reports, total, filters] = await Promise.all([
      reportsQuery,
      Report.countDocuments(query),
      getPublicFilterOptions(fixedCategory),
    ]);

    return res.status(200).json({
      message,
      count: reports.length,
      total,
      filters,
      reports,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// CREATE LOST ITEM REPORT
const createLostItemReport = async (req, res) => {
  try {
    const {
      itemName,
      itemCategory,
      itemColor,
      itemBrand,
      lostLocation,
      lostDate,
      itemDescription,
      city,
      reporterFullName,
      reporterContactNumber,
      reporterEmail,
      reporterAddress,
    } = req.body;

    const newReport = new Report({
      userId: req.user ? req.user.id : null,
      reportType: "lost",
      category: "item",
      city: getCity(city, lostLocation),

      itemName,
      itemCategory,
      itemColor,
      itemBrand,
      lostLocation,
      lostDate,
      itemDescription,

      reporterFullName,
      reporterContactNumber,
      reporterEmail,
      reporterAddress,

      lostItemImage: req.files?.lostItemImage
        ? getImageUrl(req, req.files.lostItemImage[0].path)
        : "",

      reporterIdCardImage: req.files?.reporterIdCardImage
        ? getImageUrl(req, req.files.reporterIdCardImage[0].path)
        : "",
    });

    await newReport.save();

    res.status(201).json({
      message: "Lost item report submitted successfully",
      report: newReport,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// CREATE FOUND ITEM REPORT
const createFoundItemReport = async (req, res) => {
  try {
    const {
      itemName,
      itemCategory,
      itemColor,
      itemBrand,
      foundLocation,
      foundDate,
      currentLocation,
      itemDescription,
      city,
      reporterFullName,
      reporterContactNumber,
      reporterEmail,
      reporterAddress,
    } = req.body;

    const newReport = new Report({
      userId: req.user ? req.user.id : null,
      reportType: "found",
      category: "item",
      city: getCity(city, foundLocation),

      itemName,
      itemCategory,
      itemColor,
      itemBrand,
      foundLocation,
      foundDate,
      currentLocation,
      itemDescription,

      reporterFullName,
      reporterContactNumber,
      reporterEmail,
      reporterAddress,

      foundItemImage: req.files?.foundItemImage
        ? getImageUrl(req, req.files.foundItemImage[0].path)
        : "",

      reporterIdCardImage: req.files?.reporterIdCardImage
        ? getImageUrl(req, req.files.reporterIdCardImage[0].path)
        : "",
    });

    await newReport.save();

    res.status(201).json({
      message: "Found item report submitted successfully",
      report: newReport,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// CREATE MISSING PERSON REPORT
const createMissingPersonReport = async (req, res) => {
  try {
    const {
      missingPersonName,
      missingPersonAge,
      missingPersonGender,
      missingPersonLastSeenLocation,
      missingPersonLastSeenDate,
      missingPersonDescription,
      city,
      reporterFullName,
      reporterContactNumber,
      reporterEmail,
      reporterAddress,
      reporterRelationship,
    } = req.body;

    const newReport = new Report({
      userId: req.user ? req.user.id : null,
      reportType: "lost",
      category: "person",
      city: getCity(city, missingPersonLastSeenLocation),

      missingPersonName,
      missingPersonAge,
      missingPersonGender,
      missingPersonLastSeenLocation,
      missingPersonLastSeenDate,
      missingPersonDescription,

      reporterFullName,
      reporterContactNumber,
      reporterEmail,
      reporterAddress,
      reporterRelationship,

      missingPersonImage: req.files?.missingPersonImage
        ? getImageUrl(req, req.files.missingPersonImage[0].path)
        : "",

      reporterIdCardImage: req.files?.reporterIdCardImage
        ? getImageUrl(req, req.files.reporterIdCardImage[0].path)
        : "",

      firReportImage: req.files?.firReportImage
        ? getImageUrl(req, req.files.firReportImage[0].path)
        : "",
    });

    await newReport.save();

    res.status(201).json({
      message: "Missing person report submitted successfully",
      report: newReport,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// CREATE FOUND PERSON REPORT
const createFoundPersonReport = async (req, res) => {
  try {
    const {
      foundPersonName,
      estimatedAge,
      foundPersonGender,
      foundLocation,
      foundDate,
      currentLocation,
      foundPersonDescription,
      city,
      reporterFullName,
      reporterContactNumber,
      reporterEmail,
      reporterAddress,
      reporterRelationship,
    } = req.body;

    const newReport = new Report({
      userId: req.user ? req.user.id : null,
      reportType: "found",
      category: "person",
      city: getCity(city, foundLocation),

      foundPersonName,
      estimatedAge,
      foundPersonGender,
      foundLocation,
      foundDate,
      currentLocation,
      foundPersonDescription,

      reporterFullName,
      reporterContactNumber,
      reporterEmail,
      reporterAddress,
      reporterRelationship,

      foundPersonImage: req.files?.foundPersonImage
        ? getImageUrl(req, req.files.foundPersonImage[0].path)
        : "",

      reporterIdCardImage: req.files?.reporterIdCardImage
        ? getImageUrl(req, req.files.reporterIdCardImage[0].path)
        : "",
    });

    await newReport.save();

    res.status(201).json({
      message: "Found person report submitted successfully",
      report: newReport,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL PUBLIC REPORTS
const getAllReports = async (req, res) => {
  return getPublicReportsResponse(
    req,
    res,
    "",
    "Reports fetched successfully"
  );
};

// GET ITEM REPORTS ONLY
const getItemReports = async (req, res) => {
  return getPublicReportsResponse(
    req,
    res,
    "item",
    "Item reports fetched successfully"
  );
};

// GET PERSON REPORTS ONLY
const getPersonReports = async (req, res) => {
  return getPublicReportsResponse(
    req,
    res,
    "person",
    "Person reports fetched successfully"
  );
};

// SEARCH AND FILTER PUBLIC REPORTS
const searchReports = async (req, res) => {
  return getPublicReportsResponse(
    req,
    res,
    "",
    "Reports searched successfully"
  );
};

// GET SINGLE REPORT BY ID
const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    res.status(200).json({
      message: "Report fetched successfully",
      report,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET MY REPORTS
const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      message: "My reports fetched successfully",
      reports,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// REPORT A POST
const reportPost = async (req, res) => {
  try {
    const { reason } = req.body;
    const reportId = req.params.id;

    if (!reason) {
      return res.status(400).json({
        message: "Reason is required",
      });
    }

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    if (report.userId && report.userId.toString() === req.user.id) {
      return res.status(400).json({
        message: "You cannot report your own post",
      });
    }

    const alreadyFlagged = report.flags?.some(
      (flag) => flag.userId?.toString() === req.user.id
    );

    if (alreadyFlagged) {
      return res.status(400).json({
        message: "You have already reported this post",
      });
    }

    const user = await User.findById(req.user.id).select("fullName email");

    const newComplaint = new ReportComplaint({
      reportId,
      userId: req.user.id,
      reason,
    });

    await newComplaint.save();

    const updatedReport = await Report.findByIdAndUpdate(
      reportId,
      {
        $push: {
          flags: {
            userId: req.user.id,
            userName: user?.fullName || user?.email || "User",
            reason,
            date: new Date(),
          },
        },
        $inc: {
          flagCount: 1,
        },
      },
      {
        new: true,
      }
    );

    res.status(201).json({
      message: "Post reported successfully. Admin will review it.",
      report: updatedReport,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE MY REPORT
const deleteMyReport = async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!report) {
      return res.status(404).json({
        message: "Report not found or you are not allowed to delete it",
      });
    }

    res.status(200).json({
      message: "Report deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE MY REPORT CASE STATUS
const updateMyReportStatus = async (req, res) => {
  try {
    const { caseStatus } = req.body;

    const allowedCaseStatuses = ["Unsolved", "Solved", "Closed"];

    if (!allowedCaseStatuses.includes(caseStatus)) {
      return res.status(400).json({
        message: "Invalid case status value",
      });
    }

    const report = await Report.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      {
        caseStatus,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!report) {
      return res.status(404).json({
        message: "Report not found or you are not allowed to update it",
      });
    }

    res.status(200).json({
      message: "Case status updated successfully",
      report,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE MY REPORT DETAILS
const updateMyReport = async (req, res) => {
  try {
    const updateData = { ...(req.body || {}) };

    delete updateData.userId;
    delete updateData.status;
    delete updateData.isVerified;
    delete updateData.flags;
    delete updateData.flagCount;
    delete updateData.matchedWith;
    delete updateData.matchId;
    delete updateData.matchScore;
    delete updateData.matchedFields;
    delete updateData.matchedAt;
    delete updateData.matchedBy;

    const imageFieldNames = [
      "lostItemImage",
      "foundItemImage",
      "missingPersonImage",
      "foundPersonImage",
    ];

    imageFieldNames.forEach((fieldName) => {
      if (req.files?.[fieldName]?.[0]) {
        updateData[fieldName] = getImageUrl(req, req.files[fieldName][0].path);
      }
    });

    const report = await Report.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!report) {
      return res.status(404).json({
        message: "Report not found or you are not allowed to update it",
      });
    }

    res.status(200).json({
      message: "Report updated successfully",
      report,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
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
};