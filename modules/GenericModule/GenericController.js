/*
    File: modules/GenericModule/GenericController.js
    Author: Atharv Mirgal
    Desc: This file contains the controllers for the GenericModule
    Created: 28-01-2025
    Last Modified: 29-01-2025
*/

const genericService = require("./GenericService");

// Handles the addition of a template
const addTemplateHandler = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded!" });
    }
    res.status(200).json({ success: true, message: "Template uploaded successfully", filename: req.file.filename });
};

// Handles the fetching of all templates
const fetchTemplatesHandler = async (req, res) => {
    const templates = await genericService.fetchTemplates(req);
    res.json(templates);
};

// Handles the deletion of a template
const deleteTemplateHandler = async (req, res) => {
    const response = await genericService.deleteTemplate(req.params.filename+".png");
    res.json(response);
};

// Handles the addition of a promotion
const addPromotionHandler = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded!" });
    }
    res.status(200).json({ success: true, message: "Promotion uploaded successfully", filename: req.file.filename });
};

// Handles the fetching of all promotions
const fetchPromotionsHandler = async (req, res) => {
    const templates = await genericService.fetchPromotions(req);
    res.json(templates);
};

// Handles the deletion of a promotion
const deletePromotionHandler = async (req, res) => {
    const response = await genericService.deletePromotion(req.params.filename+".png");
    res.json(response);
};

module.exports = {
    addTemplateHandler,
    fetchTemplatesHandler,
    deleteTemplateHandler,
    addPromotionHandler,
    fetchPromotionsHandler,
    deletePromotionHandler
};