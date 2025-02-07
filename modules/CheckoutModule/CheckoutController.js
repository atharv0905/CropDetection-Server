/*
    File: modules/CheckoutModule/CheckoutController.js
    Author: Yash Balotiya
    Desc: This file contains the controllers for the CheckoutModule
    Created: 03-02-2025
    Last Modified: 07-02-2025
*/

// Importing required modules
const checkoutService = require("./CheckoutService");

// Function to handle fetch order summary
const fetchOrderSummaryHandler = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1] || "";

        if (!token) {
            return res.status(401).json({
                success: false,
                status: 401,
                message: "Unauthorized: Missing authentication token"
            });
        }

        const result = await checkoutService.fetchOrderSummary(token);
        return res.status(result.status).json({
            success: result.success,
            status: result.status,
            message: result.message,
            data: result.orderSummary || {}
        });
    } catch (error) {
        console.error("Unexpected error in fetchOrderSummaryHandler:", error);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Unexpected error occurred while fetching order summary",
            data: {}
        });
    }
};

// Function to handle complete order
const placeOrderHandler = async (req, res) => {
    try {
        const { address, total_amount, transaction_id, payment_id, payment_method, payment_status } = req.body;
        const token = req.headers.authorization?.split(" ")[1] || "";

        if (!token) {
            return res.status(401).json({
                success: false,
                status: 401,
                message: "Unauthorized: Missing authentication token"
            });
        }

        if (!address || !total_amount || !transaction_id || !payment_id || !payment_method || !payment_status) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "Invalid request: All required fields must be provided"
            });
        }

        const result = await checkoutService.placeOrder(token, address, total_amount, transaction_id, payment_id, payment_method, payment_status);
        return res.status(result.status).json({
            success: result.success,
            status: result.status,
            message: result.message,
            data: result.data || {}
        });
    } catch (error) {
        console.error("Unexpected error in placeOrderHandler:", error);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Unexpected error occurred while placing the order",
            data: {}
        });
    }
};

// Exporting the functions
module.exports = {
    fetchOrderSummaryHandler,
    placeOrderHandler
};