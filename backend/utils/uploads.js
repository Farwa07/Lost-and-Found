const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");

// Public images (item/person photos, profile pictures) are served from /uploads.
// Sensitive documents (CNIC, FIR) live outside the static folder and are only
// reachable through an authenticated endpoint.
const PUBLIC_UPLOAD_DIR = path.join(__dirname, "..", "uploads");
const PRIVATE_UPLOAD_DIR = path.join(__dirname, "..", "private_uploads");

const PUBLIC_PREFIX = "/uploads/";
const PRIVATE_PREFIX = "private/";

const PRIVATE_FIELDS = ["reporterIdCardImage", "firReportImage"];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const IMAGE_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const DOCUMENT_TYPES = {
  ...IMAGE_TYPES,
  "application/pdf": ".pdf",
};

[PUBLIC_UPLOAD_DIR, PRIVATE_UPLOAD_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const isPrivateField = (fieldName) => PRIVATE_FIELDS.includes(fieldName);

const getAllowedTypes = (fieldName) =>
  isPrivateField(fieldName) ? DOCUMENT_TYPES : IMAGE_TYPES;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, isPrivateField(file.fieldname) ? PRIVATE_UPLOAD_DIR : PUBLIC_UPLOAD_DIR);
  },

  // Never trust the original filename: generate a random name and pick the
  // extension from the validated MIME type.
  filename: (req, file, cb) => {
    const extension = getAllowedTypes(file.fieldname)[file.mimetype];
    cb(null, `${Date.now()}-${crypto.randomBytes(12).toString("hex")}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!getAllowedTypes(file.fieldname)[file.mimetype]) {
    const error = new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname);
    error.message = isPrivateField(file.fieldname)
      ? "Only JPG, PNG, WEBP, GIF or PDF files are allowed for documents."
      : "Only JPG, PNG, WEBP or GIF images are allowed.";
    return cb(error);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5,
  },
});

// Value saved in the database for an uploaded file. Paths are stored relative
// so changing host/port or deploying does not break old images.
const toStoredPath = (file) => {
  if (!file) return "";
  return isPrivateField(file.fieldname)
    ? `${PRIVATE_PREFIX}${file.filename}`
    : `${PUBLIC_PREFIX}${file.filename}`;
};

// Resolves a stored value (relative path, private path or a legacy absolute
// http://host/uploads/... URL) to a file on disk.
const resolveStoredFile = (value = "") => {
  const text = String(value || "").trim();
  if (!text) return null;

  if (text.startsWith(PRIVATE_PREFIX)) {
    return path.join(PRIVATE_UPLOAD_DIR, path.basename(text.slice(PRIVATE_PREFIX.length)));
  }

  const match = text.match(/\/uploads\/([^/?#]+)/);
  if (match) {
    return path.join(PUBLIC_UPLOAD_DIR, path.basename(decodeURIComponent(match[1])));
  }

  return null;
};

const removeStoredFile = async (value) => {
  const filePath = resolveStoredFile(value);
  if (!filePath) return;

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.log("File delete error:", error.message);
    }
  }
};

const removeStoredFiles = async (values = []) => {
  await Promise.all(values.filter(Boolean).map(removeStoredFile));
};

// Cleans up files multer already wrote when the request fails afterwards.
const removeUploadedRequestFiles = async (req) => {
  const files = [
    ...(req.file ? [req.file] : []),
    ...Object.values(req.files || {}).flat(),
  ];

  await Promise.all(
    files.map((file) =>
      fs.promises.unlink(file.path).catch(() => {})
    )
  );
};

const REPORT_FILE_FIELDS = [
  "lostItemImage",
  "foundItemImage",
  "missingPersonImage",
  "foundPersonImage",
  ...PRIVATE_FIELDS,
];

const getReportFiles = (report = {}) =>
  REPORT_FILE_FIELDS.map((field) => report[field]).filter(Boolean);

module.exports = {
  upload,
  PUBLIC_UPLOAD_DIR,
  PRIVATE_UPLOAD_DIR,
  PRIVATE_PREFIX,
  PRIVATE_FIELDS,
  toStoredPath,
  resolveStoredFile,
  removeStoredFile,
  removeStoredFiles,
  removeUploadedRequestFiles,
  getReportFiles,
};
