/*
    File: db.js
    Author: Atharv Mirgal
    Description: This file is used for mysql database connection
    Created on: 27-1-2025
    Last Modified: 27-1-2025
 */

const mysql = require("mysql2");
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST, // Change to your MySQL server host
  user: process.env.DATABASE_USER,      // Your MySQL username
  password: process.env.DATABASE_PASSWORD, // Your MySQL password
  database: process.env.DATABASE_NAME, // Replace with your database name
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    process.exit(1); // Exit the application if the connection fails
  }
  console.log("Connected to the MySQL database!");
});

module.exports = db;
