const express = require("express");
const router = express.Router();
const { queryDatabase } = require("../config/db"); ; // Ensure correct path

router.post("/api/place-order", async (req, res) => {
    try {
        const {
            consumer_id,
            name,
            mobile_number,
            email,
            address,
            pincode,
            produce_name,
            quantity,
            amount,
            status,
            payment_status
        } = req.body;

        if (!consumer_id || !name || !mobile_number || !email) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const insertQuery = `
            INSERT INTO placeorder 
            (consumer_id, name, mobile_number, email, address, pincode, produce_name, quantity, amount, status, payment_status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await queryDatabase(insertQuery, [
            consumer_id,
            name,
            mobile_number,
            email,
            address,
            pincode,
            produce_name,
            quantity,
            amount,
            status,
            payment_status
        ]);

        res.json({ success: true, message: "Order placed successfully" });

    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ error: "Error placing order" });
    }
});

module.exports = router;
