const express = require("express");
const cors = require("cors");
const contactRoutes = require("./routes/contactRoutes");
const app = express();

app.use(express.json());  // Body parser middleware
app.use(cors());          // CORS middleware to handle cross-origin requests

// Import routes
const farmerRoutes = require("./routes/farmerRoutes");
const contactRoutes = require("./routes/contactRoutes"); // Import contactRoutes

// Use routes
app.use("/api/farmer", farmerRoutes);
app.use("/api/contact", contactRoutes); // Use contactRoutes

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err); // Log the error for debugging
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;