/*
    File: modules/CheckoutModule/CheckoutService.js
    Author: Yash Balotiya
    Desc: This file contains the services for the CheckoutModule
    Created: 03-02-2025
    Last Modified: 07-02-2025
*/

// Importing required modules
const jwt = require("jsonwebtoken");
const utilityService = require("../UtilityModule/UtilityService");
const { v4: uuidv4 } = require("uuid");

// Function to fetch order summary
const fetchOrderSummary = async (token) => {
    try {
        // Verifying the token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user_id = decoded.id;

        // Query to fetch the order summary
        const fetchQuery = "SELECT * FROM cart_summary WHERE user_id = ?;";

        // Fetching the order summary
        const orderSummary = await utilityService.sendQuery(fetchQuery, [user_id], "Failed to fetch order summary");

        if (!orderSummary || orderSummary.length === 0) {
            return { success: false, status: 404, message: "Order summary not found", orderSummary: {} };
        }

        return { success: true, status: 200, message: "Order summary fetched successfully", orderSummary };
    } catch (err) {
        console.error("Error in fetchOrderSummary:", err);
        return { success: false, status: 500, message: "Failed to fetch order summary", orderSummary: {} };
    }
};

// Function to complete the order
const placeOrder = async (token, address, total_amount, transaction_id, payment_id, payment_method, payment_status) => {
    try {
        // Verifying the token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user_id = decoded.id;

        // Query to insert the order into the database
        const insertQuery = "CALL PlaceOrder(?, ?, ?, ?, ?, ?, ?, ?, ?);";

        // Generating unique order id and history id
        const order_id = uuidv4();
        const order_history_id = uuidv4();

        // Inserting the order into the database
        await utilityService.sendQuery(insertQuery, [order_id, order_history_id, user_id, address, total_amount, transaction_id, payment_id, payment_method, payment_status], "Failed to place order");

        return { success: true, status: 200, message: "Order placed successfully", data: { order_id, order_history_id } };
    } catch (err) {
        console.error("Error in placeOrder:", err);
        return { success: false, status: 500, message: "Failed to place order", data: {} };
    }
};

// Exporting the functions
module.exports = {
    fetchOrderSummary,
    placeOrder
};