/*
    File: modules/ConsultantModule/ConsultantController.js
    Author: Atharv Mirgal
    Desc: This file contains the controllers for the Consultant Module
    Created: 03-02-2025
    Last Modified: 03-02-2025
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
            return res.status(500).json({ error: result.error });
        }

        // Sending the response to the client
        return res.status(200).json({ success: true });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to add email and to send OTP!!" });
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
            return res.status(500).json({ error: result.error });
        }

        // Sending the response to the client
        return res.status(200).json({ success: true });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to verify OTP" });
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
            return res.status(500).json({ error: result.error });
        }

        // Sending the response to the client
        return res.status(200).json({ success: true });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to add phone number and to send OTP!!" });
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
            return res.status(500).json({ error: result.error });
        }

        // Sending the response to the client
        return res.status(200).json({ success: true });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to verify OTP" });
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
            return res.status(500).json({ error: result.error });
        }

        // Sending the response to the client
        return res.status(201).json({ success: true });aa

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to create user" });
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
            return res.status(500).json({ error: result.error });
        }

        // Sending the response to the client
        return res.status(200).json({ success: true });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to update user" });
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
            return res.status(500).json({ error: result.error });
        }

        // Sending the response to the client
        return res.status(200).json({ success: true, accessToken: result.accessToken, refreshToken: result.refreshToken });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to login user" });
    }
};

// Middleware to verify the access token
const verifyAccessToken = async (req, res, next) => {
    const token = req.headers['authorization']?.replace('Bearer ', '') || "";

    if(!token){
        return res.status(401).json({ error: "Access token not found" });
    }

    try{
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if(err){
                throw new Error("Invalid access token");
            }
            return decoded;
        });
        req.userId = decoded.id;
        next();
    }catch(err){
        return res.status(401).json({ error: "Invalid access token" });
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
            return res.status(500).json({ error: result.error });
        }

        // Sending the response to the client
        return res.status(200).json({ success: true, accessToken: result.accessToken });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to refresh access token" });
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
            return res.status(500).json({ error: result.error });
        }

        // Sending the response to the client
        return res.status(201).json({ success: true });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to book appointment" });
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
            return res.status(500).json({ error: result.error });
        }

        // Sending the response to the client
        return res.status(200).json({ success: true });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to change appointment status" });
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
            return res.status(500).json({ error: result.error });
        }

        // Sending the response to the client
        return res.status(200).json({ success: true, appointments: result.appointments });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to fetch appointments" });
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
            return res.status(500).json({ error: result.error });
        }

        // Sending the response to the client
        return res.status(200).json({ success: true, appointments: result.appointments });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to fetch appointments" });
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
            return res.status(500).json({ error: result.error });
        }

        console.log(result);
        // Sending the response to the client
        return res.status(200).json({ success: true, timeSlots: result });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to fetch time slots" });
    }
};

// Function to handle fetching consultants list
const handleFetchConsultants = async (req, res) => {
    try {
        // Calling the server function to fetch consultants
        const result = await consultantService.getConsultantsList();

        // Checking if the server function returned an error
        if (result.error) {
            return res.status(500).json({ error: result.error });
        }

        // Sending the response to the client
        return res.status(200).json({ success: true, consultants: result.consultants });

    } catch (error) {
        // Sending the error response to the client
        return res.status(500).json({ error: error.message || "Failed to fetch consultants" });
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
    handleFetchConsultants
}