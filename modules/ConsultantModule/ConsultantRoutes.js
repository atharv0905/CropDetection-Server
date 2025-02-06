/*
    File: modules/ConsultantModule/ConsultantRoutes.js
    Author: Atharv Mirgal, Yash Balotiya
    Desc: This file contains the routes for the Consultant Module
    Created: 03-02-2025
    Last Modified: 05-02-2025
*/

// Importing the required modules
const { Router } = require('express');
const multer = require("multer");
const fs = require('fs')
const { v4: uuidv4 } = require("uuid");
const consultantController = require('./ConsultantController');

// Creating the router object
const router = Router();

// Create directory if not exists
const dir = './consultant_images';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "consultant_images/");
    },
    filename: function (req, file, cb) {
        const originalName = file.originalname.replace(/\.[^/.]+$/, ""); // Remove extension
        const id = req.id || req.body.id;
        const filename = id + ".png"; // Append original name and .png
        cb(null, filename);
    },
});

// Multer object
const upload = multer({ storage: storage });

// Defining the routes
// Route to handle sending email OTP
router.post('/send-email-otp', consultantController.handleSendEmailOtp); // tested

// Route to handle verifying email OTP
router.post('/verify-email-otp', consultantController.handleVerifyEmailOtp); // tested

// Route to handle sending OTP
router.post('/send-otp', consultantController.handleSendOtp); // tested

// Route to handle verifying OTP
router.post('/verify-otp', consultantController.handleVerifyOtp); //  tested

// Route to handle creating a new user
router.post('/signup', (req, res, next) => {
    req.id = uuidv4();
    next();
}, upload.single('profile'), consultantController.handleCreateNewUser); // tested

// Route to handle updating user details
router.put('/update', upload.single('profile'), consultantController.verifyAccessToken, consultantController.handleUpdateUser); // tested

// Route to handle login of user
router.post('/login', consultantController.handleLogin); // tested

// Route to verify access token
router.get('/protected', consultantController.verifyAccessToken, (req, res) => { // tested
    res.status(200).json({ success: true, message: "Access granted" });
});

// Route to refresh access token
router.post('/refresh-token', consultantController.handleRefreshAccessToken); // tested

// Route to book an appointment
router.post('/book-appointment', consultantController.handleBookAppointment); // tested

// Route to change appointment status
router.post('/change-status', consultantController.verifyAccessToken, consultantController.handleChangeAppointmentStatus); // tested

// Route to get appointments
router.post('/get-appointments', consultantController.handleFetchAppointments); // tested

// Route to get consultant appointments
router.post('/get-consultant-appointments', consultantController.handleFetchConsultantAppointments); // tested

// Route to get booked slots
router.post('/get-booked-slots', consultantController.handleFetchBookedTimeSlots); // tested

// Route to get consultants
router.get('/get-consultants', consultantController.handleFetchConsultants); // tested

// Route to get consultant details
router.get('/get-consultant-details/:consultantId', consultantController.handleConsultantDetails); // tested

// Exporting the router object
module.exports = router;