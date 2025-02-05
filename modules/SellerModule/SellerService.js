/*
    File: modules/SellerModule/SellerService.js
    Author: Atharv Mirgal, Yash Balotiya
    Desc: This file contains the services for the Seller Module
    Created: 31-01-2025
    Last Modified: 05-02-2025
*/

// Importing the required modules
const db = require("../../configuration/db");
const { v4: uuidv4 } = require("uuid");
require('dotenv').config();
const bycrypt = require('bcrypt');
const { sendSMS } = require("../../configuration/sms");
const { sendEmail } = require("../../configuration/mailer");
const utilityService = require("../UtilityModule/UtilityService");
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Function to generate 6 digit OTP
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

// Function to send email OTP
const sendEmailOTP = async (email) => {
    try {
        // Query to check if email is already registered
        const checkEmailQuery = "SELECT * FROM seller WHERE email = ?";
        const result = await utilityService.sendQuery(checkEmailQuery, [email], "Failed to check email");

        // If email is already registered, throw an error
        if (result.length > 0) {
            return { success: false, message: "Email already registered" };
            // throw new Error("Email already registered");
        }

        // Query to insert email OTP
        const otp = generateOTP();
        const insertEmailQuery = "CALL UpsertSellerVerificationByEmail(?, ?, ?);";
        const id = uuidv4();

        await utilityService.sendQuery(insertEmailQuery, [id, email, otp], "Failed to insert email");

        // Sending email
        await sendEmail(email, "OTP for Email Verification", `Your OTP is ${otp}. Please do not share this with anyone.`);

        // Returning success message
        return { success: true, message: "OTP sent successfully" };
    } catch (err) {
        // Returning Error message
        console.error("Error sending email OTP:", err);
        return { success: false, message: "Failed to send email OTP" };
        // throw new Error("Failed to send email OTP");
    }
};

// Function to verify email OTP
const verifyEmailOTP = async (email, otp) => {
    try {
        // Query to check OTP
        const checkOTPQuery = "SELECT * FROM seller_verification WHERE email = ? AND emailOTP = ?";
        const result = await utilityService.sendQuery(checkOTPQuery, [email, otp], "Failed to check OTP");

        // 
        if (result.length === 0) {
            throw new Error("Invalid OTP");
        }

        // check for OTP expiry
        const currentTime = new Date();
        const otpTime = new Date(result[0].createdAt);
        const timeDiff = Math.abs(currentTime - otpTime);

        // Check if OTP is expired
        if (timeDiff > 15 * 60 * 1000) {
            throw new Error("OTP expired");
        }

        // Query to verify OTP
        const verifyOTPQuery = "UPDATE seller_verification SET emailVerified = 1 WHERE email = ?";
        await utilityService.sendQuery(verifyOTPQuery, [email], "Failed to verify OTP");

        // Returning success message
        return { success: true, message: "OTP verified successfully" };
    } catch (err) {
        // Returning error message
        console.error("Error verifying email OTP:", err);
        return { success: false, message: "Failed to verify email OTP" };
        // throw new Error("Failed to verify email OTP");
    }
};

// Function to send OTP
const sendOTP = async (email, phone) => {
    try {
        // Query to check if phone number is already registered
        const checkPhoneQuery = "SELECT * FROM seller WHERE phone = ?";
        const phoneNumber = '+91' + phone;
        const result = await utilityService.sendQuery(checkPhoneQuery, [phone], "Failed to check phone number");

        // If phone number is already registered, throw an error
        if (result.length > 0) {
            throw new Error("Phone number already registered");
        }

        // Query to check if email is verified
        const record = await utilityService.sendQuery("SELECT * FROM seller_verification WHERE email = ?", [email], "Failed to check email");

        // If email is not verified, throw an error
        if (record.length === 0) {
            return { success: false, message: "Email not verified" };
            // throw new Error("Email not verified");
        }

        // Insert phone number and OTP
        const id = record[0].id;
        const otp = generateOTP();
        const insertPhoneQuery = "CALL UpsertSellerVerificationByPhone(?, ?, ?);";

        await utilityService.sendQuery(insertPhoneQuery, [id, phone, otp], "Failed to insert phone number");

        // Sending SMS
        // await sendSMS(phoneNumber, `Your OTP is ${otp}. Please do not share this with anyone.`);

        // Returning success message
        return { success: true, message: "OTP sent successfully" };
    } catch (err) {
        // Returning error message
        console.error("Error sending OTP:", err);
        // throw new Error("Failed to send OTP");
        return { success: false, message: "Failed to send OTP" };
    }
}

