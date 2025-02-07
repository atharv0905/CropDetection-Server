/*
    File: modules/ConsultantModule/ConsultantService.js
    Author: Atharv Mirgal, Yash Balotiya
    Desc: This file contains the services for the Consultant Module
    Created: 03-02-2025
    Last Modified: 07-02-2025
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
        const checkEmailQuery = "SELECT * FROM consultant WHERE email = ?";
        const result = await utilityService.sendQuery(checkEmailQuery, [email], "Failed to check email");

        if (result.length > 0) {
            return { success: false, status: 409, message: "Email already registered" };
        }

        // Generate OTP and insert into database
        const otp = generateOTP();
        const insertEmailQuery = "CALL UpsertConsultantVerificationByEmail(?, ?, ?);";
        const id = uuidv4();

        await utilityService.sendQuery(insertEmailQuery, [id, email, otp], "Failed to insert email verification data");

        // Send email OTP
        await sendEmail(email, "OTP for Email Verification", `Your OTP is ${otp}. Please do not share this with anyone.`);

        return { success: true, status: 200, message: "OTP sent successfully" };
    } catch (err) {
        console.error("Error sending email OTP:", err);
        return { success: false, status: 500, message: "Failed to send email OTP" };
    }
};

// Function to verify email OTP
const verifyEmailOTP = async (email, otp) => {
    try {
        // Check if OTP is valid
        const checkOTPQuery = "SELECT * FROM consultant_verification WHERE email = ? AND emailOTP = ?";
        const result = await utilityService.sendQuery(checkOTPQuery, [email, otp], "Failed to check OTP");

        if (result.length === 0) {
            return { success: false, status: 401, message: "Invalid OTP" };
        }

        // Check for OTP expiry
        const currentTime = new Date();
        const otpTime = new Date(result[0].createdAt);
        if ((currentTime - otpTime) > 15 * 60 * 1000) {
            return { success: false, status: 401, message: "OTP expired" };
        }

        // Update email verification status
        const verifyOTPQuery = "UPDATE consultant_verification SET emailVerified = 1 WHERE email = ?";
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
        const phoneNumber = `+91${phone}`;

        // Check if phone number is already registered
        const checkPhoneQuery = "SELECT * FROM consultant WHERE phone = ?";
        const result = await utilityService.sendQuery(checkPhoneQuery, [phone], "Failed to check phone number");

        if (result.length > 0) {
            return { success: false, status: 409, message: "Phone number already registered" };
        }

        // Check if email is verified
        const record = await utilityService.sendQuery("SELECT * FROM consultant_verification WHERE email = ?", [email], "Failed to check email verification");

        if (record.length === 0 || record[0].emailVerified !== 1) {
            return { success: false, status: 401, message: "Email not verified" };
        }

        // Generate OTP and insert into database
        const id = record[0].id;
        const otp = generateOTP();
        const insertPhoneQuery = "CALL UpsertConsultantVerificationByPhone(?, ?, ?);";

        await utilityService.sendQuery(insertPhoneQuery, [id, phone, otp], "Failed to insert phone verification data");
        await sendSMS(phoneNumber, `Your OTP is ${otp}. Please do not share this with anyone.`);

        return { success: true, status: 200, message: "OTP sent successfully" };
    } catch (err) {
        console.error("Error sending OTP:", err);
        return { success: false, status: 500, message: "Failed to send OTP" };
    }
}

// Function to verify OTP
const verifyOTP = async (phone, otp) => {
    try {
        // Check if OTP is valid
        const checkOTPQuery = "SELECT * FROM consultant_verification WHERE phone = ? AND phoneOTP = ?";
        const result = await utilityService.sendQuery(checkOTPQuery, [phone, otp], "Failed to check OTP");

        if (result.length === 0) {
            return { success: false, status: 401, message: "Invalid OTP" };
        }

        // Check for OTP expiry
        const currentTime = new Date();
        const otpTime = new Date(result[0].createdAt);
        if ((currentTime - otpTime) > 15 * 60 * 1000) {
            return { success: false, status: 401, message: "OTP expired" };
        }

        // Update phone verification status
        const verifyOTPQuery = "UPDATE consultant_verification SET phoneVerified = 1 WHERE phone = ?";
        await utilityService.sendQuery(verifyOTPQuery, [phone], "Failed to verify OTP");

        return { success: true, status: 200, message: "OTP verified successfully" };
    } catch (err) {
        console.error("Error verifying OTP:", err);
        return { success: false, status: 500, message: "Failed to verify OTP" };
    }
};

// Function to create new user
const createNewUser = async (id, firstName, lastName, expertise, experience, startingCharges, email, phone, profile, password) => {
    try {
        // Check if email is already registered
        const checkEmailQuery = "SELECT * FROM consultant WHERE email = ?";
        const result = await utilityService.sendQuery(checkEmailQuery, [email], "Failed to check email");

        if (result.length > 0) {
            return { success: false, status: 409, message: "Email already registered" };
        }

        // Check if phone number is already registered
        const checkPhoneQuery = "SELECT * FROM consultant WHERE phone = ?";
        const phoneResult = await utilityService.sendQuery(checkPhoneQuery, [phone], "Failed to check phone number");

        if (phoneResult.length > 0) {
            return { success: false, status: 409, message: "Phone number already registered" };
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert user details into database
        const insertUserQuery = "CALL InsertConsultant(?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
        await utilityService.sendQuery(insertUserQuery, [id, firstName, lastName, expertise, experience, startingCharges, phone, email, hashedPassword, profile], "Failed to insert user data");

        return { success: true, status: 201, message: "Consultant created successfully" };
    } catch (err) {
        console.error("Error creating new consultant:", err);
        return { success: false, status: 500, message: "Failed to create new consultant" };
    }
}

// Function to update user details
const updateUser = async (token, firstName, lastName, expertise, experience, startingCharges, profile) => {
    try {
        // Decode token to get user ID
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const id = decoded.id;

        // Update user details in the database
        const updateUserQuery = "UPDATE consultant SET first_name = ?, last_name = ?, expertise = ?, experience = ?, starting_charges = ?, profile = ? WHERE id = ?";
        await utilityService.sendQuery(updateUserQuery, [firstName, lastName, expertise, experience, startingCharges, profile, id], "Failed to update user");

        return { success: true, status: 200, message: "Consultant updated successfully" };
    } catch (err) {
        console.error("Error updating consultant:", err);
        return { success: false, status: 500, message: "Failed to update consultant" };
    }
}

// Function to login user
const login = async (email, password) => {
    try {
        // Check if email is registered
        const checkUserQuery = "SELECT * FROM consultant WHERE email = ?";
        const result = await utilityService.sendQuery(checkUserQuery, [email], "Failed to check email");

        if (result.length === 0) {
            return { success: false, status: 404, message: "Email not registered" };
        }

        // Validate password
        const user = result[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return { success: false, status: 401, message: "Invalid password" };
        }

        // Generate access token & refresh token
        const accessToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        return { success: true, status: 200, message: "User logged in successfully", accessToken, refreshToken };
    } catch (err) {
        console.error("Error logging in user:", err);
        return { success: false, status: 500, message: "Failed to login user" };
    }
};

// Function to refresh access token
const refreshAccessToken = async (refreshToken) => {
    try {
        // verify refresh token
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    reject(err);
                }
                resolve(decoded);
            });
        });

        // generate new access token
        const accessToken = jwt.sign({ id: decoded.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

        // return success message
        return { success: true, status: 200, message: "Access token refreshed successfully", accessToken };
    } catch (err) {
        console.error("Error refreshing access token:", err);
        return { success: false, status: 403, message: "Failed to refresh access token" };
    }
};

// Book an appointment
const bookAppointment = async (consultantId, userId, mode, date, start_time, end_time) => {
    try {
        // Check for appointment clashes
        const checkAppointmentQuery = `
            SELECT * FROM appointment 
            WHERE consultant_id = ? AND date = ? 
            AND ((start_time >= ? AND start_time < ?) OR (end_time > ? AND end_time <= ?))
        `;
        const result = await utilityService.sendQuery(checkAppointmentQuery, [consultantId, date, start_time, end_time, start_time, end_time], "Failed to check appointment");

        if (result.length > 0) {
            return { success: false, status: 409, message: "Appointment clash, please select a different time slot" };
        }

        // Insert appointment into database
        const insertAppointmentQuery = "INSERT INTO appointment (id, consultant_id, user_id, mode, date, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?)";
        await utilityService.sendQuery(insertAppointmentQuery, [uuidv4(), consultantId, userId, mode, date, start_time, end_time], "Failed to book appointment");

        return { success: true, status: 201, message: "Appointment booked successfully" };
    } catch (err) {
        console.error("Error booking appointment:", err);
        return { success: false, status: 500, message: "Failed to book appointment" };
    }
}

// Change status of appointment
const changeAppointmentStatus = async (appointmentId, status) => {
    try {
        // Check if appointment exists
        const checkAppointmentQuery = "SELECT * FROM appointment WHERE id = ?";
        const appointment = await utilityService.sendQuery(checkAppointmentQuery, [appointmentId], "Failed to check appointment");

        if (appointment.length === 0) {
            return { success: false, status: 404, message: "Appointment not found" };
        }

        // Update appointment status
        const updateAppointmentQuery = "UPDATE appointment SET status = ? WHERE id = ?";
        await utilityService.sendQuery(updateAppointmentQuery, [status, appointmentId], "Failed to update appointment status");

        return { success: true, status: 200, message: "Appointment status updated successfully" };
    } catch (err) {
        console.error("Error updating appointment status:", err);
        return { success: false, status: 500, message: "Failed to update appointment status" };
    }
}

// Get appointment details for user
const getAppointmentDetails = async (userId) => {
    try {
        // Query to get appointment details
        const getAppointmentQuery = "SELECT * FROM appointment WHERE user_id = ?";
        const result = await utilityService.sendQuery(getAppointmentQuery, [userId], "Failed to get appointment details");

        if (result.length === 0) {
            return { success: false, status: 404, message: "No appointments found for this user" };
        }

        return { success: true, status: 200, message: "Appointment details fetched successfully", appointments: result };
    } catch (err) {
        console.error("Error getting appointment details:", err);
        return { success: false, status: 500, message: "Failed to get appointment details" };
    }
}

// Get appointment details for consultant
const getConsultantAppointmentDetails = async (consultantId) => {
    try {
        // Query to get appointment details
        const getAppointmentQuery = "SELECT * FROM appointment WHERE consultant_id = ?";
        const result = await utilityService.sendQuery(getAppointmentQuery, [consultantId], "Failed to get appointment details");

        if (result.length === 0) {
            return { success: false, status: 404, message: "No appointments found for this consultant" };
        }

        return { success: true, status: 200, message: "Appointment details fetched successfully", appointments: result };
    } catch (err) {
        console.error("Error getting appointment details:", err);
        return { success: false, status: 500, message: "Failed to get appointment details" };
    }
}

// Function to get booked time slots for a consultant
const getBookedTimeSlots = async (consultantId, date) => {
    try {
        const getBookedTimeSlotsQuery = "SELECT start_time, end_time FROM appointment WHERE consultant_id = ? AND date = ?";
        const result = await utilityService.sendQuery(getBookedTimeSlotsQuery, [consultantId, date], "Failed to get booked time slots");

        if (result.length === 0) {
            return { success: false, status: 404, message: "No booked time slots for this consultant on the selected date" };
        }

        return { success: true, status: 200, message: "Booked time slots fetched successfully", timeSlots: result };
    } catch (err) {
        console.error("Error getting booked time slots:", err);
        return { success: false, status: 500, message: "Failed to get booked time slots" };
    }
}

// Function to get consultants list
const getConsultantsList = async () => {
    try {
        const getConsultantsQuery = "SELECT * FROM consultant";
        const result = await utilityService.sendQuery(getConsultantsQuery, [], "Failed to get consultants list");

        if (result.length === 0) {
            return { success: false, status: 404, message: "No consultants found" };
        }

        const consultants = result.map((consultant) => ({
            id: consultant.id,
            firstName: consultant.first_name,
            lastName: consultant.last_name,
            expertise: consultant.expertise,
            experience: consultant.experience,
            startingCharges: consultant.starting_charges,
            profile: process.env.BASE_URL + "/consultantImgs/" + consultant.profile
        }));

        return { success: true, status: 200, message: "Consultants list fetched successfully", consultants };
    } catch (err) {
        console.error("Error getting consultants list:", err);
        return { success: false, status: 500, message: "Failed to get consultants list" };
    }
}

// Function to fetch consultant data by id
const getConsultantById = async (id) => {
    try {
        const getConsultantQuery = "SELECT * FROM consultant WHERE id = ?";
        const result = await utilityService.sendQuery(getConsultantQuery, [id], "Failed to get consultant data");

        if (result.length === 0) {
            return { success: false, status: 404, message: "Consultant not found" };
        }

        const data = {
            id: result[0].id,
            firstName: result[0].first_name,
            lastName: result[0].last_name,
            expertise: result[0].expertise,
            experience: result[0].experience,
            startingCharges: result[0].starting_charges,
            profile: process.env.BASE_URL + "/consultantImgs/" + result[0].profile
        };

        return { success: true, status: 200, message: "Consultant data fetched successfully", consultant: data };
    } catch (err) {
        console.error("Error getting consultant data:", err);
        return { success: false, status: 500, message: "Failed to get consultant data" };
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
    getConsultantAppointmentDetails,
    getBookedTimeSlots,
    getConsultantsList,
    getConsultantById
}