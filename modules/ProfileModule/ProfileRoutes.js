/*
    File: modules/ProfileModule/ProfileRoute.js
    Author: Yash Balotiya
    Desc: This file contains the controllers for the ProfileModule
    Created: 02-02-2025
    Last Modified: 03-02-2025
*/

// Importing required modules
const express = require("express");
const router = express.Router();
const profileController = require("./ProfileController");

// Route for adding new address
router.post("/add-new-address", profileController.addNewAddressHandler); // tested

// Route for fetching all addresses
router.get("/fetch-all-address", profileController.fetchAllAddressHandler); // tested

// Route for updating address
router.put("/update-address", profileController.updateAddressHandler); // tested

// Route for deleting address
router.delete("/delete-address", profileController.deleteAddressHandler); // tested

// Route for updating user name
router.put("/update-user-name", profileController.updateUserNameHandler); // tested

// Route for updating user password
router.put("/update-user-password", profileController.updateUserPasswordHandler); // tested

// Route for updating user phone
router.put("/update-user-phone", profileController.updateUserPhoneHandler); // tested

module.exports = router;