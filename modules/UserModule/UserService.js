/**
 * File: modules/UserModule/UserServer.js
 * Author: Yash Balotiya, Atharv Mirgal
 * Description: This file is used to handle the server-side logic of the user module.
 * Created on: 27/01/2025
 * Last Modified: 29/01/2025
*/

// Importing the required modules
const db = require("../../configuration/db");
const { v4: uuidv4 } = require("uuid");
require('dotenv').config();
const bycrypt = require('bcrypt');
const { sendSMS } = require("../../configuration/sms");
const utilityService = require("../UtilityModule/UtilityService");
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Function to generate 6 digit OTP
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

// Function to send OTP
const sendOTP = async(phone) => {
    try{
        const checkPhoneQuery = "SELECT * FROM user WHERE phone = ?";
        const phoneNumber = '+91' + phone;
        const result = await utilityService.sendQuery(checkPhoneQuery, [phone], "Failed to check phone number");
        if(result.length > 0){
            throw new Error("Phone number already registered");
        }

        const otp = generateOTP();
        const insertPhoneQuery = "CALL UpsertUserVerification(?, ?, ?);";
        const id = uuidv4();

        await utilityService.sendQuery(insertPhoneQuery, [id, phone, otp], "Failed to insert phone number");

        // await sendSMS(phoneNumber, `Your OTP is ${otp}. Please do not share this with anyone.`);

        return { success: true, message: "OTP sent successfully" };
    }catch(err){
        console.error("Error sending OTP:", err);
        throw new Error("Failed to send OTP");
    }
}

// Function to verify OTP
const verifyOTP = async(phone, otp) => {
    try{
        const checkOTPQuery = "SELECT * FROM user_verification WHERE phone = ? AND phoneOTP = ?";
        const result = await utilityService.sendQuery(checkOTPQuery, [phone, otp], "Failed to check OTP");
        if(result.length === 0){
            throw new Error("Invalid OTP");
        }

        // check for OTP expiry
        const currentTime = new Date();
        const otpTime = new Date(result[0].createdAt);
        const timeDiff = Math.abs(currentTime - otpTime);

        if(timeDiff > 15 * 60 * 1000){
            throw new Error("OTP expired");
        }
        
        const verifyOTPQuery = "UPDATE user_verification SET phoneVerified = 1 WHERE phone = ?";
        await utilityService.sendQuery(verifyOTPQuery, [phone], "Failed to verify OTP");

        return { success: true, message: "OTP verified successfully" };
    }catch(err){
        console.error("Error verifying OTP:", err);
        throw new Error("Failed to verify OTP");
    }
};

// Function to create new user
const createNewUser = async(firstName, lastName, phone, password) => {
    try{
        const checkPhoneQuery = "SELECT * FROM user WHERE phone = ?";
        const phoneNumber = '+91' + phone;
        const result = await utilityService.sendQuery(checkPhoneQuery, [phone], "Failed to check phone number");
        if(result.length > 0){
            throw new Error("Phone number already registered");
        }

        const insertUserQuery = "INSERT INTO user (id, first_name, last_name, phone, password) VALUES (?, ?, ?, ?, ?)";
        const id = uuidv4();
        password = await bycrypt.hash(password, 12);

        await utilityService.sendQuery(insertUserQuery, [id, firstName, lastName, phone, password], "Failed to insert user");

        return { success: true, message: "User created successfully" };
    }catch(err){
        console.error("Error creating new user:", err);
        throw new Error("Failed to create new user");
    }
}

// Function to login user
const login = async(phone, password) => {
    try{
        const checkPhoneQuery = "SELECT * FROM user WHERE phone = ?";
        const result = await utilityService.sendQuery(checkPhoneQuery, [phone], "Failed to check phone number");
        if(result.length === 0){
            throw new Error("Phone number not registered");
        }

        const user = result[0];
        const match = await bycrypt.compare(password, user.password);
        if(!match){
            throw new Error("Invalid password");
        }

        const accessToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

        const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        return { success: true, message: "User logged in successfully", accessToken, refreshToken };
    }catch(err){
        console.error("Error logging in user:", err);
        throw new Error("Failed to login user");
    }
};

// Function to refresh access token
const refreshAccessToken = async(refreshToken) => {
    try{

        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
                if(err){
                    reject(err);
                }
                resolve(decoded);
            });
        });

        const accessToken = jwt.sign({ id: decoded.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

        return { success: true, message: "Access token refreshed successfully", accessToken };
    }catch(err){
        console.error("Error refreshing access token:", err);
        throw new Error("Failed to refresh access token");
    }
};

// Exporting the server functions
module.exports = {
    sendOTP,
    verifyOTP,
    createNewUser,
    login,
    refreshAccessToken
}