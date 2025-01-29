/*
    File: modules/GenericModule/GenericService.js
    Author: Atharv Mirgal
    Desc: This file contains the services for the GenericModule
    Created: 28-01-2025
    Last Modified: 29-01-2025
*/
const fs = require("fs");
const path = require("path");

// Fetches all the templates from the template_images directory
const fetchTemplates = async (req) => {
    try {
        const directoryPath = path.join(__dirname, "../../template_images");
        const files = await fs.promises.readdir(directoryPath);

        const templates = files.map((file) => ({
            filename: file,
            url: `${req.protocol}://${req.get('host')}/templates/${file}` // Generates the URL for the template
        }));

        return { success: true, templates };
    } catch (err) {
        return { success: false, message: "Unable to scan directory: " + err };
    }
};

// Deletes the template with the given filename
const deleteTemplate = async (filename) => {
    try {
        const filePath = path.join(__dirname, "../../template_images", filename);

        await fs.promises.unlink(filePath);

        return { success: true, message: "Template deleted successfully" };
    }
    catch (err) {
        return { success: false, message: "Unable to delete template: " + err };
    }
}

// Fetches all the promotions from the promotion_images directory
const fetchPromotions = async (req) => {
    try {
        const directoryPath = path.join(__dirname, "../../promotion_images");
        const files = await fs.promises.readdir(directoryPath);

        const templates = files.map((file) => ({
            filename: file,
            url: `${req.protocol}://${req.get('host')}/promImgs/${file}` // Generates the URL for the promotion
        }));

        return { success: true, templates };
    } catch (err) {
        return { success: false, message: "Unable to scan directory: " + err };
    }
};

// Deletes the promotion with the given filename
const deletePromotion = async (filename) => {
    try {
        const filePath = path.join(__dirname, "../../promotion_images", filename);

        await fs.promises.unlink(filePath);

        return { success: true, message: "Promotion deleted successfully" };
    }
    catch (err) {
        return { success: false, message: "Unable to delete promotion: " + err };
    }
}

module.exports = {
    fetchTemplates,
    deleteTemplate,
    fetchPromotions,
    deletePromotion
};