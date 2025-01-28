/*
    File: modules/GenericModule/GenericRoute.js
    Author: Atharv Mirgal
    Desc: This file contains the routes for the GenericModule
    Created: 28-01-2025
    Last Modified: 28-01-2025
*/

const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require('fs');
const genericController = require("./GenericController");

// Create directory if not exists
const dir = './template_images';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
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

router.post("/addTemplate", templateUpload.single("image"), genericController.addTemplateHandler); // tested

router.get("/fetchTemplates", genericController.fetchTemplatesHandler); // tested

router.delete("/deleteTemplate/:filename", genericController.deleteTemplateHandler); // tested

module.exports = router;