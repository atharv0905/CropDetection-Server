/*
    File: modules/ConsultantModule/ConsultantController.js
    Author: Atharv Mirgal, Yash Balotiya
    Desc: This file contains the controllers for the Consultant Module
    Created: 03-02-2025
    Last Modified: 07-02-2025
*/

// Importing the required modules
const consultantService = require("./ConsultantService");
const jwt = require('jsonwebtoken');

// Function to handle the request to send email OTP
const handleSendEmailOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, status: 400, message: "Invalid request: Email is required" });
        }

        const result = await consultantService.sendEmailOTP(email);
        return res.status(result.status).json(result);

    } catch (error) {
        console.error("Unexpected error in sendEmailOTPHandler:", error);
        return res.status(500).json({ success: false, status: 500, message: "Unexpected error occurred while sending email OTP" });
    }
};

// Function to handle the request to verify email OTP
const handleVerifyEmailOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, status: 400, message: "Invalid request: Email and OTP are required" });
        }

        const result = await consultantService.verifyEmailOTP(email, otp);
        return res.status(result.status).json(result);

    } catch (error) {
        console.error("Unexpected error in verifyEmailOTPHandler:", error);
        return res.status(500).json({ success: false, status: 500, message: "Unexpected error occurred while verifying email OTP" });
    }
};

// Function to handle the request to send OTP
const handleSendOtp = async (req, res) => {
    try {
        const { email, phone } = req.body;

        if (!email || !phone) {
            return res.status(400).json({ success: false, status: 400, message: "Invalid request: Email and phone number are required" });
        }

        const result = await consultantService.sendOTP(email, phone);
        return res.status(result.status).json(result);

    } catch (error) {
        console.error("Unexpected error in sendOTPHandler:", error);
        return res.status(500).json({ success: false, status: 500, message: "Unexpected error occurred while sending OTP" });
    }
};

// Function to handle the request to verify OTP
const handleVerifyOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ success: false, status: 400, message: "Invalid request: Phone number and OTP are required" });
        }

        const result = await consultantService.verifyOTP(phone, otp);
        return res.status(result.status).json(result);

    } catch (error) {
        console.error("Unexpected error in verifyOTPHandler:", error);
        return res.status(500).json({ success: false, status: 500, message: "Unexpected error occurred while verifying OTP" });
    }
};

// Function to handle the request to create a new user
const handleCreateNewUser = async (req, res) => {
    // Extracting the required data from the request body
    const { firstName, lastName, expertise, experience, startingCharges, email, phone, password } = req.body;
    const id = req.id;
    let profile = req.file.filename;

    if (!id) {
        return res.status(400).json({ success: false, status: 400, message: "Invalid request: ID is required" });
    } else if (!firstName || !lastName || !expertise || !experience || !startingCharges || !email || !phone || !password) {
        return res.status(400).json({ success: false, status: 400, message: "Invalid request: All fields are required" });
    }

    try {
        // Calling the server function to create a new user
        const result = await consultantService.createNewUser(id, firstName, lastName, expertise, experience, startingCharges, email, phone, profile, password);

        return res.status(result.status).json(result);

    } catch (error) {
        console.error("Unexpected error in createNewUserHandler:", error);
        return res.status(500).json({ success: false, status: 500, message: "Unexpected error occurred while creating user" });
    }
};

// Function to handle the request to update user details
const handleUpdateUser = async (req, res) => {
    const { firstName, lastName, expertise, experience, startingCharges } = req.body;
    const token = req.headers['authorization'].replace('Bearer ', '');
    let profile = req.file.filename;

    if (!firstName || !lastName || !expertise || !experience || !startingCharges) {
        return res.status(400).json({ success: false, message: "Invalid request: All fields are required", status: 400 });
    } else if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized: Missing authentication token", status: 401 });
    }

    try {
        // Calling the server function to update user details
        const result = await consultantService.updateUser(token, firstName, lastName, expertise, experience, startingCharges, profile);

        return res.status(result.status).json(result);

    } catch (error) {
        console.error("Unexpected error in loginHandler:", error);
        return res.status(500).json({ success: false, status: 500, message: "Unexpected error occurred while updating user" });
    }
};

// Function to handle the request to login user
const handleLogin = async (req, res) => {
    // Extracting the required data from the request body
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Invalid request: Email and password are required", status: 400 });
    }

    try {
        // Calling the server function to login user
        const result = await consultantService.login(email, password);

        return res.status(result.status).json(result);

    } catch (error) {
        console.error("Unexpected error in loginHandler:", error);
        return res.status(500).json({ success: false, status: 500, message: "Unexpected error occurred while logging in" });
    }
};

// Middleware to verify the access token
const verifyAccessToken = async (req, res, next) => {
    const token = req.headers['authorization']?.replace('Bearer ', '') || "";

    if (!token) {
        return res.status(401).json({ success: false, status: 401, message: "Unauthorized: Missing authentication token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                // throw new Error("Invalid access token");
                return res.status(401).json({ success: false, message: "Invalid access token", status: 401 });
            }
            return decoded;
        });
        req.userId = decoded.id;
        next();
    } catch (err) {
        console.error("Unexpected error in verifyAccessToken:", err);
        return res.status(500).json({ success: false, status: 500, message: "Unexpected error occurred while verifying access token" });
    }
};

// Function to handle the request to refresh access token
const handleRefreshAccessToken = async (req, res) => {
    // Extracting the required data from the request body
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ success: false, message: "Invalid request: Refresh token is required", status: 400 });
    }

    try {
        // Calling the server function to refresh access token
        const result = await consultantService.refreshAccessToken(refreshToken);

        return res.status(result.status).json(result);

    } catch (error) {
        console.error("Unexpected error in refreshAccessTokenHandler:", error);
        return res.status(500).json({ success: false, status: 500, message: "Unexpected error occurred while refreshing access token" });
    }
};

// Function to handle booking appointment
const handleBookAppointment = async (req, res) => {
    // Extracting the required data from the request body
    const { consultantId, mode, date, start_time, end_time } = req.body;
    const token = req.headers['authorization'].replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.id;

    if (!consultantId || !mode || !date || !start_time || !end_time) {
        return res.status(400).json({ success: false, message: "Invalid request: All fields are required", status: 400 });
    } else if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized: Missing authentication token", status: 401 });
    } else if (mode !== "online" && mode !== "offline") {
        return res.status(400).json({ success: false, message: "Invalid request: Mode should be either online or offline", status: 400 });
    }
    
    try {
        // Calling the server function to book appointment
        const result = await consultantService.bookAppointment(consultantId, userId, mode, date, start_time, end_time);

        return res.status(result.status).json(result);

    } catch (error) {
        console.error("Unexpected error in bookAppointmentHandler:", error);
        return res.status(500).json({ success: false, status: 500, message: "Unexpected error occurred while booking appointment" });
    }
};

// Function to handle changing status of appointment
const handleChangeAppointmentStatus = async (req, res) => {
    // Extracting the required data from the request body
    const { appointmentId, status } = req.body;

    if (!appointmentId || !status) {
        return res.status(400).json({ success: false, message: "Invalid request: Appointment ID and status are required", status: 400 });
    }
    
    try {
        // Calling the server function to change appointment status
        const result = await consultantService.changeAppointmentStatus(appointmentId, status);

        return res.status(result.status).json(result);

    } catch (error) {
        console.error("Unexpected error in changeAppointmentStatusHandler:", error);
        return res.status(500).json({ success: false, status: 500, message: "Unexpected error occurred while changing appointment status" });
    }
};

// Function to handle fetching appointment details for user
const handleFetchAppointments = async (req, res) => {
    // Extracting the required data from the request body
    const token = req.headers['authorization'].replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.id;

    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized: Missing authentication token", status: 401 });
    } else if (!userId) {
        return res.status(400).json({ success: false, message: "Invalid request: User ID is required", status: 400 });
    }
    
    try {
        // Calling the server function to fetch appointments
        const result = await consultantService.getAppointmentDetails(userId);

        return res.status(result.status).json(result);

    } catch (error) {
        console.error("Unexpected error in fetchAppointmentsHandler:", error);
        return res.status(500).json({ success: false, status: 500, message: "Unexpected error occurred while fetching appointments" });
    }
};

// Function to handle fetching appointment details for consultant
const handleFetchConsultantAppointments = async (req, res) => {
    // Extracting the required data from the request body
    const token = req.headers['authorization']?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.id;

    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized: Missing authentication token", status: 401 });
    } else if (!userId) {
        return res.status(400).json({ success: false, message: "Invalid request: User ID is required", status: 400 });
    }
    
    try {
        // Calling the server function to fetch appointments
        const result = await consultantService.getConsultantAppointmentDetails(userId);

        return res.status(result.status).json(result);

    } catch (error) {
        console.error("Unexpected error in fetchConsultantAppointmentsHandler:", error);
        return res.status(500).json({ success: false, status: 500, message: "Unexpected error occurred while fetching appointments" });
    }
};

// Function to handle fetching booked time slots for a consultant
const handleFetchBookedTimeSlots = async (req, res) => {
    // Extracting the required data from the request body
    const { consultantId, date } = req.body;

    if (!consultantId || !date) {
        return res.status(400).json({ success: false, message: "Invalid request: Consultant ID and date are required", status: 400 });
    }
    
    try {
        // Calling the server function to fetch time slots
        const result = await consultantService.getBookedTimeSlots(consultantId, date);

        return res.status(result.status).json(result);

    } catch (error) {
        console.error("Unexpected error in fetchBookedTimeSlotsHandler:", error);
        return res.status(500).json({ success: false, status: 500, message: "Unexpected error occurred while fetching time slots" });
    }
};

// Function to handle fetching consultants list
const handleFetchConsultants = async (req, res) => {
    try {
        // Calling the server function to fetch consultants
        const result = await consultantService.getConsultantsList();

        return res.status(result.status).json(result);

    } catch (error) {
        console.error("Unexpected error in fetchConsultantsHandler:", error);
        return res.status(500).json({ success: false, status: 500, message: "Unexpected error occurred while fetching consultants" });
    }
};

// Function to handle consultant details by id
const handleConsultantDetails = async (req, res) => {
    // Extracting the required data from the request body
    const { consultantId } = req.params;

    if (!consultantId) {
        return res.status(400).json({ success: false, message: "Invalid request: Consultant ID is required", status: 400 });
    }
    
    try {
        // Calling the server function to fetch consultant details
        const result = await consultantService.getConsultantById(consultantId);

        return res.status(result.status).json(result);

    } catch (error) {
        console.error("Unexpected error in consultantDetailsHandler:", error);
        return res.status(500).json({ success: false, status: 500, message: "Unexpected error occurred while fetching consultant details" });
    }
};

// Exporting the controller functions
module.exports = {
    handleSendEmailOtp,
    handleVerifyEmailOtp,
    handleCreateNewUser,
    handleUpdateUser,
    handleSendOtp,
    handleVerifyOtp,
    handleLogin,
    verifyAccessToken,
    handleRefreshAccessToken,
    handleBookAppointment,
    handleChangeAppointmentStatus,
    handleFetchAppointments,
    handleFetchConsultantAppointments,
    handleFetchBookedTimeSlots,
    handleFetchConsultants,
    handleConsultantDetails
}