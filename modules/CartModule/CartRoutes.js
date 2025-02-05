/*
    File: modules/CartModule/CartRoutes.js
    Author: Atharv Mirgal
    Desc: This file contains the routes for the CartModule
    Created: 01-02-2025
    Last Modified: 05-02-2025
*/

// Importing express and the controller
const express = require("express");
const router = express.Router();
const cartController = require("./CartController");

// Route for adding to cart
router.post("/add-to-cart", cartController.addToCartHandler); // tested

// Route for fetching cart
router.get("/fetch-cart", cartController.fetchCartHandler); // tested

// Route for updating cart item
router.put("/update-cart-item", cartController.updateCartItemHandler); // tested

// Route for removing cart item
router.delete("/remove-cart-item", cartController.removeFromCartHandler); // tested

// Exporting the router
module.exports = router;