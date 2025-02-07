/*
    File: modules/ProfileModule/ProfileController.js
    Author: Yash Balotiya
    Desc: This file contains the controllers for the ProfileModule
    Created: 02-02-2025
    Last Modified: 07-02-2025
*/

// Importing required modules
const checkoutService = require("./ProfileService");

// Function to handle add new address
const addNewAddressHandler = async (req, res) => {
    // Desctructuring the request body
    const { name, line1, line2, street, landmark, city, state, pincode } = req.body;

    // Extracting the token from the request headers
    const token = req.headers['authorization']?.replace('Bearer ', '') || "";

    try {
        // Calling the addAddress function from the checkoutService
        const result = await checkoutService.addAddress(token, name, line1, line2, street, landmark, city, state, pincode);

        // Sending the response
        return res.status(result.status).json(result);
    } catch (err) {
        // Sending the error in the response
        console.error("Error in addNewAddressHandler: ", err);
        return res.status(500).json({ success: false, message: err.message, status: 500 });
    }
};

// Function to handle fetch all addresses
const fetchAllAddressHandler = async (req, res) => {
    // Extracting the token from the request headers
    const token = req.headers['authorization']?.replace('Bearer ', '') || "";

    try {
        // Calling the fetchAddresses function from the checkoutService
        const result = await checkoutService.fetchAddresses(token);

        // Sending the response
        return res.status(result.status).json(result);
    } catch (err) {
        // Sending the error in the response
        console.error("Error in fetchAllAddressHandler: ", err);
        return res.status(500).json({ success: false, message: err.message, status: 500 });
    }
};

// Function to handle update an address
const updateAddressHandler = async (req, res) => {
    // Desctructuring the request body
    const { address_id, line1, line2, street, landmark, city, state, pincode } = req.body;

    try {
        // Calling the updateAddress function from the checkoutService
        const result = await checkoutService.updateAddress(address_id, line1, line2, street, landmark, city, state, pincode);

        // Sending the response
        return res.status(result.status).json(result);
    } catch (err) {
        // Sending the error in the response
        console.error("Error in updateAddressHandler: ", err);
    }
};

// Function to handle delete an address
const deleteAddressHandler = async (req, res) => {
    // Desctructuring the request body
    const { address_id } = req.body;

    try {
        // Calling the deleteAddress function from the checkoutService
        const result = await checkoutService.deleteAddress(address_id);

        // Sending the response
        return res.status(result.status).json(result);
    } catch (err) {
        // Sending the error in the response
        console.error("Error in deleteAddressHandler: ", err);
        return res.status(500).json({ success: false, message: err.message, status: 500 });
    }
};

// Function to handle update user name
const updateUserNameHandler = async (req, res) => {
    // Desctructuring the request body
    const { fname, lname } = req.body;

    // Extracting the token from the request headers
    const token = req.headers['authorization']?.replace('Bearer ', '') || "";

    try {
        // Calling the updateUserName function from the checkoutService
        const result = await checkoutService.updateUserName(token, fname, lname);

        // Sending the response
        return res.status(result.status).json(result);
    } catch (err) {
        // Sending the error in the response
        console.error("Error in updateUserNameHandler: ", err);
        return res.status(500).json({ success: false, message: err.message, status: 500 });
    }
};

// Function to handle update user password
const updateUserPasswordHandler = async (req, res) => {
    // Desctructuring the request body
    const { oldPassword, newPassword } = req.body;

    // Extracting the token from the request headers
    const token = req.headers['authorization']?.replace('Bearer ', '') || "";

    try {
        // Calling the updateUserPassword function from the checkout
        const result = await checkoutService.updateUserPassword(token, oldPassword, newPassword);

        // Sending the response
        return res.status(result.status).json(result);
    } catch (err) {
        // Sending the error in the response
        console.error("Error in updateUserPasswordHandler: ", err);
        return res.status(500).json({ success: false, message: err.message, status: 500 });
    }
};

// Function to handle update user phone
const updateUserPhoneHandler = async (req, res) => {
    // Desctructuring the request body
    const { phone } = req.body;
    const token = req.headers['authorization']?.replace('Bearer ', '') || "";

    try {
        // Calling the updateUserPhone function from the checkoutService
        const result = await checkoutService.updateUserPhone(token, phone);

        // Sending the response
        return res.status(result.status).json(result);
    } catch (err) {
        // Sending the error in the response
        console.error("Error in updateUserPhoneHandler: ", err);
        return res.status(500).json({ success: false, message: err.message, status: 500 });
    }
};

// Exporting the functions
module.exports = {
    addNewAddressHandler,
    fetchAllAddressHandler,
    updateAddressHandler,
    deleteAddressHandler,
    updateUserNameHandler,
    updateUserPasswordHandler,
    updateUserPhoneHandler
};