const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require("multer");
const contactRoutes = require("./routes/contactRoutes");

const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const statsRoutes = require("./routes/statsRoutes");
const commentRoutes = require("./routes/commentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const matchRoutes = require("./routes/matchRoutes");
const profileRoutes = require("./routes/profileRoutes");
const seedAdmin = require("./utils/seedAdmin");
const migrateLegacyData = require("./utils/migrateLegacyData");
const { PUBLIC_UPLOAD_DIR, removeUploadedRequestFiles } = require("./utils/uploads");
const { recomputeAllMatches, syncAllConfirmedMatchReports } = require("./controllers/adminController");


const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  ...String(process.env.CORS_ORIGINS || "").split(","),
]
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Requests without an Origin header (curl, server-to-server) are allowed.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(null, false);
    },
  })
);
app.use(express.json({ limit: "1mb" }));
// Only public images live here. CNIC/FIR documents are stored in
// private_uploads and served through an authenticated route.
app.use(
  "/uploads",
  express.static(PUBLIC_UPLOAD_DIR, {
    setHeaders: (res) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
    },
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/statistics", statsRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/contact", contactRoutes);


// Testing simple route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Upload and other unhandled errors
app.use(async (err, req, res, next) => {
  await removeUploadedRequestFiles(req);

  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File is too large. Maximum size is 5 MB."
        : err.message || "Invalid file upload.";

    return res.status(400).json({ message });
  }

  console.log("Unhandled error:", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong",
  });
});

// Database connection + server start
const port = process.env.PORT || 5000;
const uri = process.env.MONGO_URI;

if (!uri) {
  console.log("MONGO_URI is missing in .env file");
  process.exit(1);
}


mongoose
  .connect(uri, {
    serverSelectionTimeoutMS: 10000,
  })
 .then(async () => {
  console.log("MongoDB connected");

  await seedAdmin();
  await migrateLegacyData();
  await syncAllConfirmedMatchReports();
  await recomputeAllMatches();

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
})
  .catch((err) => {
    console.log("MongoDB connection error:", err.message);
  });