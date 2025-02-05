/*
    File: modules/CheckoutModule/CheckoutService.js
    Author: Yash Balotiya
    Desc: This file contains the controllers for the CheckoutModule
    Created: 03-02-2025
    Last Modified: 05-02-2025
*/

// Importing required modules
const jwt = require("jsonwebtoken");
const utilityService = require("../UtilityModule/UtilityService");
const { v4: uuidv4 } = require("uuid");

// Function to fetch order summary+
const fetchOrderSummary = async (token) => {
    try {
        // Verifying the token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log(decoded)

        // Fetching the user details from the decoded token
        const user_id = decoded.id;

        // Query to fetch the order summary
        const fetchQuery = "SELECT * FROM cart_summary WHERE user_id = ?;";

        // Fetching the order summary
        const orderSummary = await utilityService.sendQuery(fetchQuery, [user_id], "Failed to fetch order summary");

        return { success: true, orderSummary };
    } catch (err) {
        throw new Error(err.message);
    }
};

// Function to complete the order
const placeOrder = async (token, address, total_amount, transaction_id, payment_id, payment_method, payment_status, order_status) => {
    try {
        // Verifying the token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Fetching the user details from the decoded token
        const user_id = decoded.id;

        // Query to insert the order into the database
        const insertQuery = "CALL PlaceOrder(?, ?, ?, ?, ?, ?, ?, ?, ?);";

        // Generating a unique order id and unique order history id
        const order_id = uuidv4();
        const order_history_id = uuidv4();

        // Inserting the order into the database
        await utilityService.sendQuery(insertQuery, [order_id, order_history_id, user_id, address, total_amount, transaction_id, payment_id, payment_method, payment_status], "Failed to place order");

        return { success: true, message: "Order placed successfully" };
    } catch (err) {
        throw new Error(err.message);
    }
};

// Exporting the functions
module.exports = {
    fetchOrderSummary,
    placeOrder
};