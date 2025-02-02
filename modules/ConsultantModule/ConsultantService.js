/*
    File: modules/ConsultantModule/ConsultantService.js
    Author: Atharv Mirgal
    Desc: This file contains the services for the Consultant Module
    Created: 03-02-2025
    Last Modified: 03-02-2025
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
        const checkEmailQuery = "SELECT * FROM consultant WHERE email = ?";
        const result = await utilityService.sendQuery(checkEmailQuery, [email], "Failed to check email");
        if (result.length > 0) {
            throw new Error("Email already registered");
        }

        const otp = generateOTP();
        const insertEmailQuery = "CALL UpsertConsultantVerificationByEmail(?, ?, ?);";
        const id = uuidv4();

        await utilityService.sendQuery(insertEmailQuery, [id, email, otp], "Failed to insert email");

        await sendEmail(email, "OTP for Email Verification", `Your OTP is ${otp}. Please do not share this with anyone.`);

        return { success: true, message: "OTP sent successfully" };
    } catch (err) {
        console.error("Error sending email OTP:", err);
        throw new Error("Failed to send email OTP");
    }
};

// Function to verify email OTP
const verifyEmailOTP = async (email, otp) => {
    try {
        const checkOTPQuery = "SELECT * FROM consultant_verification WHERE email = ? AND emailOTP = ?";
        const result = await utilityService.sendQuery(checkOTPQuery, [email, otp], "Failed to check OTP");
        if (result.length === 0) {
            throw new Error("Invalid OTP");
        }

        // check for OTP expiry
        const currentTime = new Date();
        const otpTime = new Date(result[0].createdAt);
        const timeDiff = Math.abs(currentTime - otpTime);

        if (timeDiff > 15 * 60 * 1000) {
            throw new Error("OTP expired");
        }

        const verifyOTPQuery = "UPDATE consultant_verification SET emailVerified = 1 WHERE email = ?";
        await utilityService.sendQuery(verifyOTPQuery, [email], "Failed to verify OTP");

        return { success: true, message: "OTP verified successfully" };
    } catch (err) {
        console.error("Error verifying email OTP:", err);
        throw new Error("Failed to verify email OTP");
    }
};

// Function to send OTP
const sendOTP = async (email, phone) => {
    try {
        const checkPhoneQuery = "SELECT * FROM consultant WHERE phone = ?";
        const phoneNumber = '+91' + phone;
        const result = await utilityService.sendQuery(checkPhoneQuery, [phone], "Failed to check phone number");
        if (result.length > 0) {
            throw new Error("Phone number already registered");
        }

        const record = await utilityService.sendQuery("SELECT * FROM consultant_verification WHERE email = ?", [email], "Failed to check email");

        if (record.length === 0) {
            throw new Error("Email not verified");
        }

        const id = record[0].id;
        console.log(id);

        const otp = generateOTP();
        const insertPhoneQuery = "CALL UpsertConsultantVerificationByPhone(?, ?, ?);";

        await utilityService.sendQuery(insertPhoneQuery, [id, phone, otp], "Failed to insert phone number");

        // await sendSMS(phoneNumber, `Your OTP is ${otp}. Please do not share this with anyone.`);

        return { success: true, message: "OTP sent successfully" };
    } catch (err) {
        console.error("Error sending OTP:", err);
        throw new Error("Failed to send OTP");
    }
}

// Function to verify OTP
const verifyOTP = async (phone, otp) => {
    try {
        const checkOTPQuery = "SELECT * FROM consultant_verification WHERE phone = ? AND phoneOTP = ?";
        const result = await utilityService.sendQuery(checkOTPQuery, [phone, otp], "Failed to check OTP");
        if (result.length === 0) {
            throw new Error("Invalid OTP");
        }

        // check for OTP expiry
        const currentTime = new Date();
        const otpTime = new Date(result[0].createdAt);
        const timeDiff = Math.abs(currentTime - otpTime);

        if (timeDiff > 15 * 60 * 1000) {
            throw new Error("OTP expired");
        }

        const verifyOTPQuery = "UPDATE consultant_verification SET phoneVerified = 1 WHERE phone = ?";
        await utilityService.sendQuery(verifyOTPQuery, [phone], "Failed to verify OTP");

        return { success: true, message: "OTP verified successfully" };
    } catch (err) {
        console.error("Error verifying OTP:", err);
        throw new Error("Failed to verify OTP");
    }
};

// Function to create new user
const createNewUser = async (id, firstName, lastName, expertise, experience, startingCharges, email, phone, profile, password) => {
    try {
        const checkEmailQuery = "SELECT * FROM consultant WHERE email = ?";
        const result = await utilityService.sendQuery(checkEmailQuery, [email], "Failed to check email");
        if (result.length > 0) {
            throw new Error("Email already registered");
        }

        const checkPhoneQuery = "SELECT * FROM consultant WHERE phone = ?";
        const phoneResult = await utilityService.sendQuery(checkPhoneQuery, [phone], "Failed to check phone number");
        if (phoneResult.length > 0) {
            throw new Error("Phone number already registered");
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const insertUserQuery = "CALL InsertConsultant(?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";

        await utilityService.sendQuery(insertUserQuery, [id, firstName, lastName, expertise, experience, startingCharges, phone, email, hashedPassword, profile], "Failed to insert user");

        return { success: true, message: "Consultant created successfully" };
    } catch (err) {
        console.error("Error creating new consultant:", err);
        throw new Error("Failed to create new consultant");
    }
}

// Function to update user details
const updateUser = async (token, firstName, lastName, expertise, experience, startingCharges, profile) => {
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const id = decoded.id;

        const updateUserQuery = "UPDATE consultant SET first_name = ?, last_name = ?, expertise = ?, experience = ?, starting_charges = ?, profile = ? WHERE id = ?";

        await utilityService.sendQuery(updateUserQuery, [firstName, lastName, expertise, experience, startingCharges, profile, id], "Failed to update user");

        return { success: true, message: "Consultant updated successfully" };
    } catch (err) {
        console.error("Error updating consultant:", err);
        throw new Error("Failed to update consultant");
    }
}

// Function to login user
const login = async (email, password) => {
    try {
        const checkPhoneQuery = "SELECT * FROM consultant WHERE email = ?";
        const result = await utilityService.sendQuery(checkPhoneQuery, [email], "Failed to check email");
        if (result.length === 0) {
            throw new Error("Email not registered");
        }

        const user = result[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            throw new Error("Invalid password");
        }

        const accessToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

        const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        return { success: true, message: "User logged in successfully", accessToken, refreshToken };
    } catch (err) {
        console.error("Error logging in user:", err);
        throw new Error("Failed to login user");
    }
};

// Function to refresh access token
const refreshAccessToken = async (refreshToken) => {
    try {

        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    reject(err);
                }
                resolve(decoded);
            });
        });

        const accessToken = jwt.sign({ id: decoded.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

        return { success: true, message: "Access token refreshed successfully", accessToken };
    } catch (err) {
        console.error("Error refreshing access token:", err);
        throw new Error("Failed to refresh access token");
    }
};

// Book an appointment
const bookAppointment = async (consultantId, userId, mode, date, start_time, end_time) => {
    try {
        // write query to check if the current appointment is clashing with any other appointment
        const checkAppointmentQuery = "SELECT * FROM appointment WHERE consultant_id = ? AND date = ? AND ((start_time >= ? AND start_time < ?) OR (end_time > ? AND end_time <= ?))";

        const result = await utilityService.sendQuery(checkAppointmentQuery, [consultantId, date, start_time, end_time, start_time, end_time], "Failed to check appointment");

        if (result.length > 0) {
            throw new Error("Appointment clash");
        }

        const insertAppointmentQuery = "INSERT INTO appointment (id, consultant_id, user_id, mode, date, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?)";
        await utilityService.sendQuery(insertAppointmentQuery, [uuidv4(), consultantId, userId, mode, date, start_time, end_time], "Failed to book appointment");

        return { success: true, message: "Appointment booked successfully" };
    } catch (err) {
        console.error("Error booking appointment:", err);
        throw new Error("Failed to book appointment");
    }
}

// Change status of appointment
const changeAppointmentStatus = async (appointmentId, status) => {
    try {
        const updateAppointmentQuery = "UPDATE appointment SET status = ? WHERE id = ?";
        await utilityService.sendQuery(updateAppointmentQuery, [status, appointmentId], "Failed to update appointment status");

        return { success: true, message: "Appointment status updated successfully" };
    } catch (err) {
        console.error("Error updating appointment status:", err);
        throw new Error("Failed to update appointment status");
    }
}

// Get appointment details for user
const getAppointmentDetails = async (userId) => {
    try {
        const getAppointmentQuery = "SELECT * FROM appointment WHERE user_id = ?";
        const result = await utilityService.sendQuery(getAppointmentQuery, [userId], "Failed to get appointment details");

        return { success: true, message: "Appointment details fetched successfully", appointments: result };
    } catch (err) {
        console.error("Error getting appointment details:", err);
        throw new Error("Failed to get appointment details");
    }
}

// Get appointment details for consultant
const getConsultantAppointmentDetails = async (consultantId) => {
    try {
        const getAppointmentQuery = "SELECT * FROM appointment WHERE consultant_id = ?";
        const result = await utilityService.sendQuery(getAppointmentQuery, [consultantId], "Failed to get appointment details");

        return { success: true, message: "Appointment details fetched successfully", appointments: result };
    } catch (err) {
        console.error("Error getting appointment details:", err);
        throw new Error("Failed to get appointment details");
    }
}

// Exporting the server functions
module.exports = {
    sendEmailOTP,
    verifyEmailOTP,
    sendOTP,
    verifyOTP,
    createNewUser,
    updateUser,
    login,
    refreshAccessToken,
    bookAppointment,
    changeAppointmentStatus,
    getAppointmentDetails,
    getConsultantAppointmentDetails
}