const { queryDatabase } = require("../db");

exports.submitContactForm = async (req, res) => {
  const { name, email, phone, message } = req.body;

  // Input validation
  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email, and message are required" });
  }

  const query = `
    INSERT INTO contact_us (name, email, phone, message)
    VALUES (?, ?, ?, ?)
  `;

  try {
    const results = await queryDatabase(query, [name, email, phone, message]);
    console.log("Message saved successfully:", results);
    res.status(200).json({ message: "Message sent successfully!" });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ message: "Failed to save message" });
  }
};