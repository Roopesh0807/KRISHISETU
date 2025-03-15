// controllers/messageController.js
const { queryDatabase } = require("../db");

// Send Message Controller
const sendMessage = async (req, res) => {
  const { sender_id, receiver_id, message } = req.body;

  try {
    const result = await queryDatabase(
      `INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)`,
      [sender_id, receiver_id, message]
    );
    res.json({ success: true, message: "Message sent successfully", messageId: result.insertId });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ success: false, message: "Error sending message", error: err });
  }
};

// Get Messages Controller
const getMessages = async (req, res) => {
  const { sender_id, receiver_id } = req.query;

  try {
    const results = await queryDatabase(
      `SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at`,
      [sender_id, receiver_id, receiver_id, sender_id]
    );
    res.json({ success: true, messages: results });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ success: false, message: "Error fetching messages", error: err });
  }
};

module.exports = { sendMessage, getMessages };
