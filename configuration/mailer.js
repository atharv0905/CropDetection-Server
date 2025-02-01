/**
 * File: mailer.js
 * Author: Atharv Mirgal
 * Description: This is contains node mailer configuration
 * Created on: 7/12/2024
 * Last Modified: 10/12/2024
 */

require('dotenv').config();
const nodemailer = require("nodemailer");

// Create a transporter using your email provider's SMTP settings
const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS   // Your email password (use app-specific password if 2FA is enabled)
    }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
    const mailOptions = {
        from: 'Crop Detection <no-reply@example.com>',  // Sender address
        to,                           // Receiver's email address
        subject,                      // Email subject
        text,                         // Plain text body
        html                          // HTML body (optional)
    };

    try {
        // Send email and wait for the response
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: ", info.response);
        return { success: true, message: "Email sent successfully" };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, message: "Failed to send email" };
    }
};

module.exports = { sendEmail };
