/*
    File: modules/GenericModule/GenericController.js
    Author: Atharv Mirgal, Yash Balotiya
    Desc: This file contains the controllers for the GenericModule
    Created: 28-01-2025
    Last Modified: 05-02-2025
*/

// Importing the services
const genericService = require("./GenericService");

// Handles the addition of a template
const addTemplateHandler = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded!", success: false});
    }
    res.status(200).json({ success: true, message: "Template uploaded successfully", filename: req.file.filename });
};

// Handles the fetching of all templates
const fetchTemplatesHandler = async (req, res) => {
    // Fetch all templates
    const templates = await genericService.fetchTemplates(req);

    // Send the response
    if (templates.success) {
        return res.status(200).json({ data: templates, success: true, message: "Templates fetched successfully" });
    } else {
        return res.status(500).json({ data: templates, success: false, message: "Failed to fetch templates"} );
    }
};

// Handles the deletion of a template
const deleteTemplateHandler = async (req, res) => {
    // Delete the template
    const response = await genericService.deleteTemplate(req.params.filename + ".png");

    // Send the response
    if (response.success) {
        return res.status(200).json({ data: response, success: true, message: "Template deleted successfully" });
    } else {
        return res.status(500).json({ data: response, success: false, message: "Failed to delete template" });
    }
};

// Handles the addition of a promotion
const addPromotionHandler = async (req, res) => {
    // Check if a file was uploaded
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded!", success: false});
    }

    // Send the response
    if (req.file.size > 5000000) {
        return res.status(400).json({ message: "File size too large!", success: false});

    } else if (req.file.mimetype !== "image/png") {
        return res.status(400).json({ message: "Invalid file type!", success: false});

    } else if (req.file.size === 0) {
        return res.status(400).json({ message: "Empty file uploaded!", success: false});

    } else if (req.file.size < 5000000 && req.file.mimetype === "image/png") {
        return res.status(200).json({ success: true, message: "Promotion uploaded successfully", filename: req.file.filename });
    }
};

// Handles the fetching of all promotions
const fetchPromotionsHandler = async (req, res) => {
    // Fetch all promotions
    const templates = await genericService.fetchPromotions(req);

    // Send the response
    if (templates.success) {
        return res.status(200).json({ data: templates, success: true, message: "Promotions fetched successfully" });
    } else {
        return res.status(500).json({ data: templates, success: false, message: "Failed to fetch promotions"} );
    }
};

// Handles the deletion of a promotion
const deletePromotionHandler = async (req, res) => {
    // Delete the promotion
    const response = await genericService.deletePromotion(req.params.filename + ".png");

    // Send the response
    if (response.success) {
        return res.status(200).json({ data: response, success: true, message: "Promotion deleted successfully" });
    } else {
        return res.status(500).json({ data: response, success: false, message: "Failed to delete promotion" });
    }
};

// Handles storing user search history
const storeSearchHistoryHandler = async (req, res) => {
    // Extracting the user_id and search_query from the request
    const { user_id, search_query } = req.body;

    // Calling the service to store the search history
    const response = await genericService.storeUserSearchHistory(user_id, search_query);

    // Sending the response
    if (response.success) {
        return res.status(200).json({ data: response, success: true, message: "Search history stored successfully" });
    } else {
        return res.status(500).json({ data: response, success: false, message: "Failed to store search history" });
    }
};

// Handle fetching user search history
const fetchSearchHistoryHandler = async (req, res) => {
    // Extracting the user_id from the request
    const { user_id } = req.params;

    // Calling the service to fetch the search history
    const response = await genericService.fetchUserSearchHistory(user_id);

    // Sending the response
    if (response.success) {
        return res.status(200).json({ data: response, success: true, message: "Search history fetched successfully" });
    } else {
        return res.status(500).json({ data: response, success: false, message: "Failed to fetch search history" });
    }
};

// Exporting the functions
module.exports = {
    addTemplateHandler,
    fetchTemplatesHandler,
    deleteTemplateHandler,
    addPromotionHandler,
    fetchPromotionsHandler,
    deletePromotionHandler,
    storeSearchHistoryHandler,
    fetchSearchHistoryHandler
};