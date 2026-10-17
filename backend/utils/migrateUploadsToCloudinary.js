// One-time script: uploads files that are still on the local disk
// (uploads/ and private_uploads/) to Cloudinary and updates the database.
// Run with: npm run migrate:cloudinary
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const Report = require("../models/report");
const User = require("../models/user");
const {
  useCloudinary,
  uploadBufferToCloudinary,
  toCloudStoredValue,
  resolveStoredFile,
  REPORT_FILE_FIELDS,
} = require("./uploads");

const MIME_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
};

// Returns the new stored value, or null when the value is not a local file.
const migrateValue = async (fieldName, value) => {
  const filePath = resolveStoredFile(value);
  if (!filePath) return null;

  if (!fs.existsSync(filePath)) {
    console.log(`  missing on disk, skipped: ${value}`);
    return null;
  }

  const file = {
    fieldname: fieldName,
    mimetype: MIME_TYPES[path.extname(filePath).toLowerCase()] || "image/jpeg",
    buffer: await fs.promises.readFile(filePath),
  };

  const result = await uploadBufferToCloudinary(file);
  return toCloudStoredValue(file, result);
};

const run = async () => {
  if (!useCloudinary) {
    console.log("CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET are missing in .env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  let migrated = 0;

  const reports = await Report.find({}).select(REPORT_FILE_FIELDS.join(" "));
  for (const report of reports) {
    const update = {};

    for (const field of REPORT_FILE_FIELDS) {
      const newValue = await migrateValue(field, report[field]);
      if (newValue) update[field] = newValue;
    }

    if (Object.keys(update).length) {
      await Report.updateOne({ _id: report._id }, { $set: update });
      migrated += Object.keys(update).length;
      console.log(`report ${report._id}: ${Object.keys(update).join(", ")}`);
    }
  }

  const users = await User.find({ profileImage: { $nin: ["", null] } }).select("profileImage");
  for (const user of users) {
    const newValue = await migrateValue("profileImage", user.profileImage);
    if (newValue) {
      await User.updateOne({ _id: user._id }, { $set: { profileImage: newValue } });
      migrated += 1;
      console.log(`user ${user._id}: profileImage`);
    }
  }

  console.log(`Done. ${migrated} files moved to Cloudinary.`);
  console.log("Local uploads/ and private_uploads/ folders were kept; delete them once you have checked the site.");
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.log("Migration failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
