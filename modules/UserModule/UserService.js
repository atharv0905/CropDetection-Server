/**
 * File: modules/UserModule/UserServer.js
 * Author: Yash Balotiya, Atharv Mirgal
 * Description: This file is used to handle the server-side logic of the user module.
 * Created on: 27/01/2025
 * Last Modified: 05/02/2025
*/

// Importing the required modules
const { v4: uuidv4 } = require("uuid");
require('dotenv').config();
const bcrypt = require('bcrypt');
const { promisify } = require('util');
const { sendSMS } = require("../../configuration/sms");
const utilityService = require("../UtilityModule/UtilityService");
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');

// Function to generate 6 digit OTP
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

// Function to send OTP
const sendOTP = async (phone) => {
    try {
        // Check if phone number is already registered
        const checkPhoneQuery = "SELECT * FROM user WHERE phone = ?";
        const result = await utilityService.sendQuery(checkPhoneQuery, [phone], "Failed to check phone number");

        if (result.length > 0) {
            return { success: false, status: 409, message: "Phone number already registered" };
        }

        // Generate OTP and insert phone number into verification table
        const otp = generateOTP();
        const id = uuidv4();

        const insertPhoneQuery = "CALL UpsertUserVerification(?, ?, ?);";
        await utilityService.sendQuery(insertPhoneQuery, [id, phone, otp], "Failed to insert phone number");

        // Send OTP via SMS
        const phoneNumber = '+91' + phone;
        // await sendSMS(phoneNumber, `Your OTP is ${otp}. Please do not share this with anyone.`);

        // Return success response
        return { success: true, status: 200, message: "OTP sent successfully" };
    } catch (err) {
        console.error("Error sending OTP:", err);
        return { success: false, status: 500, message: "Failed to send OTP" };
    }
};

// Function to verify OTP
const verifyOTP = async (phone, otp) => {
    try {
        // Query to check if OTP is valid
        const checkOTPQuery = "SELECT * FROM user_verification WHERE phone = ? AND phoneOTP = ?";
        const result = await utilityService.sendQuery(checkOTPQuery, [phone, otp], "Failed to check OTP");

        // Check if OTP is valid
        if (result.length === 0) {
            return { success: false, status: 400, message: "Invalid OTP" };
        }

        // Check for OTP expiry
        const currentTime = new Date();
        const otpTime = new Date(result[0].createdAt);
        const timeDiff = currentTime - otpTime; // Time difference in milliseconds

        if (timeDiff > 15 * 60 * 1000) { // 15 minutes
            return { success: false, status: 401, message: "OTP expired" };
        }

        // Query to verify OTP
        const verifyOTPQuery = "UPDATE user_verification SET phoneVerified = 1 WHERE phone = ?";
        await utilityService.sendQuery(verifyOTPQuery, [phone], "Failed to verify OTP");

        // Return success message
        return { success: true, status: 200, message: "OTP verified successfully" };
    } catch (err) {
        console.error("Error verifying OTP:", err);
        return { success: false, status: 500, message: "Failed to verify OTP" };
    }
};

// Function to create new user
const createNewUser = async (firstName, lastName, phone, password) => {
    try {
        // Check if phone number is already registered
        const checkPhoneQuery = "SELECT * FROM user WHERE phone = ?";
        const result = await utilityService.sendQuery(checkPhoneQuery, [phone], "Failed to check phone number");

        if (result.length > 0) {
            return { success: false, status: 409, message: "Phone number already registered" };
        }

        // Check if phone number is verified
        const checkVerificationQuery = "SELECT * FROM user_verification WHERE phone = ? AND phoneVerified = 1";
        const verificationResult = await utilityService.sendQuery(checkVerificationQuery, [phone], "Failed to check verification");

        if (verificationResult.length === 0) {
            return { success: false, status: 400, message: "Phone number not verified" };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Get user ID from verification table
        const id = verificationResult[0].id;

        // Insert user details
        const insertUserQuery = "CALL InsertUser(?, ?, ?, ?, ?, ?);";
        await utilityService.sendQuery(insertUserQuery, [id, firstName, lastName, phone, hashedPassword, "insert"], "Failed to create new user");

        // Return success message
        return { success: true, status: 201, message: "User created successfully" };
    } catch (err) {
        console.error("Error creating new user:", err);
        return { success: false, status: 500, message: "Failed to create new user" };
    }
};

// Function to login user
const login = async (phone, password) => {
    try {
        // Check if phone number is registered
        const checkPhoneQuery = "SELECT * FROM user WHERE phone = ?";
        const result = await utilityService.sendQuery(checkPhoneQuery, [phone], "Failed to check phone number");

        if (result.length === 0) {
            // Use a generic error message to avoid revealing if phone is registered
            return { success: false, status: 401, message: "Invalid credentials" };
        }

        // Check if password is valid
        const user = result[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return { success: false, status: 401, message: "Invalid credentials" };
        }

        // Generate tokens
        const accessToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
        const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        return {
            success: true,
            status: 200,
            message: "User logged in successfully",
            accessToken,
            refreshToken
        };
    } catch (err) {
        console.error("Error logging in user:", err);
        return { success: false, status: 500, message: "Failed to login user" };
    }
};

// Function to refresh access token
const refreshAccessToken = async (refreshToken) => {
    try {
        if (!refreshToken) {
            return { success: false, status: 400, message: "Refresh token is required" };
        }

        // Verify the refresh token
        const decoded = await promisify(jwt.verify)(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        if (!decoded || !decoded.id) {
            return { success: false, status: 401, message: "Invalid refresh token" };
        }

        // Generate a new access token
        const accessToken = jwt.sign({ id: decoded.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

        return { success: true, status: 200, message: "Access token refreshed successfully", accessToken };

    } catch (err) {
        console.error("Error refreshing access token:", err);

        // Handle token expiration errors specifically
        if (err.name === "TokenExpiredError") {
            return { success: false, status: 401, message: "Refresh token expired" };
        }

        // Handle invalid token errors
        if (err.name === "JsonWebTokenError") {
            return { success: false, status: 401, message: "Invalid refresh token" };
        }

        return { success: false, status: 500, message: "Failed to refresh access token" };
    }
};

// Function for payment order creation
// Initialize Razorpay client with your key and secret
const razorpay = new Razorpay({
    key_id: 'rzp_test_hD75gZIHGX2XGb',
    key_secret: 'y0ZZRJJa2QUwe9c8w2VUqUeG'
});

const createPayment = async (amount) => {
    try {
        // Create the Razorpay order request
        const orderRequest = {
            amount: amount * 100,  // Razorpay expects amount in paise
            currency: 'INR',
            receipt: 'receipt#1'
        };

        const order = await razorpay.orders.create(orderRequest);
        console.log("Razorpay Order Created:", order);

        // Optionally, you can save order details to your database here
        // Example: await saveOrderToDatabase(order);

        return { success: true, status: 201, message: "Payment created successfully", order };
    } catch (err) {
        console.error("Error creating payment:", err);
        return { success: false, status: 500, message: "Failed to create payment", error: err.message };
    }
};

// Exporting the server functions
module.exports = {
    sendOTP,
    verifyOTP,
    createNewUser,
    login,
    refreshAccessToken,
    createPayment
}