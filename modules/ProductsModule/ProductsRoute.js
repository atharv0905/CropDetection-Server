/*
    File: modules/ProductsModule/ProductsRoute.js
    Author: Atharv Mirgal, Yash Balotiya
    Desc: This file contains the routes for the Products module.
    Created: 28-01-2025
    Last Modified: 05-02-2025
*/

// Importing the required modules
const express = require("express");
const router = express.Router();
const multer = require("multer");
const uuid = require("uuid");
const fs = require('fs');
const productsController = require("./ProductsController");
const sellerController = require("../SellerModule/SellerController");

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
        const originalName = file.originalname.replace(/\.[^/.]+$/, ""); // Remove extension
        const id = req.id || req.body.id;
        const filename = id + "_" + originalName + ".png"; // Append original name and .png
        cb(null, filename);
    },
});

// Multer instance
const upload = multer({ storage: storage });

// Route for adding new product (Supports Multiple Images)
router.post("/add", (req, res, next) => {
    req.id = uuid.v4();
    next();
}, upload.array("images", 5), sellerController.verifyAccessToken, productsController.addProductHandler); // Accepts up to 5 images


// Route for updating details of a product
router.put("/update", upload.array("images", 5), productsController.updateProductHandler); // tested

// Route for getting products by category
router.get("/category/:category", productsController.getProductsByCategoryHandler); // tested

// Route for getting product details by ID
router.get("/id/:id", productsController.getProductByIDHandler); // tested

// Route for getting all product categories
router.get("/categories", productsController.fetchProductCategoriesHandler); // tested

// Route for getting new arrivals
router.get("/new-arrivals", productsController.getRecentProductsHandler); // tested

// Route for getting products by name search
router.get("/search/:name", productsController.searchProductsHandler); // tested

// Route for getting suggested products
router.get("/suggested-products/:id", productsController.suggestedProductsHandler); // tested

// Route for updating product quantity
router.put("/update-quantity", sellerController.verifyAccessToken, productsController.updateProductQuantityHandler); // tested

// Exporting the router
module.exports = router;