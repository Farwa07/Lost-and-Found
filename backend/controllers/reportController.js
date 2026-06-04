const Report = require("../models/report");

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

module.exports = {
  createLostItemReport,
  createFoundItemReport,
};

   