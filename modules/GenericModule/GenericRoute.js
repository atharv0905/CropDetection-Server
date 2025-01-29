/*
    File: modules/GenericModule/GenericRoute.js
    Author: Atharv Mirgal
    Desc: This file contains the routes for the GenericModule
    Created: 28-01-2025
    Last Modified: 29-01-2025
*/

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
        cb(null, req.body.name+".png");
    },
});

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
        cb(null, req.body.name+".png");
    },
});

const promotionUpload = multer({ storage: promotionStorage });

router.post("/addTemplate", templateUpload.single("image"), genericController.addTemplateHandler); // tested

router.get("/fetchTemplates", genericController.fetchTemplatesHandler); // tested

router.delete("/deleteTemplate/:filename", genericController.deleteTemplateHandler); // tested

router.post("/addPromotion", promotionUpload.single("image"), genericController.addPromotionHandler); // tested

router.get("/fetchPromotions", genericController.fetchPromotionsHandler); // tested

router.delete("/deletePromotion/:filename", genericController.deletePromotionHandler); // tested

router.post("/store-search-history", genericController.storeSearchHistoryHandler); // tested

router.get("/fetch-search-history/:user_id", genericController.fetchSearchHistoryHandler); // tested

module.exports = router;