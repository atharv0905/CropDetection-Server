CREATE DATABASE CROPDETECTION;
USE CROPDETECTION;

-- Tables 
-- user tables
CREATE TABLE user (
	id VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(20) NOT NULL,
    last_name VARCHAR(20) NOT NULL,
    phone NUMERIC(12, 0) UNIQUE, 
    password VARCHAR(100) NOT NULL
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

CREATE TABLE user_search_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    search_query VARCHAR(255) NOT NULL,
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- seller tables
CREATE TABLE seller (
	id VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(20) NOT NULL,
    last_name VARCHAR(20) NOT NULL,
    business_name VARCHAR(50) NOT NULL,
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

-- consultant tables
CREATE TABLE consultant (
    id VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(20) NOT NULL,
    last_name VARCHAR(20) NOT NULL,
    phone NUMERIC(12, 0) UNIQUE, 
    email VARCHAR(30) NOT NULL UNIQUE,
    expertise VARCHAR(50) NOT NULL CHECK(expertise IN ('Agronomy', 'Horticulture', 'Entomology & Pest Management', 'Dairy', 'Sociocultural ')),
    experience NUMERIC(2, 0) NOT NULL,
    starting_charges NUMERIC(6, 2) NOT NULL,
    profile VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL
);

CREATE TABLE consultant_verification (
    id VARCHAR(50) PRIMARY KEY,
    phone NUMERIC(12, 0) UNIQUE,
    phoneVerified BOOLEAN DEFAULT FALSE,
    phoneOTP NUMERIC(6, 0),
    email VARCHAR(30) UNIQUE,
    emailVerified BOOLEAN DEFAULT FALSE,
    emailOTP NUMERIC(6, 0),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE appointment (
	id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    consultant_id VARCHAR(50) NOT NULL,
    mode VARCHAR(7) CHECK(mode IN ('ONLINE', 'OFFLINE')),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(10) CHECK(status IN ('PENDING', 'CONFIRMED', 'CANCELLED')) DEFAULT 'PENDING',
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (consultant_id) REFERENCES consultant(id) ON DELETE CASCADE
);

-- product tables 
CREATE TABLE product (
    id VARCHAR(50) PRIMARY KEY,
    seller_id VARCHAR(50),
    name VARCHAR(50) NOT NULL,
    brand_name VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(500) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK(category IN ('Fertilizer', 'Pesticide', 'Seeds')),
    cost_price NUMERIC(6, 2) NOT NULL,
    selling_price NUMERIC(6, 2) NOT NULL,
    image VARCHAR(100) NOT NULL,
    about_company_line1 VARCHAR(100) NOT NULL,
    about_company_line2 VARCHAR(100),
    about_company_line3 VARCHAR(100),
    about_product_line1 VARCHAR(100) NOT NULL,
    about_product_line2 VARCHAR(100),
    about_product_line3 VARCHAR(100),
    about_product_line4 VARCHAR(100),
    quantity NUMERIC(5, 0),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES seller(id) ON DELETE CASCADE
);
            
CREATE TABLE product_image (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    image VARCHAR(100) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE
);

-- cart tables 
CREATE TABLE cart (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE cart_item (
    id VARCHAR(50) PRIMARY KEY,
    cart_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    quantity NUMERIC(3, 0) NOT NULL,
    FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE
);

CREATE TABLE pending_cart_deletion (
    cart_id VARCHAR(50) PRIMARY KEY
);


-- views
CREATE VIEW cart_summary AS
SELECT 
    u.id AS user_id,
    c.id AS cart_id,
    p.id AS product_id,
    p.name,
    p.title,
    p.selling_price AS rate,
    ci.quantity,
    (ci.quantity * p.selling_price) AS total_price,
    GROUP_CONCAT(pi.image) AS product_images -- Combines multiple images into a single string
FROM cart_item ci
JOIN cart c ON ci.cart_id = c.id
JOIN user u ON c.user_id = u.id
JOIN product p ON ci.product_id = p.id
LEFT JOIN product_image pi ON p.id = pi.product_id
GROUP BY ci.id, u.id, c.id, p.id, p.name, p.title, p.selling_price, ci.quantity;


-- events
DELIMITER $$

CREATE EVENT delete_empty_carts
ON SCHEDULE EVERY 1 MINUTE
DO
BEGIN
    DELETE FROM cart WHERE id IN (SELECT cart_id FROM pending_cart_deletion);
    DELETE FROM pending_cart_deletion;
END $$

DELIMITER ;


-- triggers 
DELIMITER $$

CREATE TRIGGER after_cart_item_delete
AFTER DELETE ON cart_item
FOR EACH ROW
BEGIN
    DECLARE item_count INT;

    -- Count remaining items in the cart
    SELECT COUNT(*) INTO item_count FROM cart_item WHERE cart_id = OLD.cart_id;

    -- If no items remain, add the cart_id to pending deletion table
    IF item_count <= 0 THEN
        INSERT IGNORE INTO pending_cart_deletion (cart_id) VALUES (OLD.cart_id);
    END IF;
END $$

DELIMITER ;


-- procedures 
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

DELIMITER $$

CREATE PROCEDURE UpsertConsultantVerificationByEmail(
    IN p_id VARCHAR(50),
    IN p_email VARCHAR(30),
    IN p_emailOTP NUMERIC(6, 0)
)
BEGIN
    DECLARE email_count INT;

    -- Check if the email already exists in seller_verification
    SELECT COUNT(*) INTO email_count FROM consultant_verification WHERE email = p_email;

    IF email_count = 0 THEN
        -- Insert if the email does not exist
        INSERT INTO consultant_verification (id, email, emailOTP, createdAt)
        VALUES (p_id, p_email, p_emailOTP, CURRENT_TIMESTAMP);
    ELSE
        -- Update if the email exists
        UPDATE consultant_verification 
        SET emailOTP = p_emailOTP, createdAt = CURRENT_TIMESTAMP
        WHERE email = p_email;
    END IF;
END $$

DELIMITER $$

CREATE PROCEDURE UpsertConsultantVerificationByPhone(
    IN p_id VARCHAR(50),
    IN p_phone NUMERIC(12, 0),
    IN p_phoneOTP NUMERIC(6, 0)
)
BEGIN
    DECLARE phone_count INT;

    -- Check if the phone number already exists in seller_verification
    SELECT COUNT(*) INTO phone_count FROM consultant_verification WHERE id = p_id;

    IF phone_count = 0 THEN
        -- Insert if the phone number does not exist
        INSERT INTO consultant_verification (id, phone, phoneOTP, createdAt)
        VALUES (p_id, p_phone, p_phoneOTP, CURRENT_TIMESTAMP);
    ELSE
        -- Update if the phone number exists
        UPDATE consultant_verification 
        SET phone = p_phone, phoneOTP = p_phoneOTP, createdAt = CURRENT_TIMESTAMP
        WHERE id = p_id;
    END IF;
END $$

DELIMITER ;

DELIMITER $$
CREATE PROCEDURE InsertSeller(
    IN p_id VARCHAR(50),
    IN p_first_name VARCHAR(20),
    IN p_last_name VARCHAR(20),
    IN p_business_name VARCHAR(50),
    IN p_phone NUMERIC(12, 0),
    IN p_email VARCHAR(30),
    IN p_gst VARCHAR(20),
    IN p_password VARCHAR(100)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
    END;
    
    START TRANSACTION;
    
    -- Insert into seller table
    INSERT INTO seller (id, first_name, last_name, business_name, phone, email, gst, password)
    VALUES (p_id, p_first_name, p_last_name, p_business_name, p_phone, p_email, p_gst, p_password);
    
    -- Delete from seller_verification table
    DELETE FROM seller_verification WHERE id = p_id;
    
    COMMIT;
END $$
DELIMITER ;

DELIMITER $$

CREATE PROCEDURE InsertConsultant(
    IN p_id VARCHAR(50),
    IN p_first_name VARCHAR(20),
    IN p_last_name VARCHAR(20),
    IN p_expertise VARCHAR(50),
    IN p_experience NUMERIC(2, 0),
    IN p_starting_charges NUMERIC(6, 2),
    IN p_phone NUMERIC(12, 0),
    IN p_email VARCHAR(30),
    IN p_password VARCHAR(100),
    IN p_profile VARCHAR(100)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- Rollback the transaction in case of an exception
        ROLLBACK;
    END;

    -- Start the transaction
    START TRANSACTION;

    -- Insert the consultant into the consultant table
    INSERT INTO consultant (id, first_name, last_name, expertise, experience, starting_charges, phone, email, profile, password)
    VALUES (p_id, p_first_name, p_last_name, p_expertise, p_experience, p_starting_charges, p_phone, p_email, p_profile, p_password);

    -- Delete the corresponding row from the consultant_verification table
    DELETE FROM consultant_verification WHERE email = p_email;

    -- Commit the transaction if everything is fine
    COMMIT;
END $$

DELIMITER ;












