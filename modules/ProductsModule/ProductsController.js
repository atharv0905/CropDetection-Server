/*
    File: modules/ProductsModule/ProductsController.js
    Author: Atharv Mirgal, Yash Balotiya
    Desc: This file contains the controller methods for the Products module.
    Created: 28-01-2025
    Last Modified: 05-02-2025
*/

// Importing the services
const productsService = require("./ProductsService");
const jwt = require('jsonwebtoken');

// Function to add a new product
const addProductHandler = async (req, res) => {
    // Extract the required fields from the request body
    const { name, brand_name, title, desc, category, cost_price, selling_price, about_company, about_product } = req.body;
    const id = req.id;
    const token = req.headers['authorization'].replace('Bearer ', '');

    // Extract multiple image filenames
    const images = req.files ? req.files.map(file => file.filename) : [];

    try {
        // Call the service to add the product
        const result = await productsService.addProduct(token,
            id, name, brand_name, title, desc, category, cost_price, selling_price,
            about_company, about_product, images
        );

        // Send the response
        if (result.success) {
            return res.status(200).json({ data: result, success: true, message: "Product added successfully" });
        } else {
            return res.status(500).json({ success: false, message: "Failed to add product" });
        }
    } catch (err) {
        // Handle errors
        console.error(err);
        res.json({ success: false, message: err.message });
    }
};

// Function to update details of a product
const updateProductHandler = async (req, res) => {
    // Extract the required fields from the request body
    const { id, name, brand_name, title, desc, category, cost_price, selling_price, about_company, about_product } = req.body;
    req.id = id;

    // Extract the token from the request headers
    const token = req.headers['authorization'].replace('Bearer ', '');
    
    // Extract multiple image filenames
    const images = req.files ? req.files.map(file => file.filename) : [];

    try {
        // Call the service to update the product
        const result = await productsService.updateProduct(token,
            id, name, brand_name, title, desc, category, cost_price, selling_price,
            about_company, about_product, images
        );

        // Send the response
        if (result.success) {
            return res.status(200).json({ data: result, success: true, message: "Product updated successfully" });
        } else {
            return res.status(500).json({ success: false, message: "Failed to update product" });
        }
    } catch (err) {
        // Handle errors
        console.error(err);
        res.json({ success: false, message: err.message });
    }
};

// Function to get products by category
const getProductsByCategoryHandler = async (req, res) => {
    // Extract the category from the request parameters
    const { category } = req.params;

    try {
        // Call the service to get products by category
        const result = await productsService.getProductsByCategory(category);

        // Send the response
        if (!result.success) {
            return res.status(404).json({ success: false, message: "No products found" });
        } else {
            return res.status(200).json({ data: result.products, success: true, message: "Products fetched successfully" });
        }
    } catch (err) {
        // Handle errors
        console.error(err);
        res.json({ success: false, message: err.message });
    }
};

// Function to get product details by ID
const getProductByIDHandler = async (req, res) => {
    // Extract the product ID from the request parameters
    const { id } = req.params;

    try {
        // Call the service to get product by ID
        const result = await productsService.getProductById(id);

        // Send the response
        if (!result.success) {
            return res.status(404).json({ success: false, message: "Product not found" });
        } else {
            return res.status(200).json({ data: result.product, success: true, message: "Product fetched successfully" });
        }
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// Function to fetch all product categories
const fetchProductCategoriesHandler = async (req, res) => {
    try {
        // Call the service to get product categories
        const result = await productsService.getProductCategories();

        // Send the response
        if (!result.success) {
            return res.status(404).json({ success: false, message: "No categories found" });
        } else {
            return res.status(200).json({ data: result, success: true, message: "Categories fetched successfully" });
        }
    } catch (err) {
        // Handle errors
        console.error(err);
        res.json({ success: false, message: err.message });
    }
};

// Function to get recently added products
const getRecentProductsHandler = async (req, res) => {
    try {
        // Call the service to get recently added products
        const result = await productsService.getRecentlyAddedProducts();

        // Send the response
        if (!result.success) {
            return res.status(404).json({ success: false, message: "No products found" });
        } else {
            return res.status(200).json({ data: result.products, success: true, message: "Products fetched successfully" });
        }
    } catch (err) {
        // Handle errors
        console.error(err);
        res.json({ success: false, message: err.message });
    }
};

// Function to search products 
const searchProductsHandler = async (req, res) => {
    // Extract the name from the request parameters
    const { name } = req.params;

    try {
        // Call the service to search
        const result = await productsService.searchProducts(name);

        // Send the response
        if (!result.success) {
            return res.status(404).json({ success: false, message: "No products found" });
        } else {
            return res.status(200).json({ data: result.products, success: true, message: "Products fetched successfully" });
        }
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// Function to get suggested products
const suggestedProductsHandler = async (req, res) => {
    // Extract the product ID from the request parameters
    const { id } = req.params;

    try {
        // Call the service to get suggested products
        const result = await productsService.suggestProducts(id);

        // Send the response
        if (!result.success) {
            return res.status(404).json({ success: false, message: "No products found" });
        } else {
            return res.status(200).json({ data: result, success: true, message: "Products fetched successfully" });
        }
    } catch (err) {
        // Handle errors
        console.error(err);
        res.json({ success: false, message: err.message });
    }
};

// Function to update product quantity
const updateProductQuantityHandler = async (req, res) => {
    const { id, quantity } = req.body;
    const token = req.headers['authorization'].replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const seller_id = decoded.id;

    try {
        const result = await productsService.updateProductQuantity(id, seller_id, quantity);
        res.json(result);
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// Exporting the functions
module.exports = {
    addProductHandler,
    updateProductHandler,
    getProductsByCategoryHandler,
    getProductByIDHandler,
    fetchProductCategoriesHandler,
    getRecentProductsHandler,
    searchProductsHandler,
    suggestedProductsHandler,
    updateProductQuantityHandler
};