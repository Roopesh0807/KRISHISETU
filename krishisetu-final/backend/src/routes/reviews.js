const express = require('express');
const router = express.Router();
const queryDatabase = require("../config/db");
// Fetch reviews for a particular farmer
router.get('/farmer/:farmerId', async (req, res) => {
    const { farmerId } = req.params;
    
    try {
        const query = `
            SELECT r.review_id, r.farmer_id, c.name AS consumer_name, r.rating, 
                   r.comment, r.timestamp, ri.image_url 
            FROM reviews r
            JOIN consumers c ON r.consumer_id = c.consumer_id
            LEFT JOIN review_images ri ON r.review_id = ri.review_id
            WHERE r.farmer_id = ?
            ORDER BY r.timestamp DESC;
        `;

        const reviews = await queryDatabase(query, [farmerId]);

        console.log("Fetched Reviews:", reviews); // Debugging output
        res.json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Add a review (called when a consumer submits a review)
router.post('/add', async (req, res) => {
    try {
        const { farmer_id, consumer_id, rating, comment } = req.body;
        const sql = "INSERT INTO reviews (farmer_id, consumer_id, rating, comment) VALUES (?, ?, ?, ?)";
        await queryDatabase(sql, [farmer_id, consumer_id, rating, comment]);
        res.json({ success: true, message: "Review added successfully!" });
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
