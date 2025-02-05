/*
    File: modules/GenericModule/GenericService.js
    Author: Atharv Mirgal, Yash Balotiya
    Desc: This file contains the services for the GenericModule
    Created: 28-01-2025
    Last Modified: 05-02-2025
*/

// Importing the required modules
const fs = require("fs");
const path = require("path");
const redis = require("redis");
const utilityService = require("../UtilityModule/UtilityService");
const db = require("../../configuration/db");

// Initialize Redis client
const redisClient = redis.createClient();
redisClient.connect(); // For Redis v4+

// Fetches all the templates from the template_images directory
const fetchTemplates = async (req) => {
    try {
        // Fetch all files from the template_images directory
        const directoryPath = path.join(__dirname, "../../template_images");
        const files = await fs.promises.readdir(directoryPath);

        // Generate the URL for each template
        const templates = files.map((file) => ({
            filename: file,
            url: `${req.protocol}://${req.get('host')}/templates/${file}` // Generates the URL for the template
        }));

        // Return the templates
        return { success: true, templates, message: "Templates fetched successfully" };
    } catch (err) {
        // Return an error message if the directory cannot be scanned
        console.error('Error fetching templates:', err);
        return { success: false, message: "Unable to scan directory: " + err };
    }
};

// Deletes the template with the given filename
const deleteTemplate = async (filename) => {
    try {
        // Construct the file path
        const filePath = path.join(__dirname, "../../template_images", filename);

        // Delete the file
        await fs.promises.unlink(filePath);

        // Return success message
        return { success: true, message: "Template deleted successfully" };
    }
    catch (err) {
        // Return error message if the file cannot be deleted
        console.error('Error deleting template:', err);
        return { success: false, message: "Unable to delete template: " + err };
    }
}

// Fetches all the promotions from the promotion_images directory
const fetchPromotions = async (req) => {
    try {
        // Fetch all files from the promotion_images directory
        const directoryPath = path.join(__dirname, "../../promotion_images");
        const files = await fs.promises.readdir(directoryPath);

        // Generate the URL for each promotion
        const templates = files.map((file) => ({
            filename: file,
            url: `${req.protocol}://${req.get('host')}/promImgs/${file}` // Generates the URL for the promotion
        }));

        // Return the promotions
        return { success: true, templates, message: "Promotions fetched successfully" };
    } catch (err) {
        // Return an error message if the directory cannot be scanned
        console.error('Error fetching promotions:', err);
        return { success: false, message: "Unable to scan directory: " + err };
    }
};

// Deletes the promotion with the given filename
const deletePromotion = async (filename) => {
    try {
        // Construct the file path
        const filePath = path.join(__dirname, "../../promotion_images", filename);

        // Delete the file
        await fs.promises.unlink(filePath);

        // Return success message
        return { success: true, message: "Promotion deleted successfully" };
    }
    catch (err) {
        // Return error message if the file cannot be deleted
        console.error('Error deleting promotion:', err);
        return { success: false, message: "Unable to delete promotion: " + err };
    }
}

// Stores the user's search history in Redis and the database
const storeUserSearchHistory = async (userId, searchQuery) => {
    // Redis key for storing search history
    const redisKey = `user:${userId}:search_history`;
    const EXPIRATION_TIME = 60 * 60; // 1 hour expiration time

    try {
        // Fetch the existing search history from Redis
        let searchHistory = await redisClient.get(redisKey);

        // If the history is null or invalid, start with an empty array
        if (searchHistory) {
            try {
                searchHistory = JSON.parse(searchHistory);
            } catch (err) {
                // If parsing fails, start with an empty array
                console.error('Error parsing JSON from Redis:', err);
                searchHistory = [];
            }
        } else {
            searchHistory = []; // If no history exists, start with an empty array
        }

        // Add the new search query
        searchHistory.push(searchQuery);

        // Limit the array to the most recent 20 search queries
        if (searchHistory.length > 20) {
            searchHistory = searchHistory.slice(-20); // Keep only the last 20 queries
        }

        // Store the updated search history in Redis with expiration time
        await redisClient.setEx(redisKey, EXPIRATION_TIME, JSON.stringify(searchHistory));

        // Corrected SQL query using parameterized query
        const sqlQuery = "CALL ManageUserSearchHistory(?, ?);";

        // Store into the database using a promise to handle the query
        utilityService.sendQuery(sqlQuery, [userId, searchQuery]);

        // Return success message
        return { success: true, message: "Search history stored successfully" };
    } catch (err) {
        // Return error message if storing fails
        console.error('Error storing search history:', err);
        return { success: false, message: err.message };
    }
};

// Fetch user search history
const fetchUserSearchHistory = async (userId) => {
    // Redis key for storing search history
    const redisKey = `user:${userId}:search_history`;

    try {
        // Fetch the search history from Redis
        let searchHistory = await redisClient.get(redisKey);

        // If the history is null or invalid, return an empty array
        if (searchHistory) {
            try {
                searchHistory = JSON.parse(searchHistory);
                return { success: true, searchHistory };
            } catch (err) {
                // If parsing fails, return an empty array
                console.error('Error parsing JSON from Redis:', err);
                searchHistory = [];
            }
        }

        // Query to fetch search history from the database
        const query = "SELECT search_query FROM user_search_history WHERE user_id = ? ORDER BY searched_at DESC;";

        // Fetch the search history from the database
        const [dbSearchHistory] = utilityService.sendQuery(query, [userId]);

        searchHistory = dbSearchHistory;

        // Store the search history in Redis with expiration time
        return { success: true, searchHistory, message: "Search history fetched successfully" };
    } catch (err) {
        // Return error message if fetching fails
        console.error('Error fetching search history:', err);
        return { success: false, message: err.message };
    }
};

// Exporting the functions to be used in the controller
module.exports = {
    fetchTemplates,
    deleteTemplate,
    fetchPromotions,
    deletePromotion,
    storeUserSearchHistory,
    fetchUserSearchHistory
};