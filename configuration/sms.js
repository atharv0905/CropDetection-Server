/**
 * File: configuration/sms.js
 * Author: Atharv Mirgal, Yash Balotiya
 * Description: This is contains twilio sms configuration
 * Created on: 29/01/2024
 * Last Modified: 29/01/2024
 */

require('dotenv').config();
const twilio = require('twilio');

// Load Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Twilio Account SID
const authToken = process.env.TWILIO_AUTH_TOKEN;   // Your Twilio Auth Token
const fromPhone = process.env.TWILIO_PHONE_NUMBER; // Your Twilio phone number

// Create a Twilio client
const client = twilio(accountSid, authToken);

// Function to send SMS
const sendSMS = async (to, message) => {
    try {
        const response = await client.messages.create({
            body: message,        // Message body
            from: fromPhone,      // Twilio phone number
            to                    // Recipient's phone number
        });
        console.log("Message sent:", response.sid);
        return { success: true, message: "SMS sent successfully", sid: response.sid };
    } catch (error) {
        console.error("Error sending SMS:", error);
        return { success: false, message: "Failed to send SMS", error: error.message };
    }
};

module.exports = { sendSMS };