/*
    File: modules/GenericModule/GenericRoute.js
    Author: Atharv Mirgal, Yash Balotiya
    Desc: This file contains the routes for the GenericModule
    Created: 28-01-2025
    Last Modified: 05-02-2025
*/

// Importing the required modules
const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require('fs');
const genericController = require("./GenericController");

// Create template directory if not exists
const templateDir = './template_images';
if (!fs.existsSync(templateDir)) {
    fs.mkdirSync(templateDir);
}

// Multer configuration for templates
const templateStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "template_images/");
    },
    filename: function (req, file, cb) {
        cb(null, req.body.name + ".png");
    },
});

// Multer upload for templates
const templateUpload = multer({ storage: templateStorage });

// Create promotion directory if not exists
const promotionDir = './promotion_images';
if (!fs.existsSync(promotionDir)) {
    fs.mkdirSync(promotionDir);
}

// Multer configuration for promotions
const promotionStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "promotion_images/");
    },
    filename: function (req, file, cb) {
        cb(null, req.body.name + ".png");
    },
});

// Multer upload for promotions
const promotionUpload = multer({ storage: promotionStorage });

// Route to add a template
router.post("/addTemplate", templateUpload.single("image"), genericController.addTemplateHandler); // tested

// Route to fetch all templates
router.get("/fetchTemplates", genericController.fetchTemplatesHandler); // tested

// Route to delete a template
router.delete("/deleteTemplate/:filename", genericController.deleteTemplateHandler); // tested

// Route to add a promotion
router.post("/addPromotion", promotionUpload.single("image"), genericController.addPromotionHandler); // tested

// Route to fetch all promotions
router.get("/fetchPromotions", genericController.fetchPromotionsHandler); // tested

// Route to delete a promotion
router.delete("/deletePromotion/:filename", genericController.deletePromotionHandler); // tested

// Route to store user search history
router.post("/store-search-history", genericController.storeSearchHistoryHandler); // tested

// Route to fetch user search history
router.get("/fetch-search-history/:user_id", genericController.fetchSearchHistoryHandler); // tested

// Exporting the router
module.exports = router;