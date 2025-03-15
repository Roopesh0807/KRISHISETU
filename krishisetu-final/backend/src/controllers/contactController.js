// backend/controllers/contactController.js
const db = require('../../config/db'); // Database connection

exports.submitContactForm = (req, res) => {
  const { name, email, phone, message } = req.body;

  const query = `
    INSERT INTO contacts (name, email, phone, message)
    VALUES (?, ?, ?, ?)
  `;
  
  db.query(query, [name, email, phone, message], (err, result) => {
    if (err) {
      console.error('Database error:', err); // Log the error
      return res.status(500).json({ message: 'Failed to save message' });
    }
    console.log('Message saved successfully:', result); // Log success
    res.status(200).json({ message: 'Message sent successfully!' });
  });
};
