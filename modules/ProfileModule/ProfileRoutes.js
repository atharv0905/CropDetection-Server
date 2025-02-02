/*
    File: modules/ProfileModule/ProfileRoute.js
    Author: Yash Balotiya
    Desc: This file contains the controllers for the ProfileModule
    Created: 02-02-2025
    Last Modified: 02-02-2025
*/

// Importing required modules
const express = require("express");
const router = express.Router();
const checkoutController = require("./ProfileController");

// Route for adding new address
router.post("/add-new-address", checkoutController.addNewAddressHandler); // tested

// Route for fetching all addresses
router.get("/fetch-all-address", checkoutController.fetchAllAddressHandler); // tested

// Route for updating address
router.put("/update-address", checkoutController.updateAddressHandler); // tested

// Route for deleting address
router.delete("/delete-address", checkoutController.deleteAddressHandler); // tested

// Route for updating user name
router.put("/update-user-name", checkoutController.updateUserNameHandler); // tested

// Route for updating user password
router.put("/update-user-password", checkoutController.updateUserPasswordHandler); // tested

// Route for updating user phone
router.put("/update-user-phone", checkoutController.updateUserPhoneHandler); // tested

module.exports = router;