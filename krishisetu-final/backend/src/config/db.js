const mysql = require("mysql2/promise"); // Use the promise-based API
const { Sequelize } = require("sequelize");
//require("dotenv").config();

// Create MySQL connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // Add your MySQL password here
  database: "krishisetur",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Function to execute queries
const queryDatabase = async (sql, values) => {
  try {
    const [rows] = await pool.query(sql, values);
    return rows;
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  }
};

// Test the database connection
const testConnection = async () => {
  try {
    const result = await queryDatabase("SELECT 1 + 1 AS solution");
    console.log("✅ Database connected. Test query result:", result[0].solution);
  } catch (error) {
    console.error("❌ Error connecting to the database:", error);
  }
};

testConnection();

// Sequelize configuration
const sequelize = new Sequelize("krishisetur", "root", "", {
  host: "localhost",
  dialect: "mysql",
  logging: false, // Set to true if you want query logs
});

sequelize
  .authenticate()
  .then(() => console.log("✅ MySQL Database connected"))
  .catch((err) => console.error("❌ Database connection error:", err));

// Function to create tables
const createTables = async () => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS contacts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      stock INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS farmerregistration (
      farmer_id VARCHAR(15) PRIMARY KEY,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone_number VARCHAR(15) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS consumerregistration (
      consumer_id VARCHAR(15) PRIMARY KEY,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone_number VARCHAR(15) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      confirm_password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS messages (
      message_id INT AUTO_INCREMENT PRIMARY KEY,
      sender_id VARCHAR(15) NOT NULL,
      receiver_id VARCHAR(15) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS add_produce (
      product_id VARCHAR(10) PRIMARY KEY,
      farmer_id VARCHAR(15) NOT NULL,
      farmer_name VARCHAR(255) NOT NULL,
      produce_name VARCHAR(100) NOT NULL,
      availability INT NOT NULL,
      price_per_kg DECIMAL(10,2) NOT NULL,
      produce_type ENUM('Organic', 'Standard') NOT NULL,
      market_type ENUM('Bargaining Market', 'KrishiSetu Market') NOT NULL,
      email VARCHAR(255) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS farmdetails (
      farm_id INT AUTO_INCREMENT PRIMARY KEY,
      farmer_id VARCHAR(15) NOT NULL,
      farm_name VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      land_size DECIMAL(10,2) NOT NULL,
      farming_type ENUM('Organic', 'Conventional') NOT NULL,
      soil_type VARCHAR(255),
      irrigation_method VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (farmer_id) REFERENCES farmerregistration(farmer_id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS personaldetails (
      detail_id INT AUTO_INCREMENT PRIMARY KEY,
      farmer_id VARCHAR(15) NOT NULL,
      address TEXT NOT NULL,
      date_of_birth DATE NOT NULL,
      gender ENUM('Male', 'Female', 'Other') NOT NULL,
      nationality VARCHAR(255) NOT NULL,
      identification_number VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (farmer_id) REFERENCES farmerregistration(farmer_id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS placeorder (
      order_id VARCHAR(10) PRIMARY KEY,
      consumer_id VARCHAR(15) NOT NULL,
      name VARCHAR(255) NOT NULL,
      mobile_number VARCHAR(15) NOT NULL,
      email VARCHAR(255) NOT NULL,
      address TEXT NOT NULL,
      pincode VARCHAR(10) NOT NULL,
      order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      produce_name VARCHAR(255) NOT NULL,
      quantity INT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      status ENUM('Fulfilled', 'Unfulfilled') NOT NULL,
      payment_status ENUM('Paid', 'Unpaid') NOT NULL,
      FOREIGN KEY (consumer_id) REFERENCES consumerprofile(consumer_id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS consumerprofile (
      consumer_id VARCHAR(15) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      mobile_number VARCHAR(15) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      address TEXT NOT NULL,
      pincode VARCHAR(10) NOT NULL,
      location VARCHAR(255),
      photo TEXT,
      preferred_payment_method VARCHAR(50),
      subscription_method ENUM('Daily', 'Weekly', 'Monthly'),
      FOREIGN KEY (consumer_id) REFERENCES consumerregistration(consumer_id) ON DELETE CASCADE
    )`,
  ];

  try {
    for (const query of queries) {
      await pool.query(query);
      console.log("✅ Table is Ready");
    }
  } catch (error) {
    console.error("❌ Table Creation Failed:", error);
  }
};

// Function to drop triggers if they exist
const dropTriggers = async () => {
  const triggers = [
    "DROP TRIGGER IF EXISTS before_insert_farmer;",
    "DROP TRIGGER IF EXISTS before_insert_consumer;",
    "DROP TRIGGER IF EXISTS before_insert_add_produce;",
    "DROP TRIGGER IF EXISTS before_insert_consumer_profile;",
    "DROP TRIGGER IF EXISTS before_insert_placeorder;",
  ];

  try {
    for (const trigger of triggers) {
      await pool.query(trigger);
      console.log("✅ Trigger Dropped (if existed)");
    }
  } catch (error) {
    console.error("❌ Trigger Drop Failed:", error);
  }
};

// Function to create triggers
const createTriggers = async () => {
  const triggers = [
    `
    CREATE TRIGGER before_insert_farmer
    BEFORE INSERT ON farmerregistration
    FOR EACH ROW
    BEGIN
      DECLARE max_id INT DEFAULT 0;
      DECLARE next_id VARCHAR(15);
      SELECT IFNULL(CAST(SUBSTRING(farmer_id, 9) AS UNSIGNED), 0) INTO max_id 
      FROM farmerregistration ORDER BY farmer_id DESC LIMIT 1;
      SET next_id = CONCAT('KRST01FR', LPAD(max_id + 1, 3, '0'));
      SET NEW.farmer_id = next_id;
    END;
    `,
    `
    CREATE TRIGGER before_insert_consumer
    BEFORE INSERT ON consumerregistration
    FOR EACH ROW
    BEGIN
      DECLARE max_id INT DEFAULT 0;
      DECLARE next_id VARCHAR(15);
      SELECT IFNULL(CAST(SUBSTRING(consumer_id, 9) AS UNSIGNED), 0) INTO max_id 
      FROM consumerregistration ORDER BY consumer_id DESC LIMIT 1;
      SET next_id = CONCAT('KRST01CS', LPAD(max_id + 1, 3, '0'));
      SET NEW.consumer_id = next_id;
    END;
    `,
    `
    CREATE TRIGGER before_insert_add_produce
    BEFORE INSERT ON add_produce
    FOR EACH ROW
    BEGIN
      DECLARE fetched_farmer_id VARCHAR(15);
      DECLARE fetched_first_name VARCHAR(255);
      DECLARE max_id INT DEFAULT 0;
      DECLARE next_id VARCHAR(10);
      DECLARE farmer_exists INT DEFAULT 0;

      -- Check if email exists in farmerregistration table
      SELECT COUNT(*) INTO farmer_exists
      FROM farmerregistration
      WHERE email = NEW.email;

      IF farmer_exists = 0 THEN
          SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid email: No matching farmer found in farmerregistration';
      END IF;

      -- Fetch farmer_id and first_name from the farmerregistration table based on email
      SELECT farmer_id, first_name
      INTO fetched_farmer_id, fetched_first_name
      FROM farmerregistration
      WHERE email = NEW.email
      LIMIT 1;

      -- Assign farmer_id and farmer_name (first_name)
      SET NEW.farmer_id = fetched_farmer_id;
      SET NEW.farmer_name = fetched_first_name;

      -- Generate Auto-incrementing Product ID (e.g., PRD001, PRD002, ...)
      SELECT IFNULL(MAX(CAST(SUBSTRING(product_id, 4) AS UNSIGNED)), 0) INTO max_id FROM add_produce;
      SET next_id = CONCAT('PRD', LPAD(max_id + 1, 3, '0'));
      SET NEW.product_id = next_id;
    END;
    `,
    `
    CREATE TRIGGER before_insert_placeorder
    BEFORE INSERT ON placeorder
    FOR EACH ROW
    BEGIN
      DECLARE max_id INT DEFAULT 0;
      DECLARE next_id VARCHAR(10);
      DECLARE fetched_consumer_id VARCHAR(15);
      DECLARE fetched_mobile VARCHAR(15);
      DECLARE fetched_email VARCHAR(255);
      DECLARE fetched_address TEXT;
      DECLARE fetched_pincode VARCHAR(10);

      -- Get the latest order_id and generate new one
      SELECT IFNULL(MAX(CAST(SUBSTRING(order_id, 4) AS UNSIGNED)), 0) INTO max_id 
      FROM placeorder;

      SET next_id = CONCAT('ORD', LPAD(max_id + 1, 3, '0'));
      SET NEW.order_id = next_id;

      -- Fetch consumer details from consumerprofile
      SELECT consumer_id, mobile_number, email, address, pincode 
      INTO fetched_consumer_id, fetched_mobile, fetched_email, fetched_address, fetched_pincode
      FROM consumerprofile  
      WHERE email = NEW.email  
      LIMIT 1;

      -- Assign fetched values
      SET NEW.consumer_id = fetched_consumer_id;
      SET NEW.mobile_number = fetched_mobile;
      SET NEW.address = fetched_address;
      SET NEW.pincode = fetched_pincode;

      -- Ensure consumer_id is valid
      IF NEW.consumer_id IS NULL THEN
          SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'Invalid email: No matching consumer found in consumerprofile';
      END IF;
    END;
    `,
  ];

  try {
    for (const trigger of triggers) {
      await pool.query(trigger);
      console.log("✅ Trigger is Ready");
    }
  } catch (error) {
    console.error("❌ Trigger Creation Failed:", error);
  }
};

// Initialize the database
const initializeDatabase = async () => {
  await createTables();
  await dropTriggers();
  await createTriggers();
};

initializeDatabase();

// Export functions
module.exports = { queryDatabase, pool, sequelize };