// Function to verify OTP
const verifyOTP = async (phone, otp) => {
    try {
        // Query to check OTP
        const checkOTPQuery = "SELECT * FROM seller_verification WHERE phone = ? AND phoneOTP = ?";
        const result = await utilityService.sendQuery(checkOTPQuery, [phone, otp], "Failed to check OTP");

        // If OTP is invalid, throw an error
        if (result.length === 0) {
            return { success: false, message: "Invalid OTP" };
            // throw new Error("Invalid OTP");
        }

        // check for OTP expiry
        const currentTime = new Date();
        const otpTime = new Date(result[0].createdAt);
        const timeDiff = Math.abs(currentTime - otpTime);

        // Check if OTP is expired
        if (timeDiff > 15 * 60 * 1000) {
            throw new Error("OTP expired");
        }

        // Query to verify OTP
        const verifyOTPQuery = "UPDATE seller_verification SET phoneVerified = 1 WHERE phone = ?";
        await utilityService.sendQuery(verifyOTPQuery, [phone], "Failed to verify OTP");

        // Returning success message
        return { success: true, message: "OTP verified successfully" };
    } catch (err) {
        // Returning error message
        console.error("Error verifying OTP:", err);
        // throw new Error("Failed to verify OTP");
        return { success: false, message: "Failed to verify OTP" };
    }
};

// Function to create new user
const createNewUser = async (firstName, lastName, businessName, email, phone, gst, password) => {
    try {
        // Check if email, phone and GST are already registered
        const checkEmailQuery = "SELECT * FROM seller WHERE email = ?";
        const emailResult = await utilityService.sendQuery(checkEmailQuery, [email], "Failed to check email");

        // If email is already registered, throw an error
        if (emailResult.length > 0) {
            // throw new Error("Email already registered");
            return { success: false, message: "Email already registered" };
        }

        // Check if phone is already registered
        const checkPhoneQuery = "SELECT * FROM seller WHERE phone = ?";
        const phoneResult = await utilityService.sendQuery(checkPhoneQuery, [phone], "Failed to check phone number");

        // If phone is already registered, throw an error
        if (phoneResult.length > 0) {
            // throw new Error("Phone number already registered");
            return { success: false, message: "Phone number already registered" };
        }

        // Check if GST is already registered
        const checkGSTQuery = "SELECT * FROM seller WHERE gst = ?";
        const gstResult = await utilityService.sendQuery(checkGSTQuery, [gst], "Failed to check GST number");

        // If GST is already registered, throw an error
        if (gstResult.length > 0) {
            // throw new Error("GST number already registered");
            return { success: false, message: "GST number already registered" };
        }

        // Hashing the password
        const hashedPassword = await bycrypt.hash(password, 10);

        // Check if email and phone are verified
        const checkVerificationQuery = "SELECT * FROM seller_verification WHERE email = ? AND phone = ? AND emailVerified = 1 AND phoneVerified = 1";
        const verificationResult = await utilityService.sendQuery(checkVerificationQuery, [email, phone], "Failed to check verification");

        // If email or phone is not verified, throw an error
        if (verificationResult.length === 0) {
            // throw new Error("Email or phone not verified");
            return { success: false, message: "Email or phone not verified" };
        }

        // Inserting the new user
        const id = verificationResult[0].id;
        const insertUserQuery = "CALL InsertSeller(?, ?, ?, ?, ?, ?, ?, ?);";
        await utilityService.sendQuery(insertUserQuery, [id, firstName, lastName, businessName, phone, email, gst, hashedPassword], "Failed to create new seller");

        // Returning success message
        return { success: true, message: "Seller created successfully" };
    } catch (err) {
        // Returning error message
        console.error("Error creating new seller:", err);
        // throw new Error("Failed to create new seller");
        return { success: false, message: "Failed to create new seller" };
    }
}

// Function to login user
const login = async (email, password) => {
    try {
        // Check if email is registered
        const checkPhoneQuery = "SELECT * FROM seller WHERE email = ?";
        const result = await utilityService.sendQuery(checkPhoneQuery, [email], "Failed to check email");

        // If email is not registered, throw an error
        if (result.length === 0) {
            // throw new Error("Email not registered");
            return { success: false, message: "Email not registered" };
        }

        // Check if password is correct
        const user = result[0];
        const match = await bycrypt.compare(password, user.password);

        // If password is incorrect, throw an error
        if (!match) {
            // throw new Error("Invalid password");
            return { success: false, message: "Invalid password" };
        }

        // Generate access token and refresh token
        const accessToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

        const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        // Returning success message
        return { success: true, message: "User logged in successfully", accessToken, refreshToken };
    } catch (err) {
        // Returning error message
        console.error("Error logging in user:", err);
        // throw new Error("Failed to login user");
        return { success: false, message: "Failed to login user" };
    }
};

// Function to refresh access token
const refreshAccessToken = async (refreshToken) => {
    try {
        // Verify refresh token
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    reject(err);
                }
                resolve(decoded);
            });
        });

        // Generate new access token
        const accessToken = jwt.sign({ id: decoded.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

        // Returning success message
        return { success: true, message: "Access token refreshed successfully", accessToken };
    } catch (err) {
        // Returning error message
        console.error("Error refreshing access token:", err);
        // throw new Error("Failed to refresh access token");
        return { success: false, message: "Failed to refresh access token" };
    }
};

// Exporting the server functions
module.exports = {
    sendEmailOTP,
    verifyEmailOTP,
    sendOTP,
    verifyOTP,
    createNewUser,
    login,
    refreshAccessToken
}