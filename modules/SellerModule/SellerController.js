/*
    File: modules/SellerModule/SellerController.js
    Author: Atharv Mirgal, Yash Balotiya
    Desc: This file contains the controllers for the Seller Module
    Created: 31-01-2025
    Last Modified: 05-02-2025
*/

// Importing the required modules
const sellerService = require("./SellerService");
const jwt = require('jsonwebtoken');

// Function to handle the request to send email OTP
const handleSendEmailOtp = async (req, res) => {
    // Extracting the required data from the request body
    const { email } = req.body;

    try {
        // Calling the server function to verify the email
        const result = await sellerService.sendEmailOTP(email);

        // Checking if the server function returned an error
        if (result.error) {
            return res.status(500).json({ error: result.error });
        }

        // Sending the response to the client
        if (result.success) {
            return res.status(200).json({ success: true, message: "OTP sent successfully" });
        } else {
            return res.status(500).json({ error: "Failed to send OTP" });
        }

    } catch (error) {
        // Sending the error response to the client
        console.error("Error sending email OTP:", error);
        return res.status(500).json({ error: error.message || "Failed to add email and to send OTP!!", success: false, message: "Failed to send OTP" });
    }
};

// Function to handle the request to verify email OTP
const handleVerifyEmailOtp = async (req, res) => {
    // Extracting the required data from the request body
    const { email, otp } = req.body;

    try {
        // Calling the server function to verify the OTP
        const result = await sellerService.verifyEmailOTP(email, otp);

        // Checking if the server function returned an error
        if (result.error) {
            return res.status(500).json({ error: result.error });
        }

        // Sending the response to the client
        if (result.success) {
            return res.status(200).json({ success: true, message: "OTP verified successfully" });
        } else {
            return res.status(500).json({ error: "Failed to verify OTP", success: false, message: "Failed to verify OTP" });
        }

    } catch (error) {
        // Sending the error response to the client
        console.error("Error verifying email OTP:", error);
        return res.status(500).json({ error: error.message || "Failed to verify OTP", success: false, message: "Failed to verify OTP" });
    }
};

// Function to handle the request to send OTP
const handleSendOtp = async (req, res) => {
    // Extracting the required data from the request body
    const { email, phone } = req.body;

    try {
        // Calling the server function to verify the phone number
        const result = await sellerService.sendOTP(email, phone);

        // Checking if the server function returned an error
        if (result.error) {
            return res.status(500).json({ error: result.error });
        }

        // Sending the response to the client
        if (result.success) {
            return res.status(200).json({ success: true, message: "OTP sent successfully" });
        } else {
            return res.status(500).json({ error: "Failed to send OTP", success: false, message: "Failed to send OTP" });
        }

    } catch (error) {
        // Sending the error response to the client
        console.error("Error sending OTP:", error);
        return res.status(500).json({ error: error.message || "Failed to add phone number and to send OTP!!", success: false, message: "Failed to send OTP" });
    }
};

// Function to handle the request to verify OTP
const handleVerifyOtp = async (req, res) => {
    // Extracting the required data from the request body
    const { phone, otp } = req.body;

    try {
        // Calling the server function to verify the OTP
        const result = await sellerService.verifyOTP(phone, otp);

        // Checking if the server function returned an error
        if (result.error) {
            return res.status(500).json({ error: result.error });
        }

        // Sending the response to the client
        if (result.success) {
            return res.status(200).json({ success: true, message: "OTP verified successfully" });
        } else {
            return res.status(500).json({ error: "Failed to verify OTP", success: false, message: "Failed to verify OTP" });
        }

    } catch (error) {
        // Sending the error response to the client
        console.error("Error verifying OTP:", error);
        return res.status(500).json({ error: error.message || "Failed to verify OTP", success: false, message: "Failed to verify OTP" });
    }
};

