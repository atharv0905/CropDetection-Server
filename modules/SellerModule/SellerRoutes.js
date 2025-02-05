/*
    File: modules/SellerModule/SellerRoutes.js
    Author: Atharv Mirgal, Yash Balotiya
    Desc: This file contains the routes for the Seller Module
    Created: 31-01-2025
    Last Modified: 05-02-2025
*/

// Importing the required modules
const { Router } = require('express');
const sellerController = require('./SellerController');

// Creating the router object
const router = Router();

// Defining the routes
// Route to send email otp
router.post('/send-email-otp', sellerController.handleSendEmailOtp); // tested

// Route to verify email otp
router.post('/verify-email-otp', sellerController.handleVerifyEmailOtp); // tested

// Route to send otp
router.post('/send-otp', sellerController.handleSendOtp); // tested

// Route to verify otp
router.post('/verify-otp', sellerController.handleVerifyOtp); //  tested

// Route to create a new user
router.post('/signup', sellerController.handleCreateNewUser); // tested

// Route to login
router.post('/login', sellerController.handleLogin); // tested

router.get('/protected', sellerController.verifyAccessToken, (req, res) => { // tested
    res.status(200).json({ success: true, message: "Access granted" });
});

// Route to refresh access token
router.post('/refresh-token', sellerController.handleRefreshAccessToken); // tested

router.get("/get-sales-details", sellerController.verifyAccessToken, sellerController.fetchOrderSummaryHandler); // tested

router.get("/get-products", sellerController.verifyAccessToken, sellerController.fetchProductsHandler); // tested

// Exporting the router object
module.exports = router;