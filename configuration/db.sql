CREATE DATABASE CROPDETECTION;
USE CROPDETECTION;

CREATE TABLE user (
	id VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(20) NOT NULL,
    last_name VARCHAR(20) NOT NULL,
    phone NUMERIC(12, 0) UNIQUE, 
    -- email VARCHAR(30) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
);

CREATE TABLE seller (
	id VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(20) NOT NULL,
    last_name VARCHAR(20) NOT NULL,
    phone NUMERIC(12, 0) UNIQUE, 
    email VARCHAR(30) NOT NULL UNIQUE,
    gst VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
);

CREATE TABLE seller_verification (
    id VARCHAR(50) PRIMARY KEY,
    phone NUMERIC(12, 0) UNIQUE,
    phoneVerified BOOLEAN DEFAULT FALSE,
    phoneOTP NUMERIC(6, 0),
    email VARCHAR(30) UNIQUE,
    emailVerified BOOLEAN DEFAULT FALSE,
    emailOTP NUMERIC(6, 0),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_address (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    line_one VARCHAR(50) NOT NULL,
    line_two VARCHAR(50) NOT NULL,
    street VARCHAR(20) NOT NULL,
    landmark VARCHAR(20) NOT NULL,
    city VARCHAR(20) NOT NULL,
    state VARCHAR(20) NOT NULL,
    country VARCHAR(20) NOT NULL,
    zip_code NUMERIC(6, 0) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE TABLE user_verification (
    id VARCHAR(50) PRIMARY KEY,
    phone NUMERIC(12, 0) UNIQUE,
    phoneVerified BOOLEAN DEFAULT FALSE,
    phoneOTP NUMERIC(6, 0),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description VARCHAR(500) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK(category IN ('Fertilizer', 'Pesticide', 'Seeds')),
    price NUMERIC(6, 2) NOT NULL,
    image VARCHAR(50) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_search_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    search_query VARCHAR(255) NOT NULL,
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

DELIMITER $$

CREATE PROCEDURE ManageUserSearchHistory(
    IN p_user_id VARCHAR(50), 
    IN p_search_query VARCHAR(255)
)
BEGIN
    -- Insert new search history record
    INSERT INTO user_search_history (user_id, search_query) 
    VALUES (p_user_id, p_search_query);

    -- Delete the oldest record if more than 10 exist for this user
    DELETE FROM user_search_history 
    WHERE id IN (
        SELECT id FROM (
            SELECT id FROM user_search_history 
            WHERE user_id = p_user_id 
            ORDER BY searched_at ASC 
            LIMIT 1 OFFSET 20
        ) AS subquery
    );
END $$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE UpsertUserVerification(
    IN p_id VARCHAR(50),
    IN p_phone VARCHAR(20),
    IN p_phoneOTP VARCHAR(10)
)
BEGIN
    DECLARE record_count INT;

    -- Check if the phone number already exists
    SELECT COUNT(*) INTO record_count FROM user_verification WHERE phone = p_phone;

    IF record_count = 0 THEN
        -- Insert if the phone number does not exist
        INSERT INTO user_verification (id, phone, phoneOTP) VALUES (p_id, p_phone, p_phoneOTP);
    ELSE
        -- Update if the phone number exists
        UPDATE user_verification SET phoneOTP = p_phoneOTP WHERE phone = p_phone;
    END IF;
END $$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE UpsertSellerVerificationByEmail(
    IN p_id VARCHAR(50),
    IN p_email VARCHAR(30),
    IN p_emailOTP NUMERIC(6, 0)
)
BEGIN
    DECLARE email_count INT;

    -- Check if the email already exists in seller_verification
    SELECT COUNT(*) INTO email_count FROM seller_verification WHERE email = p_email;

    IF email_count = 0 THEN
        -- Insert if the email does not exist
        INSERT INTO seller_verification (id, email, emailOTP, createdAt)
        VALUES (p_id, p_email, p_emailOTP, CURRENT_TIMESTAMP);
    ELSE
        -- Update if the email exists
        UPDATE seller_verification 
        SET emailOTP = p_emailOTP, createdAt = CURRENT_TIMESTAMP
        WHERE email = p_email;
    END IF;
END $$

DELIMITER $$

CREATE PROCEDURE UpsertSellerVerificationByPhone(
    IN p_id VARCHAR(50),
    IN p_phone NUMERIC(12, 0),
    IN p_phoneOTP NUMERIC(6, 0)
)
BEGIN
    DECLARE phone_count INT;

    -- Check if the phone number already exists in seller_verification
    SELECT COUNT(*) INTO phone_count FROM seller_verification WHERE id = p_id;

    IF phone_count = 0 THEN
        -- Insert if the phone number does not exist
        INSERT INTO seller_verification (id, phone, phoneOTP, createdAt)
        VALUES (p_id, p_phone, p_phoneOTP, CURRENT_TIMESTAMP);
    ELSE
        -- Update if the phone number exists
        UPDATE seller_verification 
        SET phone = p_phone, phoneOTP = p_phoneOTP, createdAt = CURRENT_TIMESTAMP
        WHERE id = p_id;
    END IF;
END $$

DELIMITER ;









