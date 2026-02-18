const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const applicationRoutes = require("./routes/applicationRoutes");


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/applications", applicationRoutes);

app.get("/", (req, res) => {
    res.send("Backend is working 🚀");
  });
// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "API is running 🚀" });
});

module.exports = app;