const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const { Readable } = require("stream");
const cloudinary = require("cloudinary").v2;

// Files are stored on Cloudinary when CLOUDINARY_* env variables are set.
// Without them (local development) files fall back to the local disk:
// public images in /uploads, CNIC/FIR documents in private_uploads.
const PUBLIC_UPLOAD_DIR = path.join(__dirname, "..", "uploads");
const PRIVATE_UPLOAD_DIR = path.join(__dirname, "..", "private_uploads");

const PUBLIC_PREFIX = "/uploads/";
const PRIVATE_PREFIX = "private/";
// Stored value for a private Cloudinary document:
// "cloudinary-private:<resourceType>:<format>:<publicId>"
const CLOUD_PRIVATE_PREFIX = "cloudinary-private:";

const CLOUD_FOLDER = process.env.CLOUDINARY_FOLDER || "lost-and-found";

const PRIVATE_FIELDS = ["reporterIdCardImage", "firReportImage"];

// Cloudinary sub-folder (under documents/) for each private field.
const DOCUMENT_FOLDERS = {
  reporterIdCardImage: "cnic",
  firReportImage: "fir",
};

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

const useCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else {
  [PUBLIC_UPLOAD_DIR, PRIVATE_UPLOAD_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

const isPrivateField = (fieldName) => PRIVATE_FIELDS.includes(fieldName);

const getAllowedTypes = (fieldName) =>
  isPrivateField(fieldName) ? DOCUMENT_TYPES : IMAGE_TYPES;

// Never trust the original filename: generate a random name and pick the
// extension from the validated MIME type.
const randomFileName = () => `${Date.now()}-${crypto.randomBytes(12).toString("hex")}`;

const storage = useCloudinary
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, isPrivateField(file.fieldname) ? PRIVATE_UPLOAD_DIR : PUBLIC_UPLOAD_DIR);
      },
      filename: (req, file, cb) => {
        cb(null, `${randomFileName()}${getAllowedTypes(file.fieldname)[file.mimetype]}`);
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

const multerUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5,
  },
});

const uploadBufferToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const isPrivate = isPrivateField(file.fieldname);
    const isPdf = file.mimetype === "application/pdf";

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${CLOUD_FOLDER}/${isPrivate ? `documents/${DOCUMENT_FOLDERS[file.fieldname]}` : "images"}`,
        // Raw files keep their extension inside the public id.
        public_id: `${randomFileName()}${isPdf ? ".pdf" : ""}`,
        type: isPrivate ? "private" : "upload",
        resource_type: isPdf ? "raw" : "image",
        overwrite: false,
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );

    Readable.from(file.buffer).pipe(stream);
  });

const toCloudStoredValue = (file, result) =>
  isPrivateField(file.fieldname)
    ? `${CLOUD_PRIVATE_PREFIX}${result.resource_type}:${result.format || ""}:${result.public_id}`
    : result.secure_url;

const getRequestFiles = (req) => [
  ...(req.file ? [req.file] : []),
  ...Object.values(req.files || {}).flat(),
];

// Runs after multer: pushes every file in the request to Cloudinary and keeps
// the stored value on the file object so controllers can use toStoredPath().
const persistToCloudinary = async (req, res, next) => {
  if (!useCloudinary) return next();

  const files = getRequestFiles(req);

  try {
    await Promise.all(
      files.map(async (file) => {
        const result = await uploadBufferToCloudinary(file);
        file.storedValue = toCloudStoredValue(file, result);
        file.buffer = undefined;
      })
    );
    next();
  } catch (error) {
    await removeUploadedRequestFiles(req);
    console.log("Cloudinary upload error:", error.message);
    next(Object.assign(new Error("Image upload failed. Please try again."), { status: 502 }));
  }
};

// Same interface as multer (upload.single / upload.fields); each returns a
// middleware chain that also stores the files on Cloudinary.
const upload = {
  single: (fieldName) => [multerUpload.single(fieldName), persistToCloudinary],
  fields: (fields) => [multerUpload.fields(fields), persistToCloudinary],
};

// Value saved in the database for an uploaded file. Local paths are stored
// relative so changing host/port or deploying does not break old images.
const toStoredPath = (file) => {
  if (!file) return "";
  if (file.storedValue) return file.storedValue;
  return isPrivateField(file.fieldname)
    ? `${PRIVATE_PREFIX}${file.filename}`
    : `${PUBLIC_PREFIX}${file.filename}`;
};

const isCloudPrivateValue = (value = "") => String(value || "").startsWith(CLOUD_PRIVATE_PREFIX);

const parseCloudPrivateValue = (value = "") => {
  const [resourceType, format, ...rest] = String(value)
    .slice(CLOUD_PRIVATE_PREFIX.length)
    .split(":");
  return { resourceType, format, publicId: rest.join(":") };
};

// "https://res.cloudinary.com/<cloud>/image/upload/v123/folder/name.jpg"
//   -> { resourceType: "image", type: "upload", publicId: "folder/name" }
const parseCloudPublicUrl = (value = "") => {
  const match = String(value || "").match(
    /^https?:\/\/res\.cloudinary\.com\/[^/]+\/(image|raw|video)\/(upload|private|authenticated)\/(?:[^/]+\/)*?(?:v\d+\/)?(.+?)(\.[a-z0-9]+)?$/i
  );
  if (!match) return null;

  const [, resourceType, type, publicId, extension] = match;
  // Raw files keep their extension as part of the public id.
  return {
    resourceType,
    type,
    publicId: resourceType === "raw" && extension ? `${publicId}${extension}` : publicId,
  };
};

// Resolves a stored local value (relative path, private path or a legacy
// absolute http://host/uploads/... URL) to a file on disk.
const resolveStoredFile = (value = "") => {
  const text = String(value || "").trim();
  if (!text) return null;

  if (text.startsWith(PRIVATE_PREFIX)) {
    return path.join(PRIVATE_UPLOAD_DIR, path.basename(text.slice(PRIVATE_PREFIX.length)));
  }

  const match = text.match(/\/uploads\/([^/?#]+)/);
  if (match && !text.includes("res.cloudinary.com")) {
    return path.join(PUBLIC_UPLOAD_DIR, path.basename(decodeURIComponent(match[1])));
  }

  return null;
};

const removeStoredFile = async (value) => {
  const text = String(value || "").trim();
  if (!text) return;

  try {
    if (isCloudPrivateValue(text)) {
      const { resourceType, publicId } = parseCloudPrivateValue(text);
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, type: "private", invalidate: true });
      return;
    }

    const cloudAsset = parseCloudPublicUrl(text);
    if (cloudAsset) {
      await cloudinary.uploader.destroy(cloudAsset.publicId, {
        resource_type: cloudAsset.resourceType,
        type: cloudAsset.type,
        invalidate: true,
      });
      return;
    }

    const filePath = resolveStoredFile(text);
    if (filePath) await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.log("File delete error:", error.message);
    }
  }
};

const removeStoredFiles = async (values = []) => {
  await Promise.all(values.filter(Boolean).map(removeStoredFile));
};

// Cleans up files already written (to disk or Cloudinary) when the request
// fails afterwards.
const removeUploadedRequestFiles = async (req) => {
  await Promise.all(
    getRequestFiles(req).map((file) => {
      if (file.storedValue) return removeStoredFile(file.storedValue);
      if (file.path) return fs.promises.unlink(file.path).catch(() => {});
      return null;
    })
  );
};

// Streams a private document (CNIC/FIR) to the response. Cloudinary documents
// are fetched with a short-lived signed URL so the asset itself is never
// publicly reachable. Returns false when the document cannot be found.
const sendStoredDocument = async (res, value) => {
  if (isCloudPrivateValue(value)) {
    const { resourceType, format, publicId } = parseCloudPrivateValue(value);
    const url = cloudinary.utils.private_download_url(publicId, format, {
      resource_type: resourceType,
      type: "private",
      expires_at: Math.floor(Date.now() / 1000) + 60,
    });

    const response = await fetch(url);
    if (!response.ok || !response.body) return false;

    res.setHeader("Content-Type", response.headers.get("content-type") || "application/octet-stream");
    Readable.fromWeb(response.body).pipe(res);
    return true;
  }

  const filePath = resolveStoredFile(value);
  if (!filePath) return false;

  return new Promise((resolve) => {
    res.sendFile(filePath, (error) => resolve(!error));
  });
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
  cloudinary,
  useCloudinary,
  upload,
  uploadBufferToCloudinary,
  toCloudStoredValue,
  PUBLIC_UPLOAD_DIR,
  PRIVATE_UPLOAD_DIR,
  PRIVATE_PREFIX,
  PRIVATE_FIELDS,
  REPORT_FILE_FIELDS,
  toStoredPath,
  resolveStoredFile,
  removeStoredFile,
  removeStoredFiles,
  removeUploadedRequestFiles,
  sendStoredDocument,
  getReportFiles,
};
