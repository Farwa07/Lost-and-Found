const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const fs = require("fs");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const statsRoutes = require("./routes/statsRoutes");
const commentRoutes = require("./routes/commentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const matchRoutes = require("./routes/matchRoutes");
const profileRoutes = require("./routes/profileRoutes");
const seedAdmin = require("./utils/seedAdmin");


const app = express();
const uploadPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

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


// Testing simple route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Database connection + server start
const port = process.env.PORT || 5000;
const uri = process.env.MONGO_URI;

if (!uri) {
  console.log("MONGO_URI is missing in .env file");
  process.exit(1);
}

console.log("Connecting to MongoDB...");

mongoose
  .connect(uri, {
    serverSelectionTimeoutMS: 10000,
  })
 .then(async () => {
  console.log("MongoDB connected");

  await seedAdmin();

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
})
  .catch((err) => {
    console.log("MongoDB connection error:", err.message);
  });