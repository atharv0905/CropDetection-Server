/*
    File: modules/GenericModule/GenericService.js
    Author: Atharv Mirgal
    Desc: This file contains the services for the GenericModule
    Created: 28-01-2025
    Last Modified: 28-01-2025
*/
const fs = require("fs");
const path = require("path");

const fetchTemplates = async (req) => {
    try {
        const directoryPath = path.join(__dirname, "../../template_images");
        const files = await fs.promises.readdir(directoryPath);

        const templates = files.map((file) => ({
            filename: file,
            url: `${req.protocol}://${req.get('host')}/templates/${file}`
        }));

        return { success: true, templates };
    } catch (err) {
        return { success: false, message: "Unable to scan directory: " + err };
    }
};

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

module.exports = {
    fetchTemplates,
    deleteTemplate
};