/*
    File: modules/ConsultantModule/ConsultantRoutes.js
    Author: Atharv Mirgal
    Desc: This file contains the routes for the Consultant Module
    Created: 03-02-2025
    Last Modified: 03-02-2025
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

const upload = multer({ storage: storage });

// Defining the routes
router.post('/send-email-otp', consultantController.handleSendEmailOtp); // tested

router.post('/verify-email-otp', consultantController.handleVerifyEmailOtp); // tested

router.post('/send-otp', consultantController.handleSendOtp); // tested

router.post('/verify-otp', consultantController.handleVerifyOtp); //  tested

router.post('/signup', (req, res, next) => {
    req.id = uuidv4();
    next();
}, upload.single('profile'), consultantController.handleCreateNewUser); // tested

router.put('/update', upload.single('profile'), consultantController.verifyAccessToken, consultantController.handleUpdateUser); // tested

router.post('/login', consultantController.handleLogin); // tested

router.get('/protected', consultantController.verifyAccessToken, (req, res) => { // tested
    res.status(200).json({ success: true, message: "Access granted" });
})

router.post('/refresh-token', consultantController.handleRefreshAccessToken); // tested

router.post('/book-appointment', consultantController.verifyAccessToken, consultantController.handleBookAppointment); // tested

router.post('/change-status', consultantController.verifyAccessToken, consultantController.handleChangeAppointmentStatus); // tested

router.post('/get-appointments', consultantController.verifyAccessToken, consultantController.handleFetchAppointments); // tested

router.post('/get-consultant-appointments', consultantController.verifyAccessToken, consultantController.handleFetchConsultantAppointments); // tested

router.post('/get-booked-slots', consultantController.verifyAccessToken, consultantController.handleFetchBookedTimeSlots); // tested

router.get('/get-consultants', consultantController.verifyAccessToken, consultantController.handleFetchConsultants); // tested

// Exporting the router object
module.exports = router;