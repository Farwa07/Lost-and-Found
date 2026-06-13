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
  try {
    const reports = await Report.find({
      status: { $in: publicStatuses },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Reports fetched successfully",
      reports,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ITEM REPORTS ONLY
const getItemReports = async (req, res) => {
  try {
    const reports = await Report.find({
      category: "item",
      status: { $in: publicStatuses },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Item reports fetched successfully",
      reports,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET PERSON REPORTS ONLY
const getPersonReports = async (req, res) => {
  try {
    const reports = await Report.find({
      category: "person",
      status: { $in: publicStatuses },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Person reports fetched successfully",
      reports,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// SEARCH AND FILTER PUBLIC REPORTS
const searchReports = async (req, res) => {
  try {
    const {
      keyword,
      category,
      reportType,
      status,
      gender,
      itemCategory,
      city,
    } = req.query;

    const query = {
      status: { $in: publicStatuses },
    };

    if (category) {
      query.category = category.toLowerCase();
    }

    if (reportType) {
      query.reportType = reportType.toLowerCase();
    }

    if (status && publicStatuses.includes(status.toLowerCase())) {
      query.status = status.toLowerCase();
    }

    if (city) {
      query.city = { $regex: city, $options: "i" };
    }

    if (itemCategory) {
      query.itemCategory = { $regex: itemCategory, $options: "i" };
    }

    if (gender) {
      query.$or = [
        { missingPersonGender: { $regex: gender, $options: "i" } },
        { foundPersonGender: { $regex: gender, $options: "i" } },
      ];
    }

    if (keyword) {
      const keywordSearch = [
        { city: { $regex: keyword, $options: "i" } },

        { itemName: { $regex: keyword, $options: "i" } },
        { itemCategory: { $regex: keyword, $options: "i" } },
        { itemColor: { $regex: keyword, $options: "i" } },
        { itemBrand: { $regex: keyword, $options: "i" } },
        { itemDescription: { $regex: keyword, $options: "i" } },

        { lostLocation: { $regex: keyword, $options: "i" } },
        { foundLocation: { $regex: keyword, $options: "i" } },
        { currentLocation: { $regex: keyword, $options: "i" } },

        { missingPersonName: { $regex: keyword, $options: "i" } },
        { missingPersonGender: { $regex: keyword, $options: "i" } },
        {
          missingPersonLastSeenLocation: {
            $regex: keyword,
            $options: "i",
          },
        },
        { missingPersonDescription: { $regex: keyword, $options: "i" } },

        { foundPersonName: { $regex: keyword, $options: "i" } },
        { foundPersonGender: { $regex: keyword, $options: "i" } },
        { foundPersonDescription: { $regex: keyword, $options: "i" } },

        { reporterFullName: { $regex: keyword, $options: "i" } },
        { reporterEmail: { $regex: keyword, $options: "i" } },
        { reporterAddress: { $regex: keyword, $options: "i" } },
      ];

      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: keywordSearch }];
        delete query.$or;
      } else {
        query.$or = keywordSearch;
      }
    }

    const reports = await Report.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Reports searched successfully",
      count: reports.length,
      reports,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
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

    await Report.findByIdAndUpdate(reportId, {
      $push: {
        flags: {
          userId: req.user.id,
          userName: user?.fullName || "",
          reason,
          date: new Date(),
        },
      },
      $inc: {
        flagCount: 1,
      },
    });

    res.status(201).json({
      message: "Post reported successfully. Admin will review it.",
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
    const updateData = req.body;

    delete updateData.userId;
    delete updateData.status;
    delete updateData.isVerified;
    delete updateData.flags;
    delete updateData.flagCount;

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