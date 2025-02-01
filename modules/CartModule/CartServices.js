/*
    File: modules/CartModule/CartServices.js
    Author: Atharv Mirgal
    Desc: This file contains the services for the CartModule
    Created: 01-02-2025
    Last Modified: 01-02-2025
*/
const { sendQuery } = require("../../modules/UtilityModule/UtilityService");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
require('dotenv').config();

const addToCart = async(token, productID, quantity) => {
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userID = decoded.id;

        const fetchCartQuery = `SELECT id FROM cart WHERE user_id = ?`;
        const cartID = await sendQuery(fetchCartQuery, [userID], "Failed to fetch cart");

        if (cartID.length === 0) {
            const createCartQuery = `INSERT INTO cart (id, user_id) VALUES (?, ?)`;
            const id = uuidv4();
            await sendQuery(createCartQuery, [id, userID], "Failed to create cart");
        };

        const id = uuidv4();
        const addProductQuery = `INSERT INTO cart_item (id, cart_id, product_id, quantity) VALUES (?, ?, ?, ?)`;
        await sendQuery(addProductQuery, [id, cartID[0].id, productID, quantity], "Failed to add product to cart");

        return { success: true, message: "Product added to cart successfully" };
    } catch (err) {
        console.error(err);
        return { success: false, message: "Failed to add product to cart" };
    }
}

const fetchCart = async(token) => {
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userID = decoded.id;
        const fetchQuery = `SELECT * FROM cart_summary WHERE user_id = ?`;
        const result = await sendQuery(fetchQuery, [userID], "Failed to fetch cart");
        return { success: true, message: "Cart fetched successfully", cart: result };
    } catch (err) {
        console.error(err);
        return { success: false, message: "Failed to fetch cart" };
    }
};

const updateCartItem = async(token, productID, quantity) => {
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userID = decoded.id;
        if(quantity <= 0) {
            deleteCartItem(token, productID);
        }
        const updateQuery = `UPDATE cart_item SET quantity = ? WHERE product_id = ? AND cart_id = (SELECT id FROM cart WHERE user_id = ?)`;
        await sendQuery(updateQuery, [quantity, productID, userID], "Failed to update cart item");
        return { success: true, message: "Cart item updated successfully" };
    } catch (err) {
        console.error(err);
        return { success: false, message: "Failed to update cart item" };
    }
};

const deleteCartItem = async(token, productID) => {
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userID = decoded.id;
        const deleteQuery = `DELETE FROM cart_item WHERE product_id = ? AND cart_id = (SELECT id FROM cart WHERE user_id = ?)`;
        await sendQuery(deleteQuery, [productID, userID], "Failed to delete cart item");
        return { success: true, message: "Cart item deleted successfully" };
    } catch (err) {
        console.error(err);
        return { success: false, message: "Failed to delete cart item" };
    }
};

module.exports = {
    addToCart,
    fetchCart,
    updateCartItem,
    deleteCartItem
};