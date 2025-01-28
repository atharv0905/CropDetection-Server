/*
    File: modules/ProductsModule/ProductsService.js
    Author: Atharv Mirgal
    Desc: This file contains the service methods for the Products module.
    Created: 28-01-2025
    Last Modified: 28-01-2025
*/

const db = require("../../configuration/db");

// Add a product to the database
const addProduct = async (id, name, desc, price, image) => {
    try{
        const query = "INSERT INTO product (id, name, description, price, image) VALUES (?, ?, ?, ?, ?)";
        await new Promise((resolve, reject) => {
            db.query(query, [id, name, desc, price, image], (err, result) => {
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            });
        });

        return { success: true, message: "Product added successfully" };
    }catch(err){
        return { success: false, message: err.message };
    }
}

// Update product details in the database
const updateProduct = async (id, name, desc, price, image) => {
    try{
        const query = "UPDATE product SET name = ?, description = ?, price = ?, image = ? WHERE id = ?";
        await new Promise((resolve, reject) => {
            db.query(query, [name, desc, price, image, id], (err, result) => {
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            });
        });

        return { success: true, message: "Product updated successfully" };
    }catch(err){
        return { success: false, message: err.message };
    }
};

module.exports = {
    addProduct,
    updateProduct
};