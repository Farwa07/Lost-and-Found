const fs = require("fs");
const path = require("path");
const Report = require("../models/report");
const User = require("../models/user");
const {
  PRIVATE_UPLOAD_DIR,
  PRIVATE_PREFIX,
  PRIVATE_FIELDS,
  resolveStoredFile,
} = require("./uploads");

const PUBLIC_IMAGE_FIELDS = [
  "lostItemImage",
  "foundItemImage",
  "missingPersonImage",
  "foundPersonImage",
];

const LEGACY_URL_REGEX = /^https?:\/\/[^/]+(\/uploads\/.+)$/;

// "http://localhost:4230/uploads/x.jpg" -> "/uploads/x.jpg"
const toRelativeUploadPath = (value = "") => {
  const match = String(value || "").match(LEGACY_URL_REGEX);
  return match ? match[1] : value;
};

// Moves a document that was saved in the public uploads folder into the
// private folder and returns the new stored value.
const moveToPrivate = async (value) => {
  const source = resolveStoredFile(value);
  if (!source) return value;

  const fileName = path.basename(source);
  const target = path.join(PRIVATE_UPLOAD_DIR, fileName);

  try {
    await fs.promises.rename(source, target);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.log("Private file migration error:", error.message);
      return value;
    }
  }

  return `${PRIVATE_PREFIX}${fileName}`;
};

// "03001234567" / "923001234567" / "+92 300 1234567" -> "+923001234567".
// Returns null when the value cannot be converted safely.
const normalizePhone = (value = "") => {
  const digits = String(value || "").replace(/\D/g, "");

  if (/^03[0-9]{9}$/.test(digits)) return `+92${digits.slice(1)}`;
  if (/^923[0-9]{9}$/.test(digits)) return `+${digits}`;

  return null;
};

// Older accounts/reports were saved before the +92 rule existed. An invalid
// phone makes every full-document save (e.g. password change) fail validation.
const migratePhoneNumbers = async () => {
  const validPhone = /^\+92[0-9]{10}$/;
  const unfixable = [];

  const targets = [
    { collection: User.collection, field: "phone", label: "users" },
    { collection: Report.collection, field: "reporterContactNumber", label: "reports" },
  ];

  for (const { collection, field, label } of targets) {
    const docs = await collection
      .find({ [field]: { $not: validPhone } }, { projection: { [field]: 1, email: 1 } })
      .toArray();

    let fixed = 0;

    for (const doc of docs) {
      const phone = normalizePhone(doc[field]);

      if (!phone) {
        unfixable.push(`${label}: ${doc.email || doc._id} -> "${doc[field]}"`);
        continue;
      }

      await collection.updateOne({ _id: doc._id }, { $set: { [field]: phone } });
      fixed += 1;
    }

    if (fixed) console.log(`Phone numbers normalized: ${fixed} ${label}`);
  }

  if (unfixable.length) {
    console.log(
      `Invalid phone numbers that need manual update:\n  ${unfixable.join("\n  ")}`
    );
  }
};

const migrateLegacyData = async () => {
  try {
    await migratePhoneNumbers();

    let reportsUpdated = 0;

    const reports = await Report.find({
      $or: [
        ...PRIVATE_FIELDS.map((field) => ({ [field]: { $regex: "/uploads/" } })),
        ...PUBLIC_IMAGE_FIELDS.map((field) => ({ [field]: { $regex: "^https?://" } })),
      ],
    });

    for (const report of reports) {
      const update = {};

      for (const field of PRIVATE_FIELDS) {
        if (String(report[field] || "").includes("/uploads/")) {
          update[field] = await moveToPrivate(report[field]);
        }
      }

      for (const field of PUBLIC_IMAGE_FIELDS) {
        const relative = toRelativeUploadPath(report[field]);
        if (relative !== report[field]) update[field] = relative;
      }

      if (Object.keys(update).length > 0) {
        await Report.updateOne({ _id: report._id }, { $set: update });
        reportsUpdated += 1;
      }
    }

    const users = await User.find({ profileImage: { $regex: "^https?://[^/]+/uploads/" } }).select(
      "profileImage"
    );

    for (const user of users) {
      await User.updateOne(
        { _id: user._id },
        { $set: { profileImage: toRelativeUploadPath(user.profileImage) } }
      );
    }

    if (reportsUpdated || users.length) {
      console.log(
        `Legacy data migrated: ${reportsUpdated} reports, ${users.length} profile images`
      );
    }
  } catch (error) {
    console.log("Legacy data migration error:", error.message);
  }
};

module.exports = migrateLegacyData;
