/**
 * File: modules/UserModule/UserServer.js
 * Author: Yash Balotiya
 * Description: This file is used to handle the server-side logic of the user module.
 * Created on: 27/01/2025
 * Last Modified: 29/01/2025
*/

// Importing the required modules
const db = require("../../configuration/db");
const { v4: uuidv4 } = require("uuid");
require('dotenv').config();
const { sendSMS } = require("../../configuration/sms");
const crypto = require('crypto');

// Function to generate 6 digit OTP
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

// Function to add phone number and send OTP
const createNewRegistration = async (phone) => {
    // Query to insert phone number into the database
    const insertPhoneQuery = "INSERT INTO user_verification (id, phone, phoneOTP) VALUES (?, ?, ?)";

    // Query to check if the phone number already exists in the database
    const checkPhoneQuery = "SELECT * FROM user WHERE phone = ?";

    phone = '91' + phone;

    // Checking if the phone number already exists in the database
    const result = await new Promise((resolve, reject) => {
        db.query(checkPhoneQuery, [phone], (error, result) => {

            // Checking if there was an error checking the phone number
            if (error) {
                console.error("Error checking phone number:", error);
                reject(new Error("Failed to check phone number"));
            } else {
                resolve(result);
            }
        });
    });

    // Generating a unique id for the phone number
    const id = uuidv4();

    // Generating a 6 digit OTP
    const otp = generateOTP();

    try {
        // Inserting the phone number, opt and uid into the database
        await new Promise((resolve, reject) => {
            db.query(insertPhoneQuery, [id, phone, otp], (error, result) => {

                // Checking if there was an error inserting the phone number
                if (error) {
                    console.error("Error inserting phone number, otp & uid:", error);
                    reject(new Error("Failed to insert phone number. Duplicate Entries Found!!"));
                } else {
                    resolve();
                }
            });
        });

        // Sending the OTP to the user
        const message = `Your OTP is ${otp}.`;
        console.log(message)

        // Sending the OTP to the user
        // const smsResult = await sendSMS(phone, message);

        // Checking if the OTP was sent successfully
        // if (smsResult.error) {
        //     return { error: smsResult.error };
        // }

        // Returning the success response
        return { success: true };

    } catch (error) {
        // Returning the error response
        console.error("Error adding phone number, otp & uid:", error);
        return { error: error.message || "Failed to add phone number, otp & uid!!" };
    }
}

// Function to verify the OTP
const verifyOtp = async (phone, otp) => {
    // Query to get the phone number and OTP from the database
    const getVerificationQuery = "SELECT * FROM user_verification WHERE phone = ?";

    // Phone No with country code
    phone = '+91' + phone;

    try {
        // Getting the phone number and OTP from the database
        const result = await new Promise((resolve, reject) => {
            db.query(getVerificationQuery, [phone], (error, result) => {

                // Checking if there was an error getting the phone number and OTP
                if (error) {
                    console.error("Error getting phone number and otp:", error);
                    reject(new Error("Failed to get phone number and otp"));
                } else {
                    resolve(result);
                }
            });
        });

        // Checking if the phone number and OTP were found
        if (result.length === 0) {
            return { error: "Phone number not found" };
        }

        // Checking if the OTP time has expired
        const currentTime = new Date();
        const otpTime = new Date(result[0].createdAt);
        const timeDifference = currentTime - otpTime;
        const timeDifferenceInMinutes = timeDifference / (1000 * 60);

        if (timeDifferenceInMinutes > 5) {
            // Deleting the OTP from the database
            const deleteOtpQuery = "DELETE FROM user_verification WHERE phone = ?";
            await new Promise((resolve, reject) => {
                db.query(deleteOtpQuery, [phone], (error, result) => {

                    // Checking if there was an error deleting the OTP
                    if (error) {
                        console.error("Error deleting OTP:", error);
                        reject(new Error("Failed to delete OTP"));
                    } else {
                        resolve();
                    }
                });
            });

            return { error: "OTP has expired" };
        }
        
        // Checking if the OTP is correct
        if (result[0].phoneOTP != otp) {
            return { error: "Invalid OTP" };
        }

        // Setting the user as verified
        const updateUserQuery = "UPDATE user_verification SET phoneVerified = ? WHERE phone = ?";
        await new Promise((resolve, reject) => {
            db.query(updateUserQuery, [true, phone], (error, result) => {

                // Checking if there was an error updating the user
                if (error) {
                    console.error("Error updating user:", error);
                    reject(new Error("Failed to update user"));
                } else {
                    resolve();
                }
            });
        });

        // Returning the success response
        return { success: true };

    } catch (error) {
        // Returning the error response
        console.error("Error verifying OTP:", error);
        return { error: error.message || "Failed to verify OTP" };
    }
}

// Function to create a new user
const createNewUser = async (firstName, lastName, phone, password) => {
    // Query to insert a new user into the database
    const insertUserQuery = "INSERT INTO user (id, first_name, last_name, phone, password) VALUES (?, ?, ?, ?, ?)";

    // Query to get User ID from User Verification Table
    const getUserIdQuery = "SELECT id FROM user_verification WHERE phone = ?";

    // Query to delete User from User Verification Table
    const deleteUserQuery = "DELETE FROM user_verification WHERE phone = ?";

    phone = '91' + phone;
    let id = '';

    try {
        // Getting the user ID from the user verification table
        const result = await new Promise((resolve, reject) => {
            db.query(getUserIdQuery, [phone], (error, result) => {

                // Checking if there was an error getting the user ID
                if (error) {
                    console.error("Error getting user ID:", error);
                    reject(new Error("Failed to get user ID"));
                } else {
                    resolve(result);
                }
            });
        });

        // Checking if the user ID was found
        if (result.length === 0) {
            return { error: "User ID not found" };
        }

        // Extracting the user ID
        id = result[0].id;

        // Deleting the user from the user verification table
        await new Promise((resolve, reject) => {
            db.query(deleteUserQuery, [phone], (error, result) => {

                // Checking if there was an error deleting the user
                if (error) {
                    console.error("Error deleting user:", error);
                    reject(new Error("Failed to delete user"));
                } else {
                    resolve();
                }
            });
        });

    } catch (error) {
        // Returning the error response
        console.error("Error creating user:", error);
        return { error: error.message || "Failed to create user" };
    }

    // Hashing the password
    // password = crypto.createHash('sha256').update(password).digest('hex');

    // Unhashing the password
    // password = crypto.createHash('sha256').
    // update(password).digest('hex');

    try {
        // Inserting the user into the database
        await new Promise((resolve, reject) => {
            db.query(insertUserQuery, [id, firstName, lastName, phone, password], (error, result) => {

                // Checking if there was an error inserting the user
                if (error) {
                    console.error("Error inserting user:", error);
                    reject(new Error("Failed to insert user"));
                } else {
                    resolve();
                }
            });
        });

        // Returning the success response
        return { success: true };

    } catch (error) {
        // Returning the error response
        console.error("Error creating user:", error);
        return { error: err.message || "Failed to create user" };
    }
}

// Exporting the server functions
module.exports = {
    createNewRegistration,
    verifyOtp,
    createNewUser,
}