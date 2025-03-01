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
const bcrypt = require('bcrypt');
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
        // Check if email is already registered
        const checkEmailQuery = "SELECT * FROM seller WHERE email = ?";
        const result = await utilityService.sendQuery(checkEmailQuery, [email], "Failed to check email");

        if (result.length > 0) {
            return { success: false, status: 409, message: "Email already registered" };
        }

        // Generate OTP
        const otp = generateOTP();
        const id = uuidv4();
        const insertEmailQuery = "CALL UpsertSellerVerificationByEmail(?, ?, ?);";

        // Insert OTP into the database
        const insertResult = await utilityService.sendQuery(insertEmailQuery, [id, email, otp], "Failed to insert email OTP");
        
        if (!insertResult) {
            return { success: false, status: 500, message: "Failed to store OTP" };
        }

        // Send OTP via email
        const emailSent = await sendEmail(email, "OTP for Email Verification", `Your OTP is ${otp}. Please do not share this with anyone.`);
        
        if (!emailSent) {
            return { success: false, status: 500, message: "Failed to send email" };
        }

        return { success: true, status: 200, message: "OTP sent successfully" };
    } catch (err) {
        console.error("Error sending email OTP:", err);
        return { success: false, status: 500, message: "Failed to send email OTP" };
    }
};

// Function to verify email OTP
const verifyEmailOTP = async (email, otp) => {
    try {
        // Check if OTP exists
        const checkOTPQuery = "SELECT * FROM seller_verification WHERE email = ? AND emailOTP = ?";
        const result = await utilityService.sendQuery(checkOTPQuery, [email, otp], "Failed to check OTP");

        if (result.length === 0) {
            return { success: false, status: 401, message: "Invalid OTP" };
        }

        // Check for OTP expiry (15 minutes)
        const currentTime = new Date();
        const otpTime = new Date(result[0].createdAt);
        const timeDiff = Math.abs(currentTime - otpTime);

        if (timeDiff > 15 * 60 * 1000) {
            return { success: false, status: 400, message: "OTP expired" };
        }

        // Mark OTP as verified
        const verifyOTPQuery = "UPDATE seller_verification SET emailVerified = 1 WHERE email = ?";
        await utilityService.sendQuery(verifyOTPQuery, [email], "Failed to verify OTP");

        return { success: true, status: 200, message: "OTP verified successfully" };
    } catch (err) {
        console.error("Error verifying email OTP:", err);
        return { success: false, status: 500, message: "Failed to verify email OTP" };
    }
};

// Function to send OTP
const sendOTP = async (email, phone) => {
    try {
        // Check if email is verified
        const record = await utilityService.sendQuery(
            "SELECT * FROM seller_verification WHERE email = ?",
            [email],
            "Failed to check email"
        );

        if (record.length === 0) {
            return { success: false, status: 400, message: "Email not verified" };
        }

        // Check if phone number is already registered
        const checkPhoneQuery = "SELECT * FROM seller WHERE phone = ?";
        const phoneNumber = "+91" + phone;
        const result = await utilityService.sendQuery(checkPhoneQuery, [phone], "Failed to check phone number");

        if (result.length > 0) {
            return { success: false, status: 409, message: "Phone number already registered" };
        }

        // Generate OTP and insert into database
        const id = record[0].id;
        const otp = generateOTP();
        const insertPhoneQuery = "CALL UpsertSellerVerificationByPhone(?, ?, ?);";
        const insertResult = await utilityService.sendQuery(insertPhoneQuery, [id, phone, otp], "Failed to insert phone number");

        if (!insertResult) {
            return { success: false, status: 500, message: "Failed to store OTP" };
        }

        // Send OTP via SMS
        // const smsSent = await sendSMS(phoneNumber, `Your OTP is ${otp}. Please do not share this with anyone.`);

        if (!smsSent) {
            return { success: false, status: 500, message: "Failed to send OTP via SMS" };
        }

        return { success: true, status: 200, message: "OTP sent successfully" };
    } catch (err) {
        console.error("Error sending OTP:", err);
        return { success: false, status: 500, message: "Failed to send OTP" };
    }
};

// Function to verify OTP
const verifyOTP = async (phone, otp) => {
    try {
        // Query to check OTP
        const checkOTPQuery = "SELECT * FROM seller_verification WHERE phone = ? AND phoneOTP = ?";
        const result = await utilityService.sendQuery(checkOTPQuery, [phone, otp], "Failed to check OTP");

        // If OTP is invalid
        if (result.length === 0) {
            return { success: false, status: 400, message: "Invalid OTP" };
        }

        // Check for OTP expiry
        const currentTime = new Date();
        const otpTime = new Date(result[0].createdAt);
        const timeDiff = Math.abs(currentTime - otpTime);

        if (timeDiff > 15 * 60 * 1000) {
            return { success: false, status: 401, message: "OTP expired" };
        }

        // Query to verify OTP
        const verifyOTPQuery = "UPDATE seller_verification SET phoneVerified = 1 WHERE phone = ?";
        const updateResult = await utilityService.sendQuery(verifyOTPQuery, [phone], "Failed to verify OTP");

        if (!updateResult) {
            return { success: false, status: 500, message: "Failed to update OTP verification status" };
        }

        return { success: true, status: 200, message: "OTP verified successfully" };
    } catch (err) {
        console.error("Error verifying OTP:", err);
        return { success: false, status: 500, message: "Failed to verify OTP" };
    }
};

