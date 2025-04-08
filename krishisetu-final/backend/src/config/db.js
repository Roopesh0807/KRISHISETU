const mysql = require("mysql2/promise"); // Use the promise-based API
const { Sequelize } = require("sequelize");
//require("dotenv").config();

// Create MySQL connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // Add your MySQL password here
  database: "krishisetur",
  port: process.env.DB_PORT || 3306,
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
    `CREATE TABLE IF NOT EXISTS consumer_addresses (
      consumer_id VARCHAR(20) NOT NULL,  
      name VARCHAR(255) NOT NULL,        
      phone_number VARCHAR(15) NOT NULL, 
      pincode VARCHAR(6) NOT NULL,       
      city VARCHAR(100) NOT NULL,        
      state VARCHAR(100) NOT NULL,       
      street VARCHAR(255) NOT NULL,      
      landmark VARCHAR(255),             
      PRIMARY KEY (consumer_id, pincode),  
      FOREIGN KEY (consumer_id) REFERENCES consumerprofile(consumer_id) ON DELETE CASCADE
    )`,
    `
      CREATE TABLE IF NOT EXISTS bargain_room (
        room_id INT AUTO_INCREMENT PRIMARY KEY,
        consumer_id VARCHAR(15) NOT NULL,
        farmer_id VARCHAR(15) NOT NULL,
        product_id VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (consumer_id) REFERENCES consumerregistration(consumer_id) ON DELETE CASCADE,
        FOREIGN KEY (farmer_id) REFERENCES farmerregistration(farmer_id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `,
    `
      CREATE TABLE IF NOT EXISTS bargain_suggestions (
        suggestion_id INT AUTO_INCREMENT PRIMARY KEY,
        room_id INT NOT NULL,
        suggested_price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (room_id) REFERENCES bargain_room(room_id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `,
    `
     CREATE TABLE bargain_messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    bargain_id INT,
    sender_role ENUM('consumer', 'farmer') NOT NULL,
    sender_id VARCHAR(20) NOT NULL,
    price_suggestion DECIMAL(10,2),
    message_type ENUM('suggestion', 'accept', 'reject', 'finalize') DEFAULT 'suggestion',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (bargain_id) REFERENCES bargain_sessions(bargain_id) ON DELETE CASCADE
)ENGINE=InnoDB;

    `,
    `
      CREATE TABLE IF NOT EXISTS bargain_finalized (
        bargain_id INT AUTO_INCREMENT PRIMARY KEY,
        room_id INT NOT NULL,
        final_price DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL,
        total_price DECIMAL(10,2) GENERATED ALWAYS AS (final_price * quantity) STORED,
        confirmed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES bargain_room(room_id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `,

    `
    CREATE TABLE IF NOT EXISTS bargain_sessions (
    bargain_id INT AUTO_INCREMENT PRIMARY KEY,
    consumer_id VARCHAR(20),
    farmer_id VARCHAR(20),
    status VARCHAR(20), -- active, completed, etc.
    initiator VARCHAR(20), -- consumer or farmer
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at DATETIME
)ENGINE=InnoDB;

    `,
    `
    CREATE TABLE IF NOT EXISTS bargain_session_products (
    bsp_id INT AUTO_INCREMENT PRIMARY KEY,
    bargain_id INT,
    product_id VARCHAR(20),
    original_price DECIMAL(10,2),
    quantity DECIMAL(10,2),
    current_offer DECIMAL(10,2),
    FOREIGN KEY (bargain_id) REFERENCES bargain_sessions(bargain_id) ON DELETE CASCADE
)ENGINE=InnoDB;
`,


    // `
    // CREATE TABLE IF NOT EXISTS bargain_offers (
    //   offer_id INT AUTO_INCREMENT PRIMARY KEY,
    //   session_id VARCHAR(15) NOT NULL,
    //   offered_by ENUM('consumer', 'farmer') NOT NULL,
    //   offer_price DECIMAL(10,2) NOT NULL,
    //   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //   FOREIGN KEY (session_id) REFERENCES bargain_sessions(session_id) ON DELETE CASCADE
    // ) ENGINE=InnoDB;
    // `,
   
    `
    CREATE TABLE IF NOT EXISTS bargain_orders (
      order_id VARCHAR(15) PRIMARY KEY,
      session_id VARCHAR(15) NOT NULL,
      final_price DECIMAL(10,2) NOT NULL,
      quantity DECIMAL(10,2) NOT NULL,
      status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES bargain_sessions(session_id)
    ) ENGINE=InnoDB;
    `,
    // `
    //   CREATE TABLE IF NOT EXISTS bargain_requests (
    //     id INT AUTO_INCREMENT PRIMARY KEY,
    //     consumer_id VARCHAR(50) NOT NULL,
    //     farmer_id VARCHAR(50) NOT NULL,
    //     product_id VARCHAR(50) NOT NULL,
    //     quantity INT NOT NULL,
    //     original_price DECIMAL(10,2) NOT NULL,
    //     status ENUM('pending', 'countered', 'accepted', 'rejected', 'expired') DEFAULT 'pending',
    //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    //   );
    // `,
    `
      CREATE TABLE IF NOT EXISTS finalized_bargains (
        id INT AUTO_INCREMENT PRIMARY KEY,
        consumer_id VARCHAR(50) NOT NULL,
        farmer_id VARCHAR(50) NOT NULL,
        product_id VARCHAR(50) NOT NULL,
        quantity INT NOT NULL,
        agreed_price DECIMAL(10,2) NOT NULL,
        finalized_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
    `
      CREATE TABLE IF NOT EXISTS rejected_bargains (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bargain_id INT NOT NULL,
        consumer_id VARCHAR(50) NOT NULL,
        farmer_id VARCHAR(50) NOT NULL,
        product_id VARCHAR(50) NOT NULL,
        rejected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,`
  SELECT r.*, GROUP_CONCAT(ri.image_url) AS image_urls
  FROM reviews r
  LEFT JOIN review_images ri ON r.review_id = ri.review_id
  GROUP BY r.review_id
`,
`CREATE TABLE IF NOT EXISTS reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    farmer_id INT NOT NULL, -- ID of the farmer being reviewed
    consumer_name VARCHAR(255) NOT NULL, -- Name of the consumer submitting the review
    rating DECIMAL(3,2) NOT NULL, -- Rating (e.g., 4.50)
    comment TEXT, -- Review comment
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp of the review
);
`,
`
CREATE TABLE IF NOT EXISTS review_images (
  image_id INT AUTO_INCREMENT PRIMARY KEY,
  review_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (review_id) REFERENCES reviews(review_id) ON DELETE CASCADE
);
`,
`
CREATE TABLE IF NOT EXISTS bargain_session_temp (
  consumer_id VARCHAR(50),
  product_id VARCHAR(50),
  quantity INT,
  original_price DECIMAL(10, 2)
);
`,
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
    "DROP TRIGGER IF EXISTS before_insert_consumer_addresses;",
    "DROP TRIGGER IF EXISTS generate_bargain_suggestions;",
    "DROP TRIGGER IF EXISTS finalize_bargain;",
    "DROP TRIGGER IF EXISTS prevent_after_finalization;",
    "DROP TRIGGER IF EXISTS after_offer_insert;",
    "DROP TRIGGER IF EXISTS after_bargain_request;",
    "DROP TRIGGER IF EXISTS after_bargain_status_change;",
    "DROP TRIGGER IF EXISTS after_bargain_completed;",
    "DROP TRIGGER IF EXISTS set_bargain_expiration;",
    "DROP TRIGGER IF EXISTS after_bargain_update;",
    "DROP TRIGGER IF EXISTS before_bargain_insert;",
    "DROP TRIGGER IF EXISTS update_bargain_status_after_message;",
    "DROP TRIGGER IF EXISTS validate_price_before_insert;",
    "DROP EVENT IF EXISTS expire_bargains;",
    "DROP TRIGGER IF EXISTS after_session_insert;",


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
    `-- Trigger to update the status of the bargain session

CREATE TRIGGER update_bargain_status_after_message
AFTER INSERT ON bargain_messages
FOR EACH ROW
BEGIN
    IF NEW.message_type = 'accept' THEN
        -- Update the bargain session status to 'accepted' when an offer is accepted
        UPDATE bargain_sessions
        SET status = 'accepted'
        WHERE bargain_id = NEW.bargain_id;
    ELSEIF NEW.message_type = 'reject' THEN
        -- Update the bargain session status to 'rejected' when an offer is rejected
        UPDATE bargain_sessions
        SET status = 'rejected'
        WHERE bargain_id = NEW.bargain_id;
    ELSEIF NEW.message_type = 'offer' THEN
        -- Update the bargain session status to 'countered' when a price is offered (this could be for a counter-offer)
        UPDATE bargain_sessions
        SET status = 'countered'
        WHERE bargain_id = NEW.bargain_id;
    END IF;
END ;

`,

    `

CREATE TRIGGER after_session_insert
AFTER INSERT ON bargain_sessions
FOR EACH ROW
BEGIN
  -- Example: insert null values (just to replicate your issue)
  INSERT INTO bargain_session_products 
  (bargain_id, product_id, original_price, quantity, current_offer)
  VALUES 
  (NEW.bargain_id, NULL, NULL, NULL, NULL);
END;



 
`,
`-- Trigger to ensure price is non-negative

CREATE TRIGGER validate_price_before_insert
BEFORE INSERT ON bargain_messages
FOR EACH ROW
BEGIN
  IF NEW.price < 0 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Price cannot be negative';
  END IF;
END ;

`,
    `

CREATE TRIGGER before_insert_consumer
BEFORE INSERT ON consumerregistration
FOR EACH ROW
BEGIN
    DECLARE max_id INT DEFAULT 0;
    DECLARE next_id VARCHAR(15);

    -- Get the highest numeric part of consumer_id (e.g., 001 from 'KRST01CS001')
    SELECT IFNULL(MAX(CAST(SUBSTRING(consumer_id, 9) AS UNSIGNED)), 0)
    INTO max_id
    FROM consumerregistration;

    -- Generate new consumer_id in the format 'KRST01CS001', 'KRST01CS002', etc.
    SET next_id = CONCAT('KRST01CS', LPAD(max_id + 1, 3, '0'));

    -- Assign the new consumer_id to the inserting row
    SET NEW.consumer_id = next_id;
END ;

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
        // `DROP TRIGGER IF EXISTS before_insert_consumer_addresses;`,
        `
        CREATE TRIGGER before_insert_consumer_addresses
        BEFORE INSERT ON consumer_addresses
        FOR EACH ROW
        BEGIN
          DECLARE fetched_name VARCHAR(255);
          DECLARE fetched_phone VARCHAR(15);
          
          -- Fetch name and phone_number from consumerprofile
          SELECT name, mobile_number 
          INTO fetched_name, fetched_phone 
          FROM consumerprofile 
          WHERE consumer_id = NEW.consumer_id;
          
          -- Assign fetched values
          SET NEW.name = fetched_name;
          SET NEW.phone_number = fetched_phone;
          
          -- Ensure consumer_id exists
          IF NEW.name IS NULL OR NEW.phone_number IS NULL THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Invalid consumer_id: No matching consumer found in consumerprofile';
          END IF;
        END;
        `,
    //     `
    // CREATE TRIGGER after_offer_insert
    // AFTER INSERT ON bargain_offers
    // FOR EACH ROW
    // BEGIN
    //   UPDATE bargain_sessions 
    //   SET current_offer = NEW.offer_price,
    //       status = 'countered',
    //       updated_at = CURRENT_TIMESTAMP
    //   WHERE session_id = NEW.session_id;
    // END;
    // `,
    `
    CREATE TRIGGER after_bargain_request
    AFTER INSERT ON bargain_sessions
    FOR EACH ROW
    BEGIN
      IF NEW.status = 'requested' THEN
        INSERT INTO bargain_notifications (user_id, user_type, message, related_bargain_id)
        VALUES (NEW.farmer_id, 'farmer', 
                CONCAT('New bargain request for product: ', 
                      (SELECT product_name FROM products WHERE product_id = NEW.product_id)), 
                NEW.bargain_id);
      END IF;
    END;
    `,
    `
    CREATE TRIGGER after_bargain_status_change
    AFTER UPDATE ON bargain_sessions
    FOR EACH ROW
    BEGIN
      DECLARE product_name_val VARCHAR(100);
      
      IF NEW.status <> OLD.status THEN
        SELECT product_name INTO product_name_val FROM products WHERE product_id = NEW.product_id;
        
        CASE NEW.status
          WHEN 'accepted' THEN
            INSERT INTO bargain_notifications (user_id, user_type, message, related_session_id)
            VALUES (NEW.consumer_id, 'consumer', 
                    CONCAT('Bargain accepted for ', product_name_val, '! Make your offer.'), 
                    NEW.bargain_id);
                    
          WHEN 'rejected' THEN
            INSERT INTO bargain_notifications (user_id, user_type, message, related_session_id)
            VALUES (NEW.consumer_id, 'consumer', 
                    CONCAT('Bargain rejected for ', product_name_val), 
                    NEW.bargain_id);
                    
          WHEN 'completed' THEN
            -- Notify both parties
            INSERT INTO bargain_notifications (user_id, user_type, message, related_session_id)
            VALUES (NEW.consumer_id, 'consumer', 
                    CONCAT('Bargain completed for ', product_name_val, ' at ₹', NEW.current_offer), 
                    NEW.bargain_id);
                    
            INSERT INTO bargain_notifications (user_id, user_type, message, related_session_id)
            VALUES (NEW.farmer_id, 'farmer', 
                    CONCAT('Bargain completed for ', product_name_val, ' at ₹', NEW.current_offer), 
                    NEW.bargain_id);
        END CASE;
      END IF;
    END;
    `,
    `
    CREATE TRIGGER after_bargain_completed
    AFTER UPDATE ON bargain_sessions
    FOR EACH ROW
    BEGIN
      IF NEW.status = 'completed' AND OLD.status <> 'completed' THEN
        -- Generate order ID
        SET @order_id = CONCAT('ORD', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(FLOOR(RAND() * 10000), 4, '0'));
        
        INSERT INTO bargain_orders (order_id, bargain_id, final_price, quantity)
        VALUES (@order_id, NEW.bargain_id, NEW.current_offer, NEW.quantity);
      END IF;
    END;
    `,
    `
    CREATE TRIGGER set_bargain_expiration
    BEFORE INSERT ON bargain_sessions
    FOR EACH ROW
    BEGIN
      SET NEW.expires_at = TIMESTAMPADD(HOUR, 24, CURRENT_TIMESTAMP);
    END;
    `,
    // `
    //   CREATE TRIGGER after_bargain_update
    //   AFTER UPDATE ON bargain_requests
    //   FOR EACH ROW
    //   BEGIN
    //     IF NEW.status = 'accepted' THEN
    //       INSERT INTO finalized_bargains (consumer_id, farmer_id, product_id, quantity, agreed_price, finalized_at)
    //       VALUES (NEW.consumer_id, NEW.farmer_id, NEW.product_id, NEW.quantity, NEW.original_price, NOW());
    //     END IF;
    //     IF NEW.status = 'rejected' THEN
    //       INSERT INTO rejected_bargains (bargain_id, consumer_id, farmer_id, product_id, rejected_at)
    //       VALUES (NEW.id, NEW.consumer_id, NEW.farmer_id, NEW.product_id, NOW());
    //     END IF;
    //   END;
    // `,
    `
 
  CREATE TRIGGER before_bargain_insert
  BEFORE INSERT ON bargain_sessions
  FOR EACH ROW
  BEGIN
    DECLARE last_bargain_id VARCHAR(15);

    -- Get the last inserted bargain_id
    SELECT bargain_id
    INTO last_bargain_id
    FROM bargain_sessions
    ORDER BY bargain_id DESC
    LIMIT 1;

    -- If no previous bargain_id exists, start with BAR001
    IF last_bargain_id IS NULL THEN
      SET NEW.bargain_id = 'BAR001';
    ELSE
      -- Increment the last bargain_id by 1
      SET NEW.bargain_id = CONCAT('BAR', LPAD(CAST(SUBSTRING(last_bargain_id, 4) AS UNSIGNED) + 1, 3, '0'));
    END IF;

    -- Ensure created_at and updated_at are not null
    IF NEW.created_at IS NULL THEN
      SET NEW.created_at = CURRENT_TIMESTAMP;
    END IF;
    IF NEW.updated_at IS NULL THEN
      SET NEW.updated_at = CURRENT_TIMESTAMP;
    END IF;
  END  ;
`,
    `
      CREATE EVENT expire_bargains
      ON SCHEDULE EVERY 1 HOUR
      DO
      BEGIN
        UPDATE bargain_requests
        SET status = 'expired'
        WHERE status = 'pending' AND TIMESTAMPDIFF(HOUR, created_at, NOW()) >= 24;
      END;
    `
    // `
    //   CREATE TRIGGER generate_bargain_suggestions
    //   AFTER INSERT ON bargain_room
    //   FOR EACH ROW
    //   BEGIN
    //     DECLARE base_price DECIMAL(10,2);
        
    //     -- Fetch the price from products table
    //     SELECT price_1kg INTO base_price FROM products WHERE product_id = NEW.product_id;
        
    //     -- Insert suggested bargain prices into bargain_suggestions table
    //     INSERT INTO bargain_suggestions (room_id, suggested_price)
    //     VALUES
    //       (NEW.room_id, base_price - 4),
    //       (NEW.room_id, base_price - 2),
    //       (NEW.room_id, base_price + 2),
    //       (NEW.room_id, base_price + 4);
    //   END;
    // `,
    // `
    //   CREATE TRIGGER finalize_bargain
    //   AFTER INSERT ON bargain_messages
    //   FOR EACH ROW
    //   BEGIN
    //     -- If the farmer accepts a price suggestion, move it to bargain_finalized
    //     IF NEW.message_type = 'accept' THEN
    //       INSERT INTO bargain_finalized (room_id, final_price, quantity)
    //       VALUES (NEW.room_id, NEW.price_offer, 1);
    //     END IF;
    //   END;
    // `,
    // `
    //   CREATE TRIGGER prevent_after_finalization
    //   BEFORE INSERT ON bargain_messages
    //   FOR EACH ROW
    //   BEGIN
    //     DECLARE bargain_exists INT;
        
    //     -- Check if the room has a finalized bargain
    //     SELECT COUNT(*) INTO bargain_exists FROM bargain_finalized WHERE room_id = NEW.room_id;
        
    //     -- Prevent further messages if a bargain is finalized
    //     IF bargain_exists > 0 THEN
    //       SIGNAL SQLSTATE '45000'
    //       SET MESSAGE_TEXT = 'This bargain has already been finalized!';
    //     END IF;
    //   END;
    // `

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
// Add this function to create bargain-related stored procedures
const createStoredProcedures = async () => {
  const procedures = [
    `
    CREATE PROCEDURE IF NOT EXISTS get_product_price_suggestions(
      IN p_product_id VARCHAR(10),
      IN p_quantity DECIMAL(10,2)
    )
    BEGIN
      DECLARE base_price DECIMAL(10,2);
      
      -- Determine which price column to use based on quantity
      IF p_quantity >= 5 THEN
        SELECT price_5kg INTO base_price FROM products WHERE product_id = p_product_id;
      ELSEIF p_quantity >= 2 THEN
        SELECT price_2kg INTO base_price FROM products WHERE product_id = p_product_id;
      ELSE
        SELECT price_1kg INTO base_price FROM products WHERE product_id = p_product_id;
      END IF;
      
      -- Ensure base price is not null
      IF base_price IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Product not found or price not set';
      END IF;
      
      -- Return ±2 and ±4 suggestions (ensuring no negative prices)
      SELECT 
        GREATEST(base_price - 4, 0) AS lower_offer1,
        GREATEST(base_price - 2, 0) AS lower_offer2,
        base_price + 2 AS higher_offer1,
        base_price + 4 AS higher_offer2;
    END;
    `,
    `
    CREATE PROCEDURE IF NOT EXISTS initiate_bargain_session(
      IN p_session_id VARCHAR(15),
      IN p_consumer_id VARCHAR(15),
      IN p_product_id VARCHAR(10),
      IN p_quantity DECIMAL(10,2)
    )
    BEGIN
      DECLARE v_farmer_id VARCHAR(15);
      DECLARE v_base_price DECIMAL(10,2);
      
      -- Get farmer and appropriate price based on quantity
      SELECT farmer_id, 
             CASE 
                 WHEN p_quantity >= 5 THEN price_5kg
                 WHEN p_quantity >= 2 THEN price_2kg
                 ELSE price_1kg
             END
      INTO v_farmer_id, v_base_price
      FROM products
      WHERE product_id = p_product_id;
      
      -- Create the bargain session
      INSERT INTO bargain_sessions (session_id, consumer_id, farmer_id, product_id, 
                                   original_price, quantity, initiator, status)
      VALUES (p_session_id, p_consumer_id, v_farmer_id, p_product_id, 
              v_base_price, p_quantity, 'consumer', 'requested');
      
      SELECT p_session_id AS session_id;
    END;
    `,
  ];

  try {
    for (const procedure of procedures) {
      await pool.query(procedure);
      console.log("✅ Stored procedure created successfully");
    }
  } catch (error) {
    console.error("❌ Stored procedure creation failed:", error);
  }
};
// Initialize the database
const initializeDatabase = async () => {
  await createTables();
  await dropTriggers();
  await createTriggers();
  await createStoredProcedures();
};
// Bargain Feature Functions
const bargainFunctions = {
  /**
   * Initiate a new bargain session
   */
  initiateBargain: async (sessionId, consumerId, productId, quantity) => {
    const [result] = await pool.execute(
      'CALL initiate_bargain_session(?, ?, ?, ?)',
      [sessionId, consumerId, productId, quantity]
    );
    return result[0][0];
  },

  /**
   * Get price suggestions for a product
   */
  getPriceSuggestions: async (productId, quantity) => {
    const [result] = await pool.execute(
      'CALL get_product_price_suggestions(?, ?)',
      [productId, quantity]
    );
    return result[0][0];
  },

  /**
   * Submit a bargain offer
   */
  submitOffer: async (sessionId, userId, userType, offerPrice) => {
    const [result] = await pool.execute(
      'INSERT INTO bargain_offers (session_id, offered_by, offer_price) VALUES (?, ?, ?)',
      [sessionId, userType, offerPrice]
    );
    return bargainFunctions.getBargainSession(sessionId);
  },

  /**
   * Get bargain session details
   */
  getBargainSession: async (sessionId) => {
    const [session] = await pool.execute(
      'SELECT * FROM bargain_sessions WHERE session_id = ?',
      [sessionId]
    );
    
    if (session.length === 0) {
      throw new Error('Bargain session not found');
    }
    
    const [offers] = await pool.execute(
      'SELECT * FROM bargain_offers WHERE session_id = ? ORDER BY created_at',
      [sessionId]
    );
    
    return {
      ...session[0],
      offers: offers
    };
  },

  /**
   * Respond to a bargain request (accept/reject)
   */
  respondToBargain: async (sessionId, farmerId, accept) => {
    const status = accept ? 'accepted' : 'rejected';
    await pool.execute(
      'UPDATE bargain_sessions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE session_id = ? AND farmer_id = ?',
      [status, sessionId, farmerId]
    );
    return bargainFunctions.getBargainSession(sessionId);
  },

  /**
   * Finalize a bargain (accept final price)
   */
  finalizeBargain: async (sessionId, userId, userType) => {
    await pool.execute(
      'UPDATE bargain_sessions SET status = "completed", updated_at = CURRENT_TIMESTAMP WHERE session_id = ?',
      [sessionId]
    );
    return bargainFunctions.getBargainSession(sessionId);
  },

  /**
   * Get bargain notifications for a user
   */
  getBargainNotifications: async (userId, userType) => {
    const [notifications] = await pool.execute(
      'SELECT * FROM bargain_notifications WHERE user_id = ? AND user_type = ? ORDER BY created_at DESC',
      [userId, userType]
    );
    return notifications;
  },

  /**
   * Mark notification as read
   */
  markNotificationRead: async (notificationId) => {
    await pool.execute(
      'UPDATE bargain_notifications SET is_read = TRUE WHERE notification_id = ?',
      [notificationId]
    );
  }
};

initializeDatabase();

// Export functions
module.exports = { queryDatabase, pool, sequelize,  ...bargainFunctions  };