const mysql = require("mysql2");
const { Sequelize } = require("sequelize");

// Create MySQL connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // Add your password if required
  database: "krishisetur",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Function to execute queries
const queryDatabase = (sql, values) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, values, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};


const sequelize = new Sequelize('krishisetur', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false // Set to true if you want query logs
});

sequelize.authenticate()
    .then(() => console.log('✅ MySQL Database connected'))
    .catch(err => console.error('❌ Database connection error:', err));
// Connect to the database
// ✅ Connect MySQL pool (for raw queries)
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL Connection Failed:", err);
    return;
  }
  console.log("✅ MySQL Connection Pool Established");
  connection.release(); // Release connection back to the pool

  // Create Tables if they don't exist
  const createTables = [
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
      product_image BLOB NOT NULL,  
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
    )`
  ];

  createTables.forEach((query) => {
    connection.query(query, (err) => {
      if (err) {
        console.error("❌ Table Creation Failed:", err);
      } else {
        console.log("✅ Table is Ready");
      }
    });
  });

  // Drop existing triggers if they exist
  const dropTriggers = [
    "DROP TRIGGER IF EXISTS before_insert_farmer;",
    "DROP TRIGGER IF EXISTS before_insert_consumer;",
    "DROP TRIGGER IF EXISTS before_insert_add_produce;"
  ];

  dropTriggers.forEach((query) => {
    connection.query(query, (err) => {
      if (err) {
        console.error("❌ Trigger Drop Failed:", err);
      } else {
        console.log("✅ Trigger Dropped (if existed)");
      }
    });
  });

  // Create the trigger for auto-generating farmer user_id
  const createFarmerTrigger = `
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
  `;

  connection.query(createFarmerTrigger, (err) => {
    if (err) {
      console.error("❌ Farmer Trigger Creation Failed:", err);
    } else {
      console.log("✅ Farmer Trigger is Ready");
    }
  });

  // Create the trigger for auto-generating consumer user_id
  const createConsumerTrigger = `
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
  `;

  connection.query(createConsumerTrigger, (err) => {
    if (err) {
      console.error("❌ Consumer Trigger Creation Failed:", err);
    } else {
      console.log("✅ Consumer Trigger is Ready");
    }
  });

  // Create the trigger for add_produce
  const createAddProduceTrigger = `
    CREATE TRIGGER before_insert_add_produce
    BEFORE INSERT ON add_produce
    FOR EACH ROW
    BEGIN
      DECLARE fetched_farmer_id VARCHAR(15);
      DECLARE fetched_full_name VARCHAR(255);
      DECLARE max_id INT DEFAULT 0;
      DECLARE next_id VARCHAR(10);
      DECLARE farmer_exists INT DEFAULT 0;
      
      SELECT COUNT(*) INTO farmer_exists FROM farmerprofile WHERE email = NEW.email;
      IF farmer_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid email: No matching farmer found in farmerprofile';
      END IF;
      
      SELECT farmer_id, full_name INTO fetched_farmer_id, fetched_full_name FROM farmerprofile WHERE email = NEW.email LIMIT 1;
      
      SET NEW.farmer_id = fetched_farmer_id;
      SET NEW.farmer_name = fetched_full_name;
      
      SELECT IFNULL(MAX(CAST(SUBSTRING(product_id, 4) AS UNSIGNED)), 0) INTO max_id FROM add_produce;
      SET next_id = CONCAT('PRD', LPAD(max_id + 1, 3, '0'));
      SET NEW.product_id = next_id;
    END;
  `;

  connection.query(createAddProduceTrigger, (err) => {
    if (err) {
      console.error("❌ Add Produce Trigger Creation Failed:", err);
    } else {
      console.log("✅ Add Produce Trigger is Ready");
    }
  });

  connection.release();
});

// Export functions
module.exports = { queryDatabase, pool, sequelize };
