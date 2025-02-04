const mysql = require("mysql2");
require("dotenv").config();

// Function to create and connect to the database
const connectDB = () => {
  const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: 3306 // Change from 3306 to 3307
  });

  db.connect((err) => {
    if (err) {
      console.error("❌ Database Connection Failed:", err);
      process.exit(1); // Exit the process if connection fails
    } else {
      console.log("✅ MySQL Connected");

      // Create 'contacts' table if it doesn't exist
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS contacts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      
      db.query(createTableQuery, (err) => {
        if (err) {
          console.error("❌ Table Creation Failed:", err);
        } else {
          console.log("✅ Contacts Table is Ready");
        }
      });
    }
  });

  return db; // Return the database connection
};

// Export the function properly
module.exports = connectDB;
