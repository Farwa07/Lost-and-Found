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
      default: "",
    },

    itemCategory: {
      type: String,
      default: "",
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
      default: "",
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

    // Missing person fields
    missingPersonName: {
      type: String,
      default: "",
    },

    missingPersonAge: {
      type: Number,
    },

    missingPersonGender: {
      type: String,
      default: "",
    },

    missingPersonLastSeenLocation: {
      type: String,
      default: "",
    },

    missingPersonLastSeenDate: {
      type: Date,
    },

    missingPersonDescription: {
      type: String,
      default: "",
    },

    reporterRelationship: {
      type: String,
      default: "",
    },

    missingPersonImage: {
      type: String,
      default: "",
    },

    firReportImage: {
      type: String,
      default: "",
    },

    // Found person fields
foundPersonName: {
  type: String,
  default: "",
},

estimatedAge: {
  type: Number,
},

foundPersonGender: {
  type: String,
  default: "",
},

foundPersonDescription: {
  type: String,
  default: "",
},

foundPersonImage: {
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
      default: "",
    },

    reporterAddress: {
      type: String,
      default: "",
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