// Function to create new user
const createNewUser = async (firstName, lastName, businessName, email, phone, gst, password) => {
    try {
        // Check if email, phone, or GST is already registered in a single query
        const checkExistenceQuery = "SELECT email, phone, gst FROM seller WHERE email = ? OR phone = ? OR gst = ?";
        const existingRecords = await utilityService.sendQuery(checkExistenceQuery, [email, phone, gst], "Failed to check seller registration details");

        if (existingRecords.length > 0) {
            let conflictField;
            if (existingRecords.some((row) => row.email === email)) conflictField = "Email";
            else if (existingRecords.some((row) => row.phone === phone)) conflictField = "Phone number";
            else if (existingRecords.some((row) => row.gst === gst)) conflictField = "GST number";

            return { success: false, status: 400, message: `${conflictField} already registered` };
        }

        // Check if email and phone are verified
        const checkVerificationQuery = "SELECT * FROM seller_verification WHERE email = ? AND phone = ? AND emailVerified = 1 AND phoneVerified = 1";
        const verificationResult = await utilityService.sendQuery(checkVerificationQuery, [email, phone], "Failed to check verification");

        if (verificationResult.length === 0) {
            return { success: false, status: 400, message: "Email or phone not verified" };
        }

        // Hashing the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert the new seller
        const id = verificationResult[0].id;
        const insertUserQuery = "CALL InsertSeller(?, ?, ?, ?, ?, ?, ?, ?);";
        await utilityService.sendQuery(insertUserQuery, [id, firstName, lastName, businessName, phone, email, gst, hashedPassword], "Failed to create new seller");

        return { success: true, status: 201, message: "Seller created successfully" };
    } catch (err) {
        console.error("Error creating new seller:", err);
        return { success: false, status: 500, message: "Failed to create new seller" };
    }
};

// Function to login user
const login = async (email, password) => {
    try {
        // Check if email is registered
        const checkEmailQuery = "SELECT id, first_name, last_name, business_name, email, phone, password FROM seller WHERE email = ?";
        const result = await utilityService.sendQuery(checkEmailQuery, [email], "Failed to check email");

        if (result.length === 0) {
            return { success: false, status: 400, message: "Email not registered" };
        }

        const user = result[0];

        // Ensure email and phone are verified before allowing login
        const checkVerificationQuery = "SELECT emailVerified, phoneVerified FROM seller_verification WHERE email = ? AND phone = ?";
        const verification = await utilityService.sendQuery(checkVerificationQuery, [user.email, user.phone], "Failed to check verification");

        // if (verification.length === 0 || !verification[0].emailVerified || !verification[0].phoneVerified) {
        //     return { success: false, status: 401, message: "Email or phone not verified" };
        // }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return { success: false, status: 400, message: "Invalid password" };
        }

        // Generate JWT tokens
        const accessToken = jwt.sign(
            { id: user.id, email: user.email, businessName: user.businessName },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1d" }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        );

        return { success: true, status: 200, message: "User logged in successfully", accessToken, refreshToken };
    } catch (err) {
        console.error("Error logging in user:", err);
        return { success: false, status: 500, message: "Failed to login user" };
    }
};

// Function to refresh access token
const refreshAccessToken = async (refreshToken) => {
    try {
        // Ensure refresh token is provided
        if (!refreshToken) {
            return { success: false, status: 400, message: "Refresh token is required" };
        }

        // Verify the refresh token
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    reject(err);
                }
                resolve(decoded);
            });
        });

        // Check if user still exists
        const checkUserQuery = "SELECT id, email, businessName FROM seller WHERE id = ?";
        const userResult = await utilityService.sendQuery(checkUserQuery, [decoded.id], "Failed to check user");

        if (userResult.length === 0) {
            return { success: false, status: 401, message: "User not found or deleted" };
        }

        const user = userResult[0];

        // Generate a new access token
        const accessToken = jwt.sign(
            { id: user.id, email: user.email, businessName: user.businessName },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1h" }
        );

        return { success: true, status: 200, message: "Access token refreshed successfully", accessToken };
    } catch (err) {
        console.error("Error refreshing access token:", err);
        return { success: false, status: 500, message: "Failed to refresh access token" };
    }
};

// Function to fetch details from user_order_summary view 
const fetchOrderSummary = async (seller_id) => {
    try {
        if(!seller_id) {
            return { success: false, status: 400, message: "Seller ID is required" };
        }
        const query = "SELECT * FROM user_order_summary WHERE seller_id = ?;";
        const orderSummary = await utilityService.sendQuery(query, [seller_id]);
        return { success: true, status: 200, data: orderSummary };
    } catch (err) {
        return { success: false, message: err.message };
    }
};

const fetchProducts = async (seller_id) => {
    try {
        const query = "SELECT * FROM product WHERE seller_id = ?;";
        const products = await utilityService.sendQuery(query, [seller_id]);
        products.forEach(product => {
            product.image = process.env.BASE_URL +"/prodImg/"+ product.image;
        });
        return { success: true, data: products, message: "Products fetched successfully", status: 200 };
    } catch (err) {
        return { success: false, message: err.message, status: 500 };
    }
}

// Exporting the server functions
module.exports = {
    sendEmailOTP,
    verifyEmailOTP,
    sendOTP,
    verifyOTP,
    createNewUser,
    login,
    refreshAccessToken,
    fetchOrderSummary,
    fetchProducts
}