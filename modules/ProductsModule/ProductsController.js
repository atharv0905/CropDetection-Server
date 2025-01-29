/*
    File: modules/ProductsModule/ProductsController.js
    Author: Atharv Mirgal
    Desc: This file contains the controller methods for the Products module.
    Created: 28-01-2025
    Last Modified: 29-01-2025
*/

const productsService = require("./ProductsService");

// Function to add a new product
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

// Function to update details of a product
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

// Function to get products by category
const getProductsByCategoryHandler = async (req, res) => {
    const { category } = req.params;

    try {
        const products = await productsService.getProductsByCategory(category);
        res.json(products);
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// Function to get product details by ID
const getProductByIDHandler = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await productsService.getProductById(id);
        res.json(product);
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// Function to fetch all product categories
const fetchProductCategoriesHandler = async (req, res) => {
    try {
        const categories = await productsService.getProductCategories();
        res.json(categories);
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// Function to get recently added products
const getRecentProductsHandler = async (req, res) => {
    try {
        const products = await productsService.getRecentlyAddedProducts();
        res.json(products);
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

module.exports = {
    addProductHandler,
    updateProductHandler,
    getProductsByCategoryHandler,
    getProductByIDHandler,
    fetchProductCategoriesHandler,
    getRecentProductsHandler
};