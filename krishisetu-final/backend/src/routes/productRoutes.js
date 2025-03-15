// productRoutes.js (Backend)
const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Ensure database connection

// Fetch products (with async/await)
router.get("/", async (req, res) => {
  try {
    const query = "SELECT * FROM products"; // Adjust table name if needed

    // Use async/await to get results from the database
    const [results] = await db.promise().query(query);

    res.status(200).json(results); // Send products data as JSON response
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
