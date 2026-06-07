const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const statsRoutes = require("./routes/statsRoutes");
const commentRoutes = require("./routes/commentRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/comments", commentRoutes);


// Database connection
const port = process.env.PORT || 5000;
const uri = process.env.MONGO_URI;

mongoose.connect(uri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Testing simple route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});