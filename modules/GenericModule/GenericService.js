/*
    File: modules/GenericModule/GenericService.js
    Author: Atharv Mirgal, Yash Balotiya
    Desc: This file contains the services for the GenericModule
    Created: 28-01-2025
    Last Modified: 07-02-2025
*/

// Import required modules
const fs = require("fs");
const path = require("path");
const redis = require("redis");
const utilityService = require("../UtilityModule/UtilityService");

// Initialize Redis client
const redisClient = redis.createClient();
redisClient.connect(); // For Redis v4+

// Fetch all templates from the template_images directory
const fetchTemplates = async (req) => {
    try {
        const directoryPath = path.join(__dirname, "../../template_images");
        const files = await fs.promises.readdir(directoryPath);

        if (files.length === 0) {
            return { success: false, status: 404, message: "No templates found" };
        }

        const templates = files.map((file) => ({
            filename: file,
            url: `${req.protocol}://${req.get('host')}/templates/${file}`
        }));

        return { success: true, status: 200, templates, message: "Templates fetched successfully" };
    } catch (err) {
        console.error('Error fetching templates:', err);
        return { success: false, status: 500, message: "Unable to fetch templates" };
    }
};

// Delete a template by filename
const deleteTemplate = async (filename) => {
    try {
        const filePath = path.join(__dirname, "../../template_images", filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return { success: false, status: 404, message: "Template not found" };
        }

        await fs.promises.unlink(filePath);
        return { success: true, status: 200, message: "Template deleted successfully" };
    } catch (err) {
        console.error('Error deleting template:', err);
        return { success: false, status: 500, message: "Unable to delete template" };
    }
};

// Fetch all promotions from the promotion_images directory
const fetchPromotions = async (req) => {
    try {
        const directoryPath = path.join(__dirname, "../../promotion_images");
        const files = await fs.promises.readdir(directoryPath);

        if (files.length === 0) {
            return { success: false, status: 404, message: "No promotions found" };
        }

        const promotions = files.map((file) => ({
            filename: file,
            url: `${req.protocol}://${req.get('host')}/promImgs/${file}`
        }));

        return { success: true, status: 200, promotions, message: "Promotions fetched successfully" };
    } catch (err) {
        console.error('Error fetching promotions:', err);
        return { success: false, status: 500, message: "Unable to fetch promotions" };
    }
};

// Delete a promotion by filename
const deletePromotion = async (filename) => {
    try {
        const filePath = path.join(__dirname, "../../promotion_images", filename);

        if (!fs.existsSync(filePath)) {
            return { success: false, status: 404, message: "Promotion not found" };
        }

        await fs.promises.unlink(filePath);
        return { success: true, status: 200, message: "Promotion deleted successfully" };
    } catch (err) {
        console.error('Error deleting promotion:', err);
        return { success: false, status: 500, message: "Unable to delete promotion" };
    }
};

// Store user's search history in Redis and database
const storeUserSearchHistory = async (userId, searchQuery) => {
    const redisKey = `user:${userId}:search_history`;
    const EXPIRATION_TIME = 3600; // 1 hour

    try {
        let searchHistory = await redisClient.get(redisKey);
        searchHistory = searchHistory ? JSON.parse(searchHistory) : [];

        searchHistory.push(searchQuery);
        if (searchHistory.length > 20) {
            searchHistory = searchHistory.slice(-20);
        }

        await redisClient.setEx(redisKey, EXPIRATION_TIME, JSON.stringify(searchHistory));

        // Store in the database
        const sqlQuery = "CALL ManageUserSearchHistory(?, ?);";
        await utilityService.sendQuery(sqlQuery, [userId, searchQuery]);

        return { success: true, status: 200, message: "Search history stored successfully" };
    } catch (err) {
        console.error('Error storing search history:', err);
        return { success: false, status: 500, message: "Failed to store search history" };
    }
};

// Fetch user's search history
const fetchUserSearchHistory = async (userId) => {
    const redisKey = `user:${userId}:search_history`;

    try {
        let searchHistory = await redisClient.get(redisKey);

        if (searchHistory) {
            return { success: true, status: 200, searchHistory: JSON.parse(searchHistory), message: "Search history fetched successfully" };
        }

        const query = "SELECT search_query FROM user_search_history WHERE user_id = ? ORDER BY searched_at DESC LIMIT 20;";
        const dbSearchHistory = await utilityService.sendQuery(query, [userId]);

        if (dbSearchHistory.length === 0) {
            return { success: false, status: 404, message: "No search history found" };
        }

        await redisClient.setEx(redisKey, 3600, JSON.stringify(dbSearchHistory));

        return { success: true, status: 200, searchHistory: dbSearchHistory, message: "Search history fetched successfully" };
    } catch (err) {
        console.error('Error fetching search history:', err);
        return { success: false, status: 500, message: "Failed to fetch search history" };
    }
};

module.exports = {
    fetchTemplates,
    deleteTemplate,
    fetchPromotions,
    deletePromotion,
    storeUserSearchHistory,
    fetchUserSearchHistory
};