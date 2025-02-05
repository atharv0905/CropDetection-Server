/*
    File: modules/CheckoutModule/CheckoutRoute.js
    Author: Yash Balotiya
    Desc: This file contains the controllers for the CheckoutModule
    Created: 03-02-2025
    Last Modified: 05-02-2025
*/

// Importing required modules
const express = require("express");
const router = express.Router();
const checkoutController = require("./CheckoutController");

// Route to fetch order summary
router.get("/order-summary", checkoutController.fetchOrderSummaryHandler);

// Route to place order
router.post("/place-order", checkoutController.placeOrderHandler);

// Exporting the router
module.exports = router;