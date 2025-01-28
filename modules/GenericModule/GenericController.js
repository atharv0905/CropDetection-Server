/*
    File: modules/GenericModule/GenericController.js
    Author: Atharv Mirgal
    Desc: This file contains the controllers for the GenericModule
    Created: 28-01-2025
    Last Modified: 28-01-2025
*/

const genericService = require("./GenericService");

const addTemplateHandler = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded!" });
    }
    res.status(200).json({ success: true, message: "Template uploaded successfully", filename: req.file.filename });
};

const fetchTemplatesHandler = async (req, res) => {
    const templates = await genericService.fetchTemplates(req);
    res.json(templates);
};

const deleteTemplateHandler = async (req, res) => {
    const response = await genericService.deleteTemplate(req.params.filename+".png");
    res.json(response);
};

module.exports = {
    addTemplateHandler,
    fetchTemplatesHandler,
    deleteTemplateHandler
};