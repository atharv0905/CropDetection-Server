/**
 * File: modules/UserModule/UserRoutes.js
 * Author: Yash Balotiya
 * Description: This file is used to handle the routes of the user module.
 * Created on: 27/01/2025
 * Last Modified: 29/01/2025
*/

// Importing the required modules
const { Router } = require('express');
const userController = require('./UserController');

// Creating the router object
const router = Router();

// Defining the routes
router.post('/sendOtp', userController.handleSendOtp);
router.post('/verifyOtp', userController.handleVerifyOtp);
router.post('/signup', userController.handleCreateNewUser);

// Exporting the router object
module.exports = router;