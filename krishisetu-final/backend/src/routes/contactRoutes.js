const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

// POST route for submitting the contact form
router.post("/api/contact", contactController.submitContactForm);

module.exports = router;