-- Create Database
CREATE DATABASE KRISHISETUR;
USE KRISHISETUR;

-- Farmer Login Table
CREATE TABLE farmerlogin (
    email_or_phone VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Insert Farmer Login Data
INSERT INTO farmerlogin (email_or_phone, password) 
VALUES 
('ruchita@gmail.com', 'password1'),
('arush@gmail.com', 'password2'),
('pavan@gmail.com', 'password3'),
('teju@gmail.com', 'password4');

-- Consumer Login Table
CREATE TABLE consumerlogin (
    email_or_phone VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Insert Consumer Login Data
INSERT INTO consumerlogin (email_or_phone, password) 
VALUES 
('amit.sharma@example.com', 'hashed_password_1'),
('9876500011', 'hashed_password_2'),
('raj.patel@example.com', 'hashed_password_3'),
('9876500013', 'hashed_password_4'),
('vikas.mishra@example.com', 'hashed_password_5'),
('anjali.singh@example.com', 'hashed_password_6'),
('9876500016', 'hashed_password_7'),
('meera.jain@example.com', 'hashed_password_8'),
('9876500018', 'hashed_password_9'),
('kavita.thakur@example.com', 'hashed_password_10');

-- Farmer Registration Table
CREATE TABLE farmerregistration (
    farmer_id VARCHAR(15) PRIMARY KEY,  -- Auto-generated ID (KRST01FR001)
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- Should be stored as hashed value
    confirm_password VARCHAR(255) NOT NULL  -- Ensure password match during registration
);

-- Trigger for Auto-Generating Farmer ID
DELIMITER //

CREATE TRIGGER before_insert_farmer
BEFORE INSERT ON farmerregistration
FOR EACH ROW
BEGIN
    DECLARE max_id INT DEFAULT 0;
    DECLARE next_id VARCHAR(15);
    
    -- Get the highest numeric part of farmer_id (e.g., 001 from 'KRST01FR001')
    SELECT IFNULL(CAST(SUBSTRING(farmer_id, 9) AS UNSIGNED), 0) INTO max_id 
    FROM farmerregistration ORDER BY farmer_id DESC LIMIT 1;

    -- Generate new farmer_id in the format 'KRST01FR001', 'KRST01FR002', etc.
    SET next_id = CONCAT('KRST01FR', LPAD(max_id + 1, 3, '0'));

    -- Assign the new farmer_id to the inserting row
    SET NEW.farmer_id = next_id;
END;
//

DELIMITER ;

-- Insert Farmer Registration Data
INSERT INTO farmerregistration (first_name, last_name, email, phone_number, password, confirm_password) 
VALUES 
('Ruchita', 'Sharma', 'ruchita@gmail.com', '9886543210', 'hashed_password1', 'hashed_password1'),
('Arush', 'Kumar', 'arush@gmail.com', '9876543211', 'hashed_password2', 'hashed_password2'),
('Pavan', 'Reddy', 'pavan@gmail.com', '9876543212', 'hashed_password3', 'hashed_password3'),
('Teju', 'Naik', 'teju@gmail.com', '9876543213', 'hashed_password4', 'hashed_password4');

-- Consumer Registration Table
CREATE TABLE consumerregistration (
    consumer_id VARCHAR(15) PRIMARY KEY,  -- Auto-generated ID (KRST01CS001)
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- Should be stored as hashed value
    confirm_password VARCHAR(255) NOT NULL  -- Ensure password match during registration
);

-- Trigger for Auto-Generating Consumer ID
DELIMITER $$

CREATE TRIGGER before_insert_consumer
BEFORE INSERT ON consumerregistration
FOR EACH ROW
BEGIN
    DECLARE max_id INT DEFAULT 0;
    DECLARE next_id VARCHAR(15);

    -- Get the highest numeric part of consumer_id (e.g., 001 from 'KRST01CS001')
    SELECT IFNULL(MAX(CAST(SUBSTRING(consumer_id, 9) AS UNSIGNED)), 0) INTO max_id 
    FROM consumerregistration;

    -- Generate new consumer_id in the format 'KRST01CS001', 'KRST01CS002', etc.
    SET next_id = CONCAT('KRST01CS', LPAD(max_id + 1, 3, '0'));

    -- Assign the new consumer_id to the inserting row
    SET NEW.consumer_id = next_id;
END $$

DELIMITER ;

-- Insert Consumer Registration Data
INSERT INTO consumerregistration (first_name, last_name, email, phone_number, password, confirm_password) 
VALUES 
('Amit', 'Sharma', 'amit.sharma@example.com', '9876500010', 'hashed_password1', 'hashed_password1'),
('Neha', 'Verma', 'neha.verma@example.com', '9876500011', 'hashed_password2', 'hashed_password2'),
('Raj', 'Patel', 'raj.patel@example.com', '9876500012', 'hashed_password3', 'hashed_password3'),
('Poonam', 'Gupta', 'poonam.gupta@example.com', '9876500013', 'hashed_password4', 'hashed_password4'),
('Vikas', 'Mishra', 'vikas.mishra@example.com', '9876500014', 'hashed_password5', 'hashed_password5'),
('Anjali', 'Singh', 'anjali.singh@example.com', '9876500015', 'hashed_password6', 'hashed_password6'),
('Rohit', 'Yadav', 'rohit.yadav@example.com', '9876500016', 'hashed_password7', 'hashed_password7'),
('Meera', 'Jain', 'meera.jain@example.com', '9876500017', 'hashed_password8', 'hashed_password8'),
('Sandeep', 'Rao', 'sandeep.rao@example.com', '9876500018', 'hashed_password9', 'hashed_password9'),
('Kavita', 'Thakur', 'kavita.thakur@example.com', '9876500019', 'hashed_password10', 'hashed_password10');

-- Contact Us Table
CREATE TABLE contact_us (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Contact Us Data
INSERT INTO contact_us (name, email, phone, message)  
VALUES  
('Ruchita Sharma', 'ruchita@gmail.com', '9886543210', 'I need help with my recent order.'),  
('Arush Kumar', 'arush@gmail.com', '9876543211', 'I want to update my farm details.'),  
('Pavan Reddy', 'pavan@gmail.com', '9876543212', 'Inquiry about delivery times.'),  
('Teju Naik', 'teju@gmail.com', '9876543213', 'How can I register my farm?'),  
('Amit Sharma', 'amit.sharma@example.com', '9876500010', 'Need assistance with payment issues.'),  
('Neha Verma', 'neha.verma@example.com', '9876500011', 'Requesting more information on organic products.'),  
('Raj Patel', 'raj.patel@example.com', '9876500012', 'Facing login issues, please assist.');

-- Personal Details Table
CREATE TABLE personaldetails (
    farmer_id VARCHAR(15) NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    profile_photo BLOB,
    dob DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    contact_no VARCHAR(15) NOT NULL,
    aadhaar_no VARCHAR(12) NOT NULL,
    residential_address TEXT NOT NULL,
    aadhaar_proof_pdf LONGBLOB,
    bank_account_no VARCHAR(20),
    ifsc_code VARCHAR(11),
    upi_id VARCHAR(255),
    PRIMARY KEY (farmer_id),
    FOREIGN KEY (farmer_id) REFERENCES farmerregistration(farmer_id)
);

-- Trigger for Personal Details
DELIMITER $$

CREATE TRIGGER before_insert_personaldetails
BEFORE INSERT ON personaldetails
FOR EACH ROW
BEGIN
    DECLARE fetched_farmer_id VARCHAR(15);
    DECLARE fetched_full_name VARCHAR(255);

    -- Fetch farmer_id and full_name (first_name + last_name) from farmerregistration based on email
    SELECT farmer_id, CONCAT(first_name, ' ', last_name) INTO fetched_farmer_id, fetched_full_name
    FROM farmerregistration
    WHERE email = NEW.email;

    -- Set farmer_id and name in the personaldetails table
    SET NEW.farmer_id = fetched_farmer_id;
    SET NEW.name = fetched_full_name;
END$$

DELIMITER ;

-- Insert Personal Details Data
INSERT INTO personaldetails (email, profile_photo, dob, gender, contact_no, aadhaar_no, residential_address, aadhaar_proof_pdf, bank_account_no, ifsc_code, upi_id)
VALUES
('ruchita@gmail.com', NULL, '1990-05-15', 'Female', '9876543210', '123456789012', '1234, Main Street, City, State, 12345', NULL, '12345678901234567890', 'IFSC1234567', 'ruchita_upi@bank'),
('arush@gmail.com', NULL, '1992-07-20', 'Male', '9876543211', '123456789013', '4567, Second Street, City, State, 12345', NULL, '12345678901234567891', 'IFSC1234568', 'arush_upi@bank'),
('pavan@gmail.com', NULL, '1988-10-05', 'Male', '9876543212', '123456789014', '7890, Third Street, City, State, 12345', NULL, '12345678901234567892', 'IFSC1234569', 'pavan_upi@bank'),
('teju@gmail.com', NULL, '1995-03-12', 'Female', '9876543213', '123456789015', '1011, Fourth Street, City, State, 12345', NULL, '12345678901234567893', 'IFSC1234570', 'teju_upi@bank');

-- Farm Details Table
CREATE TABLE farmdetails (
    farmer_id VARCHAR(15) NOT NULL,
    email VARCHAR(255) NOT NULL,
    farm_address TEXT NOT NULL,
    farm_size DECIMAL(10,2) NOT NULL,
    crops_grown TEXT NOT NULL,
    farming_method VARCHAR(255) NOT NULL,
    soil_type VARCHAR(100) NOT NULL,
    water_sources TEXT NOT NULL,
    farm_equipment TEXT NOT NULL,
    land_ownership_proof_pdf LONGBLOB,
    certification_pdf LONGBLOB,
    land_lease_agreement_pdf LONGBLOB,
    farm_photographs_pdf LONGBLOB,
    PRIMARY KEY (farmer_id),
    FOREIGN KEY (farmer_id) REFERENCES farmerregistration(farmer_id)
);

-- Trigger for Farm Details
DELIMITER $$

CREATE TRIGGER before_insert_farmdetails
BEFORE INSERT ON farmdetails
FOR EACH ROW
BEGIN
    DECLARE fetched_farmer_id VARCHAR(15);

    -- Fetch farmer_id from farmerregistration based on email
    SELECT farmer_id INTO fetched_farmer_id
    FROM farmerregistration
    WHERE email = NEW.email;

    -- Set farmer_id in the farmdetails table
    SET NEW.farmer_id = fetched_farmer_id;
END$$

DELIMITER ;

-- Insert Farm Details Data
INSERT INTO farmdetails 
(email, farm_address, farm_size, crops_grown, farming_method, soil_type, water_sources, farm_equipment, land_ownership_proof_pdf, certification_pdf, land_lease_agreement_pdf, farm_photographs_pdf)
VALUES
('ruchita@gmail.com', '1234, Main Street, City, State', 2.5, 'Tomatoes, Wheat', 'Organic', 'Loamy', 'Rainwater, Borewell', 'Tractor, Plough', NULL, NULL, NULL, NULL),
('arush@gmail.com', '4567, Second Street, City, State', 3.0, 'Potatoes, Carrots', 'Conventional', 'Clay', 'Canal, Borewell', 'Tractor, Seeder', NULL, NULL, NULL, NULL),
('pavan@gmail.com', '7890, Third Street, City, State', 1.8, 'Onions, Garlic', 'Sustainable', 'Sandy', 'Canal, Well', 'Plough, Harrow', NULL, NULL, NULL, NULL),
('teju@gmail.com', '1011, Fourth Street, City, State', 5.0, 'Rice, Corn', 'Traditional', 'Clay', 'River, Borewell', 'Tractor, Harvester', NULL, NULL, NULL, NULL);

-- Products Table
CREATE TABLE products (
    product_id VARCHAR(10) PRIMARY KEY,
    product_name VARCHAR(100),
    category VARCHAR(50),
    buy_type VARCHAR(20),
    price_1kg DECIMAL(10,2),
    price_2kg DECIMAL(10,2),
    price_5kg DECIMAL(10,2),
    image BLOB,
    ratings DECIMAL(3,1)
);

-- Trigger for Auto-Generating Product ID
DELIMITER //

CREATE TRIGGER before_product_insert
BEFORE INSERT ON products
FOR EACH ROW
BEGIN
    DECLARE new_id INT;
    DECLARE formatted_id VARCHAR(10);
    
    -- Get the numeric part of the last product_id and increment it
    SELECT IFNULL(CAST(SUBSTRING(MAX(product_id), 4) AS UNSIGNED), 0) + 1 
    INTO new_id FROM products;

    -- Format it as PRD001, PRD002, etc.
    SET formatted_id = CONCAT('PRD', LPAD(new_id, 3, '0'));

    -- Assign the formatted ID to the new row
    SET NEW.product_id = formatted_id;
END;
//

DELIMITER ;

-- Insert Products Data
INSERT INTO products (product_name, category, buy_type, price_1kg, price_2kg, price_5kg, image, ratings) VALUES
('Tomato', 'Vegetables', 'Standard', 24.00, 45.50, 110.00, NULL, 4.2),
('Tomato', 'Vegetables', 'Organic', 27.00, 51.50, 125.00, NULL, 4.3),
('Onion', 'Vegetables', 'Standard', 20.00, 37.50, 90.00, NULL, 4.0),
('Onion', 'Vegetables', 'Organic', 23.00, 43.50, 105.00, NULL, 4.1),
('Potato', 'Vegetables', 'Standard', 22.00, 41.50, 100.00, NULL, 4.0),
('Potato', 'Vegetables', 'Organic', 25.00, 47.50, 115.00, NULL, 4.2),
('Chilly', 'Vegetables', 'Standard', 30.00, 57.50, 140.00, NULL, 4.4),
('Chilly', 'Vegetables', 'Organic', 33.00, 63.50, 155.00, NULL, 4.1),
('Apple', 'Fruits', 'Standard', 120.00, 230.00, 550.00, NULL, 4.3),
('Apple', 'Fruits', 'Organic', 123.00, 236.00, 565.00, NULL, 4.4),
('Pomegranate', 'Fruits', 'Standard', 110.00, 210.00, 500.00, NULL, 4.2),
('Pomegranate', 'Fruits', 'Organic', 113.00, 216.00, 515.00, NULL, 4.1),
('Grapes', 'Fruits', 'Standard', 90.00, 170.00, 400.00, NULL, 4.0),
('Grapes', 'Fruits', 'Organic', 93.00, 176.00, 415.00, NULL, 4.2),
('Butter', 'Dairy Products', 'Standard', 450.00, 890.00, 2200.00, NULL, 4.4),
('Butter', 'Dairy Products', 'Organic', 453.00, 896.00, 2215.00, NULL, 4.3),
('Cheese', 'Dairy Products', 'Standard', 500.00, 990.00, 2450.00, NULL, 4.2),
('Cheese', 'Dairy Products', 'Organic', 503.00, 996.00, 2465.00, NULL, 4.1),
('Rice', 'Grains & Pulses', 'Standard', 50.00, 95.00, 230.00, NULL, 4.0),
('Rice', 'Grains & Pulses', 'Organic', 53.00, 100.00, 240.00, NULL, 4.2),
('Cumin', 'Spices', 'Standard', 100.00, 190.00, 450.00, NULL, 4.2),
('Cumin', 'Spices', 'Organic', 103.00, 195.00, 460.00, NULL, 4.3);

-- Order All Table
CREATE TABLE orderall (
    orderid VARCHAR(10) PRIMARY KEY,
    farmer_id VARCHAR(15) NOT NULL,
    farmer_name VARCHAR(255) NOT NULL,
    order_date DATE NOT NULL,
    produce_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('Fulfilled', 'Unfulfilled') NOT NULL,
    payment_status ENUM('Paid', 'Unpaid') NOT NULL,
    FOREIGN KEY (farmer_id) REFERENCES farmerregistration(farmer_id)
);

-- Trigger for Order All Table
DELIMITER //

CREATE TRIGGER before_insert_orderall
BEFORE INSERT ON orderall
FOR EACH ROW
BEGIN
    DECLARE max_id INT DEFAULT 0;
    DECLARE next_id VARCHAR(10);
    DECLARE fetched_farmer_id VARCHAR(15);
    DECLARE farmer_fullname VARCHAR(255);

    -- Get the highest numeric part of orderid
    SELECT IFNULL(CAST(SUBSTRING(orderid, 4) AS UNSIGNED), 0) INTO max_id 
    FROM orderall ORDER BY orderid DESC LIMIT 1;

    -- Generate new orderid in the format 'ORD001', 'ORD002', etc.
    SET next_id = CONCAT('ORD', LPAD(max_id + 1, 3, '0'));
    SET NEW.orderid = next_id;

    -- Fetch farmer_id based on farmer_name
    SELECT farmer_id, CONCAT(first_name, ' ', last_name) 
    INTO fetched_farmer_id, farmer_fullname
    FROM farmerregistration
    WHERE CONCAT(first_name, ' ', last_name) = NEW.farmer_name
    LIMIT 1;

    -- If farmer_id is NULL, prevent insert
    IF fetched_farmer_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: No matching farmer found in farmerregistration.';
    ELSE
        -- Assign fetched values
        SET NEW.farmer_id = fetched_farmer_id;
        SET NEW.farmer_name = farmer_fullname;
    END IF;
END;
//

DELIMITER ;

-- Insert Order All Data
INSERT INTO orderall (farmer_name, order_date, produce_name, quantity, amount, status, payment_status) 
VALUES 
('Ruchita Sharma', '2025-02-05', 'Tomatoes', 50, 200.00, 'Fulfilled', 'Paid'),
('Arush Kumar', '2025-02-06', 'Potatoes', 30, 150.00, 'Unfulfilled', 'Unpaid'),
('Pavan Reddy', '2025-02-07', 'Onions', 40, 180.00, 'Fulfilled', 'Paid'),
('Teju Naik', '2025-02-08', 'Carrots', 25, 120.00, 'Unfulfilled', 'Paid'),
('Ruchita Sharma', '2025-02-09', 'Wheat', 60, 300.00, 'Fulfilled', 'Paid');

-- Fulfilled Orders View
CREATE VIEW fulfilled_orders AS
SELECT 
    orderid,
    farmer_id,
    order_date,
    produce_name,
    quantity,
    amount,
    status
FROM orderall
WHERE status = 'Fulfilled';

-- Unfulfilled Orders View
CREATE VIEW unfulfilled_orders AS
SELECT 
    orderid,
    farmer_id,
    order_date,
    produce_name,
    quantity,
    amount,
    status
FROM orderall
WHERE status = 'Unfulfilled';

-- Consumer Profile Table
CREATE TABLE consumerprofile (
    consumer_id VARCHAR(15),
    name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(15) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    PRIMARY KEY (email, mobile_number),
    FOREIGN KEY (consumer_id) REFERENCES consumerregistration(consumer_id)
);

-- Trigger for Consumer Profile
DELIMITER //

CREATE TRIGGER before_insert_consumerprofile
BEFORE INSERT ON consumerprofile
FOR EACH ROW
BEGIN
    DECLARE fetched_consumer_id VARCHAR(15);
    
    -- Fetch consumer_id based on matching email and phone number
    SELECT consumer_id INTO fetched_consumer_id 
    FROM consumerregistration 
    WHERE email = NEW.email AND phone_number = NEW.mobile_number 
    LIMIT 1;

    -- Assign the fetched consumer_id
    SET NEW.consumer_id = fetched_consumer_id;
END;
//

DELIMITER ;

-- Insert Consumer Profile Data
INSERT INTO consumerprofile (name, mobile_number, email, address, pincode)
VALUES 
('Amit Sharma', '9876500010', 'amit.sharma@example.com', 'Address of Amit Sharma', '123456'),
('Neha Verma', '9876500011', 'neha.verma@example.com', 'Address of Neha Verma', '234567'),
('Raj Patel', '9876500012', 'raj.patel@example.com', 'Address of Raj Patel', '345678'),
('Poonam Gupta', '9876500013', 'poonam.gupta@example.com', 'Address of Poonam Gupta', '456789'),
('Vikas Mishra', '9876500014', 'vikas.mishra@example.com', 'Address of Vikas Mishra', '567890'),
('Anjali Singh', '9876500015', 'anjali.singh@example.com', 'Address of Anjali Singh', '678901'),
('Rohit Yadav', '9876500016', 'rohit.yadav@example.com', 'Address of Rohit Yadav', '789012'),
('Meera Jain', '9876500017', 'meera.jain@example.com', 'Address of Meera Jain', '890123'),
('Sandeep Rao', '9876500018', 'sandeep.rao@example.com', 'Address of Sandeep Rao', '901234'),
('Kavita Thakur', '9876500019', 'kavita.thakur@example.com', 'Address of Kavita Thakur', '012345');

-- Place Order Table
CREATE TABLE placeorder (
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
    FOREIGN KEY (consumer_id) REFERENCES consumerprofile(consumer_id)
);

-- Trigger for Place Order
DELIMITER //

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

    -- Fetch consumer_id and other details from consumerprofile based on email
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

    -- Ensure consumer_id is not NULL
    IF NEW.consumer_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid email: No matching consumer found in consumerprofile';
    END IF;
END;
//

DELIMITER ;

-- Insert Place Order Data
INSERT INTO placeorder (name, email, produce_name, quantity, amount, status, payment_status)  
VALUES  
('Amit Sharma', 'amit.sharma@example.com', 'Tomatoes', 10, 50.00, 'Fulfilled', 'Paid'),  
('Neha Verma', 'neha.verma@example.com', 'Potatoes', 20, 80.00, 'Unfulfilled', 'Unpaid'),  
('Rohit Yadav', 'rohit.yadav@example.com', 'Onions', 15, 60.00, 'Fulfilled', 'Paid');

-- Farmer Profile Table
CREATE TABLE farmerprofile AS
SELECT 
    fr.farmer_id,
    CONCAT(fr.first_name, ' ',fr.last_name) AS full_name,
    p.profile_photo,
    p.dob,
    p.gender,
    p.email,
    p.contact_no,
    p.aadhaar_no,
    p.residential_address,
    p.aadhaar_proof_pdf,
    p.bank_account_no,
    p.ifsc_code,
    p.upi_id,
    f.farm_address,
    f.farm_size,
    f.crops_grown,
    f.farming_method,
    f.soil_type,
    f.water_sources,
    f.farm_equipment,
    f.land_ownership_proof_pdf,
    f.certification_pdf,
    f.land_lease_agreement_pdf,
    f.farm_photographs_pdf
FROM 
    farmerregistration fr
JOIN 
    personaldetails p ON fr.farmer_id = p.farmer_id
JOIN 
    farmdetails f ON fr.farmer_id = f.farmer_id;

-- Add Produce Table
CREATE TABLE add_produce (
    product_id VARCHAR(10) PRIMARY KEY,
    farmer_id VARCHAR(15) NOT NULL,
    farmer_name VARCHAR(255) NOT NULL,
    produce_name VARCHAR(100) NOT NULL,
    availability INT NOT NULL,
    price_per_kg DECIMAL(10,2) NOT NULL,
    produce_type ENUM('Organic', 'Standard') NOT NULL,
    market_type ENUM('Bargaining Market', 'KrishiSetu Market') NOT NULL,
    email VARCHAR(255) NOT NULL
);

-- Trigger for Add Produce
DELIMITER //

CREATE TRIGGER before_insert_add_produce
BEFORE INSERT ON add_produce
FOR EACH ROW
BEGIN
    DECLARE fetched_farmer_id VARCHAR(15);
    DECLARE fetched_full_name VARCHAR(255);
    DECLARE max_id INT DEFAULT 0;
    DECLARE next_id VARCHAR(10);
    DECLARE farmer_exists INT DEFAULT 0;

    -- Check if email exists in farmerprofile table
    SELECT COUNT(*) INTO farmer_exists
    FROM farmerprofile
    WHERE email = NEW.email;

    IF farmer_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid email: No matching farmer found in farmerprofile';
    END IF;

    -- Fetch farmer_id and full_name from the farmerprofile table based on email
    SELECT farmer_id, full_name
    INTO fetched_farmer_id, fetched_full_name
    FROM farmerprofile
    WHERE email = NEW.email
    LIMIT 1;

    -- Assign farmer_id and farmer_name (full_name)
    SET NEW.farmer_id = fetched_farmer_id;
    SET NEW.farmer_name = fetched_full_name;

    -- Generate Auto-incrementing Product ID (e.g., PRD001, PRD002, ...)
    SELECT IFNULL(MAX(CAST(SUBSTRING(product_id, 4) AS UNSIGNED)), 0) INTO max_id FROM add_produce;
    SET next_id = CONCAT('PRD', LPAD(max_id + 1, 3, '0'));
    SET NEW.product_id = next_id;
END //

DELIMITER ;

-- Insert Add Produce Data
INSERT INTO add_produce (email, produce_name, availability, price_per_kg, produce_type, market_type)  
VALUES  
('ruchita@gmail.com', 'Potatoes', 70, 20.00, 'Organic', 'KrishiSetu Market'),  
('ruchita@gmail.com', 'Apples', 60, 120.00, 'Organic', 'Bargaining Market'),  
('ruchita@gmail.com', 'Cabbage', 90, 15.00, 'Standard', 'KrishiSetu Market'),  
('ruchita@gmail.com', 'Grapes', 40, 90.00, 'Organic', 'Bargaining Market'),  
('ruchita@gmail.com', 'Garlic', 30, 80.00, 'Standard', 'KrishiSetu Market'),  
('arush@gmail.com', 'Spinach', 50, 25.00, 'Organic', 'KrishiSetu Market'),  
('arush@gmail.com', 'Pumpkin', 30, 18.00, 'Standard', 'Bargaining Market'),  
('arush@gmail.com', 'Bananas', 100, 40.00, 'Organic', 'KrishiSetu Market'),  
('arush@gmail.com', 'Peanuts', 80, 60.00, 'Standard', 'Bargaining Market'),  
('arush@gmail.com', 'Green Peas', 90, 55.00, 'Organic', 'KrishiSetu Market'),  
('pavan@gmail.com', 'Cucumber', 60, 22.00, 'Standard', 'KrishiSetu Market'),  
('pavan@gmail.com', 'Peppers', 45, 75.00, 'Organic', 'Bargaining Market'),  
('pavan@gmail.com', 'Mangoes', 70, 110.00, 'Organic', 'KrishiSetu Market'),  
('pavan@gmail.com', 'Radish', 30, 20.00, 'Standard', 'Bargaining Market'),  
('pavan@gmail.com', 'Sugarcane', 120, 15.00, 'Standard', 'KrishiSetu Market'),  
('teju@gmail.com', 'Milk', 150, 50.00, 'Organic', 'KrishiSetu Market'),  
('teju@gmail.com', 'Butter', 80, 450.00, 'Standard', 'Bargaining Market'),  
('teju@gmail.com', 'Corn', 200, 35.00, 'Organic', 'KrishiSetu Market'),  
('teju@gmail.com', 'Tomatoes', 90, 28.00, 'Standard', 'Bargaining Market'),  
('teju@gmail.com', 'Lentils', 110, 95.00, 'Organic', 'KrishiSetu Market');

-- Chat Room Table
CREATE TABLE chat_rooms (
    room_id VARCHAR(10) PRIMARY KEY,
    room_name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for Chat Room
DELIMITER $$

CREATE TRIGGER before_insert_chat_room
BEFORE INSERT ON chat_rooms
FOR EACH ROW
BEGIN
    DECLARE next_id INT;
    DECLARE formatted_id VARCHAR(10);

    -- Get the next incremented ID
    SELECT COALESCE(MAX(CAST(SUBSTRING(room_id, 3, 5) AS UNSIGNED)), 0) + 1 INTO next_id FROM chat_rooms;

    -- Format the room_id as RM001, RM002, ...
    SET formatted_id = CONCAT('RM', LPAD(next_id, 3, '0'));

    -- Assign the formatted ID
    SET NEW.room_id = formatted_id;
END$$

DELIMITER ;

-- Messages Table
CREATE TABLE messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(10) NOT NULL,
    farmer_id INT NOT NULL,
    sender_name VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for Messages
DELIMITER $$

CREATE TRIGGER before_insert_message
BEFORE INSERT ON messages
FOR EACH ROW
BEGIN
    DECLARE next_id INT;
    DECLARE formatted_msg_id VARCHAR(10);
    DECLARE sender_full_name VARCHAR(100);
    DECLARE fetched_room_id VARCHAR(10);

    -- Get the next incremented message ID
    SELECT COALESCE(MAX(CAST(SUBSTRING(message_id, 4, 5) AS UNSIGNED)), 0) + 1 INTO next_id FROM messages;
    
    -- Format the message_id as MSG001, MSG002, ...
    SET formatted_msg_id = CONCAT('MSG', LPAD(next_id, 3, '0'));

    -- Fetch the sender's full name (first_name + last_name) from farmerregistration
    SELECT CONCAT(first_name, ' ', last_name) INTO sender_full_name
    FROM farmerregistration WHERE farmer_id = NEW.farmer_id;

    -- Fetch the room_id from chat_rooms if not provided
    IF NEW.room_id IS NULL THEN
        SELECT room_id INTO fetched_room_id FROM chat_rooms ORDER BY created_at DESC LIMIT 1;
        SET NEW.room_id = fetched_room_id;
    END IF;

    -- Assign the formatted message_id and sender_name
    SET NEW.message_id = formatted_msg_id;
    SET NEW.sender_name = sender_full_name;
END$$

DELIMITER ;