/*
    File: modules/ProductsModule/ProductsRoute.js
    Author: Atharv Mirgal
    Desc: This file contains the routes for the Products module.
    Created: 28-01-2025
    Last Modified: 29-01-2025
*/

const express = require("express");
const router = express.Router();
const multer = require("multer");
const uuid = require("uuid");
const fs = require('fs');
const productsController = require("./ProductsController");

// Create directory if not exists
const dir = './product_images';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

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

// Route for adding new product
router.post("/add", (req, res, next) => {
    req.id = uuid.v4();
    next();
}, upload.single("image"), productsController.addProductHandler); // tested

// Route for updating details of a product
router.put("/update", upload.single("image"), productsController.updateProductHandler); // tested

// Route for getting products by category
router.get("/category/:category", productsController.getProductsByCategoryHandler); // tested

// Route for getting product details by ID
router.get("/id/:id", productsController.getProductByIDHandler); // tested

// Route for getting all product categories
router.get("/categories", productsController.fetchProductCategoriesHandler); // tested

router.get("/new-arrivals", productsController.getRecentProductsHandler); // tested
 
module.exports = router;