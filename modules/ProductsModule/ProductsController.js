/*
    File: modules/ProductsModule/ProductsController.js
    Author: Atharv Mirgal
    Desc: This file contains the controller methods for the Products module.
    Created: 28-01-2025
    Last Modified: 28-01-2025
*/

const productsService = require("./ProductsService");

const addProductHandler = async (req, res) => {
    const { name, desc, price, category } = req.body;
    const id = req.id;
    const image = id + ".png";

    try {
        const result = await productsService.addProduct(id, name, desc, price, category, image);
        res.json(result);
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

const updateProductHandler = async (req, res) => {
    const { id, name, desc, price, category } = req.body;
    const image = id + ".png";

    try {
        const result = await productsService.updateProduct(id, name, desc, price, category, image);
        res.json(result);
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

module.exports = {
    addProductHandler,
    updateProductHandler
};