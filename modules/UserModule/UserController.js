/**
 * File: modules/UserModule/UserController.js
 * Author: Yash Balotiya
 * Description: This file is used to handle the request and response of the user module.
 * Created on: 27/01/2025
 * Last Modified: 05/02/2025
*/

// Importing the required modules
const userService = require("./UserService");
const jwt = require('jsonwebtoken');

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

        return res.status(result.status).json({ success: result.success, message: result.message });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to add phone number and to send OTP!!", success: false, message: "Failed to send OTP" });
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
        return res.status(result.status).json({ success: result.success, message: result.message });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to verify OTP", success: false, message: "Failed to verify OTP" });
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
        return res.status(result.status).json({ success: result.success, message: result.message });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to create user", success: false, message: "Failed to create user" });
    }
};

// Function to handle the request to login user
const handleLogin = async (req, res) => {
    // Extracting the required data from the request body
    const { phone, password } = req.body;

    try {
        // Calling the server function to login user
        const result = await userService.login(phone, password);

        // Checking if the server function returned an error
        if (result.error) {
            return res.status(500).json({ error: result.error });
        }

        // Sending the response to the client
        return res.status(result.status).json({ success: result.success, message: result.message, accessToken: result.accessToken, refreshToken: result.refreshToken });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to login user", success: false, message: "Failed to login user" });
    }
};

// Middleware to verify the access token
const verifyAccessToken = async (req, res, next) => {
    // Extracting the access token from the request headers
    const token = req.headers['authorization'].replace('Bearer ', '');

    // Checking if the access token is present
    if (!token) {
        return res.status(401).json({ error: "Access token not found", success: false, message: "Access token not found" });
    }

    try {
        // Verifying the access token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                // throw new Error("Invalid access token");
                return res.status(401).json({ error: "Invalid access token", success: false, message: "Invalid access token" });
            }
            return decoded;
        });
        req.userId = decoded.id;
        next();
    } catch (err) {
        // Sending the error response to the client
        return res.status(401).json({ error: "Invalid access token", success: false, message: "Invalid access token" });
    }
};

// Function to handle the request to refresh access token
const handleRefreshAccessToken = async (req, res) => {
    // Extracting the required data from the request body
    const { refreshToken } = req.body;

    try {
        // Calling the server function to refresh access token
        const result = await userService.refreshAccessToken(refreshToken);

        // Checking if the server function returned an error
        if (result.error) {
            return res.status(500).json({ error: result.error });
        }

        // Sending the response to the client
        return res.status(result.status).json({ success: result.success, message: result.message, accessToken: result.accessToken });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to refresh access token", success: false, message: "Failed to refresh access token" });
    }
};

// Function to handle the request to make payment
const handlePayment = async (req, res) => {
    const { amount } = req.body;  // Extract the amount from the request body
    
    try {
        // Call the service function to create the payment order
        const result = await userService.createPayment(amount);

        // Send the response based on the service result
        return res.status(result.status).json(result);
    } catch (error) {
        console.error("Error in payment controller:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to make payment",
            error: error.message || error,
            status: 500
        });
    }
};

// Exporting the controller functions
module.exports = {
    handleCreateNewUser,
    handleSendOtp,
    handleVerifyOtp,
    handleLogin,
    verifyAccessToken,
    handleRefreshAccessToken,
    handlePayment
}