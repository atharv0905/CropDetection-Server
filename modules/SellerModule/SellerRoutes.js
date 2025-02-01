/*
    File: modules/SellerModule/SellerRoutes.js
    Author: Atharv Mirgal
    Desc: This file contains the routes for the Seller Module
    Created: 31-01-2025
    Last Modified: 31-01-2025
*/

// Importing the required modules
const { Router } = require('express');
const sellerController = require('./SellerController');

// Creating the router object
const router = Router();

// Defining the routes
router.post('/send-email-otp', sellerController.handleSendEmailOtp); // tested

router.post('/verify-email-otp', sellerController.handleVerifyEmailOtp); // tested

router.post('/send-otp', sellerController.handleSendOtp); // tested

router.post('/verify-otp', sellerController.handleVerifyOtp); //  tested

router.post('/signup', sellerController.handleCreateNewUser); // tested

router.post('/login', sellerController.handleLogin); // tested

router.get('/protected', sellerController.verifyAccessToken, (req, res) => { // tested
    res.status(200).json({ success: true, message: "Access granted" });
})

router.post('/refresh-token', sellerController.handleRefreshAccessToken); // tested

// Exporting the router object
module.exports = router;