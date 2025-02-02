/*
    File: modules/ProfileModule/ProfileService.js
    Author: Yash Balotiya
    Desc: This file contains the controllers for the ProfileModule
    Created: 02-02-2025
    Last Modified: 02-02-2025
*/

// Importing required modules
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const utilityService = require("../UtilityModule/UtilityService");

// Add new address to the database
const addAddress = async (token, line1, line2, street, landmark, city, state, pincode) => {
    try {
        // Query to add address to the database
        const addQuery = "INSERT INTO user_address (id, user_id, line_one, line_two, street, landmark, city, state, country, zip_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        const address_id = uuidv4();
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userID = decoded.id;

        await utilityService.sendQuery(addQuery, [address_id, userID, line1, line2, street, landmark, city, state, "India", pincode], "Failed to add address");

        return { success: true, message: "Address added successfully" };
    } catch (err) {
        // Log the error and return a failure response
        throw new Error(err.message);
    }
};

// Fetch all addresses of a user
const fetchAddresses = async (token) => {
    try {
        // Query to fetch all addresses of a user
        const fetchQuery = "SELECT * FROM user_address WHERE user_id = ?";
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userID = decoded.id;

        const addresses = await utilityService.sendQuery(fetchQuery, [userID], "Failed to fetch addresses");

        return { success: true, addresses };
    } catch (err) {
        // Log the error and return a failure response
        throw new Error(err.message);
    }
};

// Function to update an address
const updateAddress = async (address_id, line1, line2, street, landmark, city, state, pincode) => {
    try {
        // Query to update an address
        const updateQuery = "UPDATE user_address SET line_one = ?, line_two = ?, street = ?, landmark = ?, city = ?, state = ?, zip_code = ? WHERE id = ?";

        await utilityService.sendQuery(updateQuery, [line1, line2, street, landmark, city, state, pincode, address_id], "Failed to update address");

        return { success: true, message: "Address updated successfully" };
    } catch (err) {
        // Log the error and return a failure response
        throw new Error(err.message);
    }
};

// Function to delete an address
const deleteAddress = async (address_id) => {
    try {
        // Query to delete an address
        const deleteQuery = "DELETE FROM user_address WHERE id = ?";

        await utilityService.sendQuery(deleteQuery, [address_id], "Failed to delete address");

        return { success: true, message: "Address deleted successfully" };
    } catch (err) {
        // Log the error and return a failure response
        throw new Error(err.message);
    }
};

// Function to update user name
const updateUserName = async (token, fname, lname) => {
    try {
        // Query to update user name
        const updateQuery = "UPDATE user SET first_name = ?, last_name = ? WHERE id = ?";
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userID = decoded.id;

        await utilityService.sendQuery(updateQuery, [fname, lname, userID], "Failed to update user name");

        return { success: true, message: "User name updated successfully" };
    } catch (err) {
        // Log the error and return a failure response
        throw new Error(err.message);
    }
};

// Function to update user password
const updateUserPassword = async (token, oldPassword, newPassword) => {
    try {
        // Decode the JWT token to get the userID
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userID = decoded.id;

        // Fetch the current password from the database
        const fetchQuery = "SELECT password FROM user WHERE id = ?";
        const user = await utilityService.sendQuery(fetchQuery, [userID], "Failed to fetch user");

        if (!user || user.length === 0) {
            throw new Error("User not found");
        }

        // Compare the old password with the stored password hash
        const isPasswordMatch = await bcrypt.compare(oldPassword, user[0].password);
        if (!isPasswordMatch) {
            return { success: false, message: "Old password is incorrect" };
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 12);

        // Update the password in the database
        const updateQuery = "UPDATE user SET password = ? WHERE id = ?";
        await utilityService.sendQuery(updateQuery, [hashedNewPassword, userID], "Failed to update password");

        return { success: true, message: "Password updated successfully" };
    } catch (err) {
        // Log the error and return a failure response
        console.error(err);
        return { success: false, message: err.message };
    }
};

// Function to update user phone
const updateUserPhone = async (phone) => {
    try {
        // Query to check if the phone number is verified
        const checkVerificationQuery = "SELECT * FROM user_verification WHERE phone = ? AND phoneVerified = 1";
        const verificationResult = await utilityService.sendQuery(checkVerificationQuery, [phone], "Failed to check verification");

        if (verificationResult.length === 0) {
            throw new Error("Phone number not verified");
        }

        // Query to check if the phone number is already present in the database
        const checkPhoneQuery = "SELECT * FROM user WHERE phone = ?";
        const result = await utilityService.sendQuery(checkPhoneQuery, [phone], "Failed to check phone number");

        // If the phone number is not present in the database, add it
        if (result.length === 0) {
            const updateQuery = "CALL InsertUser(?, ?, ?, ?, ?, ?);";
            await utilityService.sendQuery(updateQuery, [null, null, null, phone, null, "update"], "Failed to update phone");
        }

        return { success: true, message: "Phone updated successfully" };
    } catch (err) {
        // Log the error and return a failure response
        throw new Error(err.message);
    }
};

module.exports = {
    addAddress,
    fetchAddresses,
    updateAddress,
    deleteAddress,
    updateUserName,
    updateUserPassword,
    updateUserPhone
};