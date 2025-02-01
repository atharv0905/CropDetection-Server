/*
    File: modules/CartModule/CartController.js
    Author: Atharv Mirgal
    Desc: This file contains the controllers for the CartModule
    Created: 01-02-2025
    Last Modified: 01-02-2025
*/

const cartServices = require("./CartServices");

const addToCartHandler = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const productID = req.body.productID;
        const quantity = req.body.quantity;
        const result = await cartServices.addToCart(token, productID, quantity);
        if (result.success) {
            res.status(200).send(result);
        } else {
            res.status(500).send(result);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, message: "Failed to add product to cart" });
    }
};

// Function to handle fetching of cart
const fetchCartHandler = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const result = await cartServices.fetchCart(token);
        if (result.success) {
            res.status(200).send(result);
        } else {
            res.status(500).send(result);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, message: "Failed to fetch cart" });
    }
};

const updateCartItemHandler = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const productID = req.body.productID;
        const quantity = req.body.quantity;
        const result = await cartServices.updateCartItem(token, productID, quantity);
        if (result.success) {
            res.status(200).send(result);
        } else {
            res.status(500).send(result);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, message: "Failed to update cart item" });
    }
};

const removeFromCartHandler = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const productID = req.body.productID;
        const result = await cartServices.deleteCartItem(token, productID);
        if (result.success) {
            res.status(200).send(result);
        } else {
            res.status(500).send(result);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, message: "Failed to remove product from cart" });
    }
};

module.exports = {
    addToCartHandler,
    fetchCartHandler,
    updateCartItemHandler,
    removeFromCartHandler
};