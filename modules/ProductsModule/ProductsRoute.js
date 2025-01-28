/*
    File: modules/ProductsModule/ProductsRoute.js
    Author: Atharv Mirgal
    Desc: This file contains the routes for the Products module.
    Created: 28-01-2025
    Last Modified: 28-01-2025
*/

const express = require("express");
const router = express.Router();
const multer = require("multer");
const uuid = require("uuid");
const productsController = require("./ProductsController");

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "product_images/");
    },
    filename: function (req, file, cb) {
        const filename = req.id ? req.id + ".png" : req.body.id ? req.body.id + ".png" : "default.png";
        cb(null, filename);
    },
});

const upload = multer({ storage: storage });

router.post("/add", (req, res, next) => {
    req.id = uuid.v4();
    next();
}, upload.single("image"), productsController.addProductHandler); // tested

router.put("/update", upload.single("image"), productsController.updateProductHandler); // tested
 
module.exports = router;