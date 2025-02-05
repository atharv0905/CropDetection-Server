/*
    File: modules/CartModule/CartController.js
    Author: Atharv Mirgal, Yash Balotiya
    Desc: This file contains the controllers for the CartModule
    Created: 01-02-2025
    Last Modified: 05-02-2025
*/

// Importing the services
const cartServices = require("./CartServices");

// Function to handle adding to cart
const addToCartHandler = async (req, res) => {
    try {
        // Extracting the token, productID and quantity from the request
        const token = req.headers.authorization.split(" ")[1];
        const productID = req.body.productID;
        const quantity = req.body.quantity;
        
        // Calling the service to add the product to the cart
        const result = await cartServices.addToCart(token, productID, quantity);
        
        // Sending the response
        if (result.success) {
            res.status(200).send(result);
        } else {
            res.status(500).send(result);
        }
    } catch (err) {
        // Handling errors
        console.error(err);
        res.status(500).send({ success: false, message: "Failed to add product to cart" });
    }
};

// Function to handle fetching of cart
const fetchCartHandler = async (req, res) => {
    try {
        // Extracting the token from the request
        const token = req.headers.authorization.split(" ")[1];

        // Calling the service to fetch the cart
        const result = await cartServices.fetchCart(token);

        // Sending the response
        if (result.success) {
            res.status(200).send(result);
        } else {
            res.status(500).send(result);
        }
    } catch (err) {
        // Handling errors
        console.error(err);
        res.status(500).send({ success: false, message: "Failed to fetch cart" });
    }
};

// Function to handle updating cart item
const updateCartItemHandler = async (req, res) => {
    try {
        // Extracting the token, productID and quantity from the request
        const token = req.headers.authorization.split(" ")[1];
        const productID = req.body.productID;
        const quantity = req.body.quantity;

        // Calling the service to update the cart item
        const result = await cartServices.updateCartItem(token, productID, quantity);

        // Sending the response
        if (result.success) {
            res.status(200).send(result);
        } else {
            res.status(500).send(result);
        }
    } catch (err) {
        // Handling errors
        console.error(err);
        res.status(500).send({ success: false, message: "Failed to update cart item" });
    }
};

// Function to handle removing cart item
const removeFromCartHandler = async (req, res) => {
    try {
        // Extracting the token and productID from the request
        const token = req.headers.authorization.split(" ")[1];
        const productID = req.body.productID;

        // Calling the service to remove the cart item
        const result = await cartServices.deleteCartItem(token, productID);

        // Sending the response
        if (result.success) {
            res.status(200).send(result);
        } else {
            res.status(500).send(result);
        }
    } catch (err) {
        // Handling errors
        console.error(err);
        res.status(500).send({ success: false, message: "Failed to remove product from cart" });
    }
};

// Exporting the functions
module.exports = {
    addToCartHandler,
    fetchCartHandler,
    updateCartItemHandler,
    removeFromCartHandler
};