// Function to handle the request to create a new user
const handleCreateNewUser = async (req, res) => {
    // Extracting the required data from the request body
    const { firstName, lastName, businessName, email, phone, gst, password } = req.body;

    try {
        // Calling the server function to create a new user
        const result = await sellerService.createNewUser(firstName, lastName, businessName, email, phone, gst, password);

        // Checking if the server function returned an error
        if (result.error) {
            return res.status(500).json({ error: result.error });
        }

        // Sending the response to the client
        if (result.success) {
            return res.status(200).json({ success: true, message: "User created successfully" });
        } else {
            return res.status(500).json({ error: "Failed to create user", success: false, message: "Failed to create user" });
        }

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to create user", success: false, message: "Failed to create user" });
    }
};

// Function to handle the request to login user
const handleLogin = async (req, res) => {
    // Extracting the required data from the request body
    const { email, password } = req.body;

    try {
        // Calling the server function to login user
        const result = await sellerService.login(email, password);

        // Checking if the server function returned an error
        if (result.error) {
            return res.status(500).json({ error: result.error });
        }

        // Sending the response to the client
        if (result.success) {
            return res.status(200).json({ success: true, accessToken: result.accessToken, refreshToken: result.refreshToken, message: "User logged in successfully" });
        } else {
            return res.status(500).json({ error: "Failed to login user", success: false, message: "Failed to login user" });
        }

    } catch (error) {
        // Sending the error response to the client
        console.error("Error logging in user:", error);
        return res.status(500).json({ error: error.message || "Failed to login user", success: false, message: "Failed to login user" });
    }
};

// Middleware to verify the access token
const verifyAccessToken = async (req, res, next) => {
    // Extracting the access token from the request headers
    const token = req.headers['authorization'].replace('Bearer ', '');

    // Checking if the access token is present
    if (!token) {
        return res.status(401).json({ error: "Access token not found" });
    }

    try {
        // Verifying the access token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                throw new Error("Invalid access token");
            }
            return decoded;
        });
        req.userId = decoded.id;
        next();
    } catch (err) {
        // Sending the error response to the client
        console.error("Error verifying access token:", err);
        return res.status(401).json({ error: "Invalid access token", success: false, message: "Invalid access token" });
    }
};

// Function to handle the request to refresh access token
const handleRefreshAccessToken = async (req, res) => {
    // Extracting the required data from the request body
    const { refreshToken } = req.body;

    try {
        // Calling the server function to refresh access token
        const result = await sellerService.refreshAccessToken(refreshToken);

        // Checking if the server function returned an error
        if (result.error) {
            return res.status(500).json({ error: result.error });
        }

        // Sending the response to the client
        if (result.success) {
            return res.status(200).json({ success: true, accessToken: result.accessToken, message: "Access token refreshed successfully" });
        } else {
            return res.status(500).json({ error: "Failed to refresh access token", success: false, message: "Failed to refresh access token" });
        }

    } catch (error) {
        // Sending the error response to the client
        console.error("Error refreshing access token:", error);
        return res.status(500).json({ error: error.message || "Failed to refresh access token", success: false, message: "Failed to refresh access token" });
    }
};

// Function for fetching details from user_order_summary
const fetchOrderSummaryHandler = async (req, res) => {
    const token = req.headers['authorization'].replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const id = decoded.id;

    try {
        const result = await sellerService.fetchOrderSummary(id);
        res.json(result);
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

const fetchProductsHandler = async (req, res) => {
    const token = req.headers['authorization'].replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const id = decoded.id;

    try {
        const result = await sellerService.fetchProducts(id);
        res.json(result);
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// Exporting the controller functions
module.exports = {
    handleSendEmailOtp,
    handleVerifyEmailOtp,
    handleCreateNewUser,
    handleSendOtp,
    handleVerifyOtp,
    handleLogin,
    verifyAccessToken,
    handleRefreshAccessToken,
    fetchOrderSummaryHandler,
    fetchProductsHandler
}