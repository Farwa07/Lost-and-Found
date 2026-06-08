const Report = require("../models/report");
const ReportComplaint = require("../models/reportComplaint");

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
      reporterFullName,
      reporterContactNumber,
      reporterEmail,
      reporterAddress,
    } = req.body;

    const newReport = new Report({
      userId: req.user ? req.user.id : null,
      reportType: "lost",
      category: "item",

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
        ? req.files.lostItemImage[0].path
        : "",

      reporterIdCardImage: req.files?.reporterIdCardImage
        ? req.files.reporterIdCardImage[0].path
        : "",
    });

    await newReport.save();

    res.status(201).json({
      message: "Lost item report submitted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// createfounditemreport
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
      reporterFullName,
      reporterContactNumber,
      reporterEmail,
      reporterAddress,
    } = req.body;

    const newReport = new Report({
      userId: req.user ? req.user.id : null,
      reportType: "found",
      category: "item",

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
        ? req.files.foundItemImage[0].path
        : "",

      reporterIdCardImage: req.files?.reporterIdCardImage
        ? req.files.reporterIdCardImage[0].path
        : "",
    });

    await newReport.save();

    res.status(201).json({
      message: "Found item report submitted successfully",
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
      reporterFullName,
      reporterContactNumber,
      reporterRelationship,
    } = req.body;

    const newReport = new Report({
      userId: req.user ? req.user.id : null,
      reportType: "lost",
      category: "person",

      missingPersonName,
      missingPersonAge,
      missingPersonGender,
      missingPersonLastSeenLocation,
      missingPersonLastSeenDate,
      missingPersonDescription,

      reporterFullName,
      reporterContactNumber,
      reporterRelationship,

      missingPersonImage: req.files?.missingPersonImage
        ? req.files.missingPersonImage[0].path
        : "",

      reporterIdCardImage: req.files?.reporterIdCardImage
        ? req.files.reporterIdCardImage[0].path
        : "",

      firReportImage: req.files?.firReportImage
        ? req.files.firReportImage[0].path
        : "",
    });

    await newReport.save();

    res.status(201).json({
      message: "Missing person report submitted successfully",
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
      reporterFullName,
      reporterContactNumber,
      reporterRelationship,
    } = req.body;

    const newReport = new Report({
      userId: req.user ? req.user.id : null,
      reportType: "found",
      category: "person",

      foundPersonName,
      estimatedAge,
      foundPersonGender,
      foundLocation,
      foundDate,
      currentLocation,
      foundPersonDescription,

      reporterFullName,
      reporterContactNumber,
      reporterRelationship,

      foundPersonImage: req.files?.foundPersonImage
        ? req.files.foundPersonImage[0].path
        : "",

      reporterIdCardImage: req.files?.reporterIdCardImage
        ? req.files.reporterIdCardImage[0].path
        : "",
    });

    await newReport.save();

    res.status(201).json({
      message: "Found person report submitted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// GET ALL REPORTS
const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });

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
    const reports = await Report.find({ category: "item" }).sort({
      createdAt: -1,
    });

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
    const reports = await Report.find({ category: "person" }).sort({
      createdAt: -1,
    });

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

    const newComplaint = new ReportComplaint({
      reportId,
      userId: req.user ? req.user.id : null,
      reason,
    });

    await newComplaint.save();

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

// UPDATE MY REPORT STATUS
const updateMyReportStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["pending", "verified", "matched", "closed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const report = await Report.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      {
        status,
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
      message: "Report status updated successfully",
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
};
   