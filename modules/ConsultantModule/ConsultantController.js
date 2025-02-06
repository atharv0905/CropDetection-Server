/*
    File: modules/ConsultantModule/ConsultantController.js
    Author: Atharv Mirgal, Yash Balotiya
    Desc: This file contains the controllers for the Consultant Module
    Created: 03-02-2025
    Last Modified: 05-02-2025
*/

// Importing the required modules
const consultantService = require("./ConsultantService");
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require("uuid");

// Function to handle the request to send email OTP
const handleSendEmailOtp = async (req, res) => {
    // Extracting the required data from the request body
    const { email } = req.body;

    try {
        // Calling the server function to verify the email
        const result = await consultantService.sendEmailOTP(email);

        // Checking if the server function returned an error
        if (result.error) {
            return res.status(500).json({ success: false, error: result.error, message: "Failed to send email OTP" });
        }

        // Sending the response to the client
        return res.status(200).json({ success: true, message: "OTP sent successfully" });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ success: false, error: error.message || "Failed to add email and to send OTP!!", message: "Failed to send email OTP" });
    }
};

// Function to handle the request to verify email OTP
const handleVerifyEmailOtp = async (req, res) => {
    // Extracting the required data from the request body
    const { email, otp } = req.body;

    try {
        // Calling the server function to verify the OTP
        const result = await consultantService.verifyEmailOTP(email, otp);

        // Checking if the server function returned an error
        if (result.error) {
            return res.status(500).json({ success: false, error: result.error, message: "Failed to verify email OTP" });
        }

        // Sending the response to the client
        return res.status(200).json({ success: true, message: "OTP verified successfully" });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ success: false, error: error.message || "Failed to verify OTP", message: "Failed to verify email OTP" });
    }
};

// Function to handle the request to send OTP
const handleSendOtp = async (req, res) => {
    // Extracting the required data from the request body
    const { email, phone } = req.body;

    try {
        // Calling the server function to verify the phone number
        const result = await consultantService.sendOTP(email, phone);

        // Checking if the server function returned an error
        if (result.error) {
            return res.status(500).json({ error: result.error, success: false, message: "Failed to send OTP" });
        }

        // Sending the response to the client
        return res.status(200).json({ success: true, message: "OTP sent successfully" });

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
        const result = await consultantService.verifyOTP(phone, otp);

        // Checking if the server function returned an error
        if (result.error) {
            return res.status(500).json({ error: result.error, success: false, message: "Failed to verify OTP" });
        }

        // Sending the response to the client
        return res.status(200).json({ success: true, message: "OTP verified successfully" });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to verify OTP", success: false, message: "Failed to verify OTP" });
    }
};

// Function to handle the request to create a new user
const handleCreateNewUser = async (req, res) => {
    // Extracting the required data from the request body
    const { firstName, lastName, expertise, experience, startingCharges, email, phone, password } = req.body;
    const id = req.id;
    let profile = req.file.filename;

    try {
        // Calling the server function to create a new user
        const result = await consultantService.createNewUser(id, firstName, lastName, expertise, experience, startingCharges, email, phone, profile, password);

        // Checking if the server function returned an error
        if (result.error) {
            return res.status(500).json({ error: result.error, success: false, message: "Failed to create user" });
        }

        // Sending the response to the client
        return res.status(201).json({ success: true });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to create user", success: false, message: "Failed to create user" });
    }
};

// Function to handle the request to update user details
const handleUpdateUser = async (req, res) => {
    const { firstName, lastName, expertise, experience, startingCharges } = req.body;
    const token = req.headers['authorization'].replace('Bearer ', '');
    let profile = req.file.filename;

    try {
        // Calling the server function to update user details
        const result = await consultantService.updateUser(token, firstName, lastName, expertise, experience, startingCharges, profile);

        // Checking if the server function returned an error
        if (result.error) {
            return res.status(500).json({ error: result.error, success: false, message: "Failed to update user" });
        }

        // Sending the response to the client
        return res.status(200).json({ success: true, message: "User updated successfully" });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to update user", success: false, message: "Failed to update user" });
    }
};

// Function to handle the request to login user
const handleLogin = async (req, res) => {
    // Extracting the required data from the request body
    const { email, password } = req.body;

    try {
        // Calling the server function to login user
        const result = await consultantService.login(email, password);

        // Checking if the server function returned an error
        if (result.error) {
            return res.status(500).json({ error: result.error, success: false, message: "Failed to login user" });
        }

        // Sending the response to the client
        return res.status(200).json({ success: true, accessToken: result.accessToken, refreshToken: result.refreshToken, message: "User logged in successfully" });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to login user", success: false, message: "Failed to login user" });
    }
};

// Middleware to verify the access token
const verifyAccessToken = async (req, res, next) => {
    const token = req.headers['authorization']?.replace('Bearer ', '') || "";

    if (!token) {
        return res.status(401).json({ error: "Access token not found", success: false, message: "Access token not found" });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                throw new Error("Invalid access token");
            }
            return decoded;
        });
        req.userId = decoded.id;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid access token", success: false, message: "Invalid access token" });
    }
};

// Function to handle the request to refresh access token
const handleRefreshAccessToken = async (req, res) => {
    // Extracting the required data from the request body
    const { refreshToken } = req.body;

    try {
        // Calling the server function to refresh access token
        const result = await consultantService.refreshAccessToken(refreshToken);

        // Checking if the server function returned an error
        if (result.error) {
            return res.status(500).json({ error: result.error, success: false, message: "Failed to refresh access token" });
        }

        // Sending the response to the client
        return res.status(200).json({ success: true, accessToken: result.accessToken, message: "Access token refreshed successfully" });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to refresh access token", success: false, message: "Failed to refresh access token" });
    }
};

// Function to handle booking appointment
const handleBookAppointment = async (req, res) => {
    // Extracting the required data from the request body
    const { consultantId, mode, date, start_time, end_time } = req.body;
    const token = req.headers['authorization'].replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.id;
    
    try {
        // Calling the server function to book appointment
        const result = await consultantService.bookAppointment(consultantId, userId, mode, date, start_time, end_time);

        // Checking if the server function returned an error
        if (result.error) {
            return res.status(500).json({ error: result.error, success: false, message: "Failed to book appointment" });
        }

        // Sending the response to the client
        return res.status(201).json({ success: true, message: "Appointment booked successfully" });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to book appointment", success: false, message: "Failed to book appointment" });
    }
};

// Function to handle changing status of appointment
const handleChangeAppointmentStatus = async (req, res) => {
    // Extracting the required data from the request body
    const { appointmentId, status } = req.body;
    
    try {
        // Calling the server function to change appointment status
        const result = await consultantService.changeAppointmentStatus(appointmentId, status);

        // Checking if the server function returned an error
        if (result.error) {
            return res.status(500).json({ error: result.error, success: false, message: "Failed to change appointment status" });
        }

        // Sending the response to the client
        return res.status(200).json({ success: true, message: "Appointment status changed successfully" });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to change appointment status", success: false, message: "Failed to change appointment status" });
    }
};

// Function to handle fetching appointment details for user
const handleFetchAppointments = async (req, res) => {
    // Extracting the required data from the request body
    const token = req.headers['authorization'].replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.id;
    
    try {
        // Calling the server function to fetch appointments
        const result = await consultantService.getAppointmentDetails(userId);

        // Checking if the server function returned an error
        if (result.error) {
            return res.status(500).json({ error: result.error, success: false, message: "Failed to fetch appointments" });
        }

        // Sending the response to the client
        return res.status(200).json({ success: true, appointments: result.appointments, message: "Appointments fetched successfully" });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to fetch appointments", success: false, message: "Failed to fetch appointments" });
    }
};

// Function to handle fetching appointment details for consultant
const handleFetchConsultantAppointments = async (req, res) => {
    // Extracting the required data from the request body
    const token = req.headers['authorization']?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.id;
    
    try {
        // Calling the server function to fetch appointments
        const result = await consultantService.getConsultantAppointmentDetails(userId);

        // Checking if the server function returned an error
        if (result.error) {
            return res.status(500).json({ error: result.error, success: false, message: "Failed to fetch appointments" });
        }

        // Sending the response to the client
        return res.status(200).json({ success: true, appointments: result.appointments, message: "Appointments fetched successfully" });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to fetch appointments", success: false, message: "Failed to fetch appointments" });
    }
};

// Function to handle fetching booked time slots for a consultant
const handleFetchBookedTimeSlots = async (req, res) => {
    // Extracting the required data from the request body
    const { consultantId, date } = req.body;
    
    try {
        // Calling the server function to fetch time slots
        const result = await consultantService.getBookedTimeSlots(consultantId, date);

        // Checking if the server function returned an error
        if (result.error) {
            return res.status(500).json({ error: result.error, success: false, message: "Failed to fetch time slots" });
        }

        console.log(result);
        // Sending the response to the client
        return res.status(200).json({ success: true, timeSlots: result.timeSlots, message: "Time slots fetched successfully" });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to fetch time slots", success: false, message: "Failed to fetch time slots" });
    }
};

// Function to handle fetching consultants list
const handleFetchConsultants = async (req, res) => {
    
    try {
        // Calling the server function to fetch consultants
        const result = await consultantService.getConsultantsList();

        // Checking if the server function returned an error
        if (result.error) {
            return res.status(500).json({ error: result.error, message: "Failed to fetch consultants", success: false });
        }

        // Sending the response to the client
        return res.status(200).json({ success: true, consultants: result.consultants, message: "Consultants fetched successfully" });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to fetch consultants", success: false, message: "Failed to fetch consultants" });
    }
};

// Function to handle consultant details by id
const handleConsultantDetails = async (req, res) => {
    // Extracting the required data from the request body
    const { consultantId } = req.params;
    
    try {
        // Calling the server function to fetch consultant details
        const result = await consultantService.getConsultantById(consultantId);

        // Checking if the server function returned an error
        if (result.error) {
            return res.status(500).json({ error: result.error, message: "Failed to fetch consultant details", success: false });
        }

        // Sending the response to the client
        return res.status(200).json({ success: true, consultant: result.consultant, message: "Consultant details fetched successfully" });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to fetch consultant details", success: false, message: "Failed to fetch consultant details" });
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