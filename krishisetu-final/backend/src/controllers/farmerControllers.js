// controllers/farmerController.js
const bcrypt = require("bcryptjs");
const { queryDatabase } = require("../db");

// Farmer Registration Controller
const registerFarmer = async (req, res) => {
  const { first_name, last_name, email, phone_number, password, confirm_password } = req.body;

  if (password !== confirm_password) {
    return res.status(400).json({ success: false, message: "Passwords do not match" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await queryDatabase(
      `INSERT INTO farmerregistration (first_name, last_name, email, phone_number, password)
       VALUES (?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone_number, hashedPassword]
    );

    res.json({ success: true, message: "Farmer registered successfully", farmerId: result.insertId });
  } catch (err) {
    console.error("Error during farmer registration:", err);
    res.status(500).json({ success: false, message: "Farmer registration failed", error: err });
  }
};

// Farmer Login Controller
const loginFarmer = async (req, res) => {
  const { emailOrPhone, password } = req.body;

  try {
    const results = await queryDatabase(
      "SELECT * FROM farmerregistration WHERE email = ? OR phone_number = ?",
      [emailOrPhone, emailOrPhone]
    );

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    res.json({ success: true, message: "Login successful", user });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

module.exports = { registerFarmer, loginFarmer };
