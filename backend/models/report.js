const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    reportType: {
      type: String,
      enum: ["lost", "found"],
      required: true,
    },

    category: {
      type: String,
      enum: ["item", "person"],
      required: true,
    },

    // Common item fields
    itemName: {
      type: String,
      required: true,
    },

    itemCategory: {
      type: String,
      required: true,
    },

    itemColor: {
      type: String,
      default: "",
    },

    itemBrand: {
      type: String,
      default: "",
    },

    itemDescription: {
      type: String,
      required: true,
    },

    // Lost item fields
    lostLocation: {
      type: String,
      default: "",
    },

    lostDate: {
      type: Date,
    },

    lostItemImage: {
      type: String,
      default: "",
    },

    // Found item fields
    foundLocation: {
      type: String,
      default: "",
    },

    foundDate: {
      type: Date,
    },

    currentLocation: {
      type: String,
      default: "",
    },

    foundItemImage: {
      type: String,
      default: "",
    },

    // Reporter fields
    reporterFullName: {
      type: String,
      required: true,
    },

    reporterContactNumber: {
      type: String,
      required: true,
    },

    reporterEmail: {
      type: String,
      required: true,
    },

    reporterAddress: {
      type: String,
      required: true,
    },

    reporterIdCardImage: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "verified", "matched", "closed"],
      default: "pending",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);