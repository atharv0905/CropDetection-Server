/*
    File: modules/CartModule/CartController.js
    Author: Atharv Mirgal, Yash Balotiya
    Desc: This file contains the controllers for the CartModule
    Created: 01-02-2025
    Last Modified: 07-02-2025
*/

// Importing the services
const cartServices = require("./CartServices");

// Function to handle adding to cart
const addToCartHandler = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const { productID, quantity } = req.body;

        if (!token) {
            return res.status(401).json({ success: false, status: 401, message: "Unauthorized: Missing authentication token" });
        }

        if (!productID || !quantity) {
            return res.status(400).json({ success: false, status: 400, message: "Invalid request: Product ID and quantity are required" });
        }

        const result = await cartServices.addToCart(token, productID, quantity);
        return res.status(result.status).json(result);
    } catch (error) {
        console.error("Unexpected error in addToCartHandler:", error);
        return res.status(500).json({ success: false, status: 500, message: "Unexpected error occurred while adding product to cart" });
    }
};

// Function to handle fetching of cart
const fetchCartHandler = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ success: false, status: 401, message: "Unauthorized: Missing authentication token" });
        }

        const result = await cartServices.fetchCart(token);
        return res.status(result.status).json(result);
    } catch (error) {
        console.error("Unexpected error in fetchCartHandler:", error);
        return res.status(500).json({ success: false, status: 500, message: "Unexpected error occurred while retrieving cart details" });
    }
};

// Function to handle updating cart item
const updateCartItemHandler = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const { productID, quantity } = req.body;

        if (!token) {
            return res.status(401).json({ success: false, status: 401, message: "Unauthorized: Missing authentication token" });
        }

        if (!productID || quantity === undefined) {
            return res.status(400).json({ success: false, status: 400, message: "Invalid request: Product ID and quantity are required" });
        }

        const result = await cartServices.updateCartItem(token, productID, quantity);
        return res.status(result.status).json(result);
    } catch (error) {
        console.error("Unexpected error in updateCartItemHandler:", error);
        return res.status(500).json({ success: false, status: 500, message: "Unexpected error occurred while updating cart item" });
    }
};

// Function to handle removing cart item
const removeFromCartHandler = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const { productID } = req.body;

        if (!token) {
            return res.status(401).json({ success: false, status: 401, message: "Unauthorized: Missing authentication token" });
        }

        if (!productID) {
            return res.status(400).json({ success: false, status: 400, message: "Invalid request: Product ID is required" });
        }

        const result = await cartServices.deleteCartItem(token, productID);
        return res.status(result.status).json(result);
    } catch (error) {
        console.error("Unexpected error in removeFromCartHandler:", error);
        return res.status(500).json({ success: false, status: 500, message: "Unexpected error occurred while removing product from cart" });
    }
};

// Exporting the functions
module.exports = {
    addToCartHandler,
    fetchCartHandler,
    updateCartItemHandler,
    removeFromCartHandler
};