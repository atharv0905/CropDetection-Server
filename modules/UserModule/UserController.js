/**
 * File: modules/UserModule/UserController.js
 * Author: Yash Balotiya
 * Description: This file is used to handle the request and response of the user module.
 * Created on: 27/01/2025
 * Last Modified: 30/01/2025
*/

// Importing the required modules
const userService = require("./UserService");

// Function to handle the request to send OTP
const handleSendOtp = async (req, res) => {
    // Extracting the required data from the request body
    const { phone } = req.body;

    try {
        // Calling the server function to verify the phone number
        const result = await userService.sendOTP(phone);

        // Checking if the server function returned an error
        if (result.error) {
            return res.status(500).json({ error: result.error });
        }

        // Sending the response to the client
        return res.status(200).json({ success: true });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to add phone number and to send OTP!!" });
    }
};

// Function to handle the request to verify OTP
const handleVerifyOtp = async (req, res) => {
    // Extracting the required data from the request body
    const { phone, otp } = req.body;

    try {
        // Calling the server function to verify the OTP
        const result = await userService.verifyOTP(phone, otp);

        // Checking if the server function returned an error
        if (result.error) {
            return res.status(500).json({ error: result.error });
        }

        // Sending the response to the client
        return res.status(200).json({ success: true });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to verify OTP" });
    }
};

// Function to handle the request to create a new user
const handleCreateNewUser = async (req, res) => {
    // Extracting the required data from the request body
    const { firstName, lastName, phone, password } = req.body;

    try {
        // Calling the server function to create a new user
        const result = await userService.createNewUser(firstName, lastName, phone, password);

        // Checking if the server function returned an error
        if (result.error) {
            return res.status(500).json({ error: result.error });
        }

        // Sending the response to the client
        return res.status(201).json({ success: true });aa

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to create user" });
    }
};

// Exporting the controller functions
module.exports = {
    handleCreateNewUser,
    handleSendOtp,
    handleVerifyOtp
}