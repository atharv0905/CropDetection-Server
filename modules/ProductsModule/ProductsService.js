/*
    File: modules/ProductsModule/ProductsService.js
    Author: Atharv Mirgal
    Desc: This file contains the service methods for the Products module.
    Created: 28-01-2025
    Last Modified: 28-01-2025
*/

const db = require("../../configuration/db");
const fs = require("fs");
const path = require("path");
dotenv = require("dotenv");

// Add a product to the database
const addProduct = async (id, name, desc, price, category, image) => {
    try {
        const query = "INSERT INTO product (id, name, description, category, price, image) VALUES (?, ?, ?, ?, ?, ?)"; // SQL query to insert a new product

        // Execute the query
        await new Promise((resolve, reject) => {
            db.query(query, [id, name, desc, category, price, image], (err, result) => {
                if (err) {
                    reject(err); // Reject the promise if an error occurs
                } else {
                    resolve(result); // Resolve the promise if the query is successful
                }
            });
        });

        // Return a success message if the product is added successfully
        return { success: true, message: "Product added successfully" };
    } catch (err) {
        // Return an error message if an error occurs
        return { success: false, message: err.message };
    }
}

// Update product details in the database
const updateProduct = async (id, name, desc, price, category, image) => {
    try {
        const query = "UPDATE product SET name = ?, category = ?, description = ?, price = ?, image = ? WHERE id = ?"; // SQL query to update product details

        // Execute the query
        await new Promise((resolve, reject) => {
            db.query(query, [name, category, desc, price, image, id], (err, result) => {
                if (err) {
                    reject(err); // Reject the promise if an error occurs
                } else {
                    resolve(result); // Resolve the promise if the query is successful
                }
            });
        });

        // Return a success message if the product is updated successfully
        return { success: true, message: "Product updated successfully" };
    } catch (err) {
        // Return an error message if an error occurs
        return { success: false, message: err.message };
    }
};

// Fetch products by category and the image URL
const getProductsByCategory = async (category) => {
    try {
        const query = "SELECT id, name, description, price, image FROM product WHERE category = ?"; // SQL query to fetch products by category

        // Execute the query
        const products = await new Promise((resolve, reject) => {
            db.query(query, [category], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        // Add the image URL to each product object
        const productsWithImageURL = products.map((product) => ({
            ...product,
            image_url: `${process.env.BASE_URL}/prodImg/${product.image}`
        }));

        // Return the products with image URL
        return { success: true, products: productsWithImageURL };
    } catch (err) {
        // Return an error message if an error occurs
        return { success: false, message: err.message };
    }
};

// Fetch product details by ID and the image URL
const getProductById = async (id) => {
    try {
        const query = "SELECT name, description, price, image FROM product WHERE id = ?"; // SQL query to fetch product details by ID

        // Execute the query
        const product = await new Promise((resolve, reject) => {
            db.query(query, [id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result[0]);
                }
            });
        });

        // Add the image URL to the product object
        const productWithImageURL = {
            ...product,
            image_url: `${process.env.BASE_URL}/prodImg/${product.image}`
        };

        // Return the product with image URL
        return { success: true, product: productWithImageURL };
    } catch (err) {
        // Return an error message if an error occurs
        return { success: false, message: err.message };
    }
};

module.exports = {
    addProduct,
    updateProduct,
    getProductsByCategory,
    getProductById
};