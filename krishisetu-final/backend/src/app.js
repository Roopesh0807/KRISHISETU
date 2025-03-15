const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());  // Body parser middleware
app.use(cors());          // CORS middleware to handle cross-origin requests

// Import routes
const farmerRoutes = require("./routes/farmerRoutes");

// Use routes
app.use("/api/farmer", farmerRoutes);

// Global error handler
app.use((err, req, res, next) => {
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
