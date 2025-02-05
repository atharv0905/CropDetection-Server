/*
    File: modules/CheckoutModule/CheckoutController.js
    Author: Yash Balotiya
    Desc: This file contains the controllers for the CheckoutModule
    Created: 03-02-2025
    Last Modified: 05-02-2025
*/

// Importing required modules
const checkoutService = require("./CheckoutService");

// Function to handle fetch order summary
const fetchOrderSummaryHandler = async (req, res) => {
    // Extracting the token from the request headers
    const token = req.headers['authorization']?.replace('Bearer ', '') || "";

    try {
        // Calling the fetchOrderSummary function from the checkoutService
        const result = await checkoutService.fetchOrderSummary(token);

        // Sending the response
        if (result.success) {
            res.status(200).send(result);
        } else {
            res.status(500).send(result);
        }
        // res.json(result);
    } catch (err) {
        // Sending the error in the response
        res.status(500).send({ success: false, message: err.message });
        // res.json({ success: false, message: err.message });
    }
};

// Function to handle complete order
const placeOrderHandler = async (req, res) => {
    // Extract data from body
    const { address, total_amount, transaction_id, payment_id, payment_method, payment_status } = req.body;

    // Extracting the token from the request headers
    const token = req.headers['authorization']?.replace('Bearer ', '') || "";

    try {
        // Calling the completeOrder function from the checkoutService
        const result = await checkoutService.placeOrder(token, address, total_amount, transaction_id, payment_id, payment_method, payment_status);

        // Sending the response
        if (result.success) {
            res.status(200).send(result);
        } else {
            res.status(500).send(result);
        }
        // res.json(result);
    } catch (err) {
        // Sending the error in the response
        res.status(500).send({ success: false, message: err.message });
        // res.json({ success: false, message: err.message });
    }
};

// Exporting the functions
module.exports = {
    fetchOrderSummaryHandler,
    placeOrderHandler
};