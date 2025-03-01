/**
 * File: modules/UserModule/UserRoutes.js
 * Author: Yash Balotiya
 * Description: This file is used to handle the routes of the user module.
 * Created on: 27/01/2025
 * Last Modified: 05/02/2025
*/

// Importing the required modules
const { Router } = require('express');
const userController = require('./UserController');

// Creating the router object
const router = Router();

// Defining the routes
// Route to send OTP
router.post('/send-otp', userController.handleSendOtp); // tested

// Route to verify OTP
router.post('/verify-otp', userController.handleVerifyOtp); //  tested

// Route to create a new user
router.post('/signup', userController.handleCreateNewUser); // tested

// Route to login
router.post('/login', userController.handleLogin); // tested

router.get('/protected', userController.verifyAccessToken, (req, res) => { // tested
    res.status(200).json({ success: true, message: "Access granted" });
})

// Route to refresh the access token
router.post('/refresh-token', userController.handleRefreshAccessToken); // tested

// Route to payment
router.post('/payment', userController.handlePayment); 

// Exporting the router object
module.exports = router;