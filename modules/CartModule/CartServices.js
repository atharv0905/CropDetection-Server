/*
    File: modules/CartModule/CartServices.js
    Author: Atharv Mirgal
    Desc: This file contains the services for the CartModule
    Created: 01-02-2025
    Last Modified: 07-02-2025
*/

const { sendQuery } = require("../../modules/UtilityModule/UtilityService");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
require('dotenv').config();

// Function to add a product to the cart
const addToCart = async (token, productID, quantity) => {
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userID = decoded.id;

        // Check if the cart exists
        const fetchCartQuery = `SELECT id FROM cart WHERE user_id = ?`;
        let cart = await sendQuery(fetchCartQuery, [userID], "Error retrieving cart");

        // If no cart exists, create one
        let cartID;
        if (cart.length === 0) {
            cartID = uuidv4();
            const createCartQuery = `INSERT INTO cart (id, user_id) VALUES (?, ?)`;
            await sendQuery(createCartQuery, [cartID, userID], "Error creating new cart");
        } else {
            cartID = cart[0].id;
        }

        // Add product to cart
        const id = uuidv4();
        const addProductQuery = `INSERT INTO cart_item (id, cart_id, product_id, quantity) VALUES (?, ?, ?, ?)`;
        await sendQuery(addProductQuery, [id, cartID, productID, quantity], "Error adding product to cart");

        return { success: true, status: 201, message: "Product added to cart successfully" };
    } catch (err) {
        console.error("Error in addToCart:", err);
        return { success: false, status: 500, message: "An error occurred while adding the product to the cart" };
    }
};

// Function to fetch the cart
const fetchCart = async (token) => {
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userID = decoded.id;

        const fetchQuery = `SELECT * FROM cart_summary WHERE user_id = ?`;
        const result = await sendQuery(fetchQuery, [userID], "Error retrieving cart details");

        if (result.length === 0) {
            return { success: false, status: 404, message: "Cart not found for the user" };
        }

        return { success: true, status: 200, message: "Cart fetched successfully", data: result };
    } catch (err) {
        console.error("Error in fetchCart:", err);
        return { success: false, status: 500, message: "An error occurred while fetching the cart" };
    }
};

// Function to update a cart item
const updateCartItem = async (token, productID, quantity) => {
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userID = decoded.id;

        // If quantity is 0 or negative, remove the item
        if (quantity <= 0) {
            return await deleteCartItem(token, productID);
        }

        const updateQuery = `
            UPDATE cart_item 
            SET quantity = ? 
            WHERE product_id = ? AND cart_id = (SELECT id FROM cart WHERE user_id = ?)
        `;
        const result = await sendQuery(updateQuery, [quantity, productID, userID], "Error updating cart item");

        if (result.affectedRows === 0) {
            return { success: false, status: 404, message: "Product not found in cart" };
        }

        return { success: true, status: 200, message: "Cart item updated successfully" };
    } catch (err) {
        console.error("Error in updateCartItem:", err);
        return { success: false, status: 500, message: "An error occurred while updating the cart item" };
    }
};

// Function to delete a cart item
const deleteCartItem = async (token, productID) => {
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userID = decoded.id;

        const deleteQuery = `
            DELETE FROM cart_item 
            WHERE product_id = ? AND cart_id = (SELECT id FROM cart WHERE user_id = ?)
        `;
        const result = await sendQuery(deleteQuery, [productID, userID], "Error deleting cart item");

        if (result.affectedRows === 0) {
            return { success: false, status: 404, message: "Product not found in cart" };
        }

        return { success: true, status: 200, message: "Cart item deleted successfully" };
    } catch (err) {
        console.error("Error in deleteCartItem:", err);
        return { success: false, status: 500, message: "An error occurred while removing the product from the cart" };
    }
};

module.exports = {
    addToCart,
    fetchCart,
    updateCartItem,
    deleteCartItem
};