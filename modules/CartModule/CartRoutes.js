/*
    File: modules/CartModule/CartRoutes.js
    Author: Atharv Mirgal
    Desc: This file contains the routes for the CartModule
    Created: 01-02-2025
    Last Modified: 01-02-2025
*/

const express = require("express");
const router = express.Router();
const cartController = require("./CartController");

router.post("/add-to-cart", cartController.addToCartHandler); // tested

router.get("/fetch-cart", cartController.fetchCartHandler); // tested

router.put("/update-cart-item", cartController.updateCartItemHandler); // tested

router.delete("/remove-cart-item", cartController.removeFromCartHandler); // tested

module.exports = router;