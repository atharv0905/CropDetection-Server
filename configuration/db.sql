CREATE DATABASE CROPDETECTION;
USE CROPDETECTION;

CREATE TABLE user (
	id VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(20) NOT NULL,
    last_name VARCHAR(20) NOT NULL,
    phone NUMERIC(12, 0) UNIQUE, 
    email VARCHAR(30) NOT NULL UNIQUE,
    password VARCHAR(20) NOT NULL
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
    email VARCHAR(30) UNIQUE NOT NULL,
    emailVerified BOOLEAN, 
    emailOTP NUMERIC(6, 0),
    phone NUMERIC(12, 0) UNIQUE,
    phoneVerified BOOLEAN,
    phoneOTP NUMERIC(6, 0),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    description VARCHAR(50) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK(category IN ('Fertilizer', 'Pesticide', 'Seeds')),
    price NUMERIC(6, 2) NOT NULL,
    image VARCHAR(50) NOT NULL
);

