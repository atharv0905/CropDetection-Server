/*
    File: modules/ProductsModule/ProductsService.js
    Author: Atharv Mirgal
    Desc: This file contains the service methods for the Products module.
    Created: 28-01-2025
    Last Modified: 29-01-2025
*/

const redis = require("redis");
const stringSimilarity = require('string-similarity');
const utilityService = require("../UtilityModule/UtilityService");
const { v4: uuidv4 } = require("uuid");
dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

// Initialize Redis client
const redisClient = redis.createClient();
redisClient.connect(); // For Redis v4+

// Add a product to the database
const addProduct = async (token, id, name, brand_name, title, desc, category, cost_price, selling_price, about_company, about_product, images) => {
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const seller_id = decoded.id;
        const query = `INSERT INTO product 
            (id, seller_id, name, brand_name, title, description, category, cost_price, selling_price, image,
            about_company_line1, about_company_line2, about_company_line3, 
            about_product_line1, about_product_line2, about_product_line3, about_product_line4, quantity) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const aboutCompany = about_company || [];
        const aboutProduct = about_product || [];

        // Execute the query to insert product details
        await utilityService.sendQuery(query, [
            id, seller_id, name, brand_name, title, desc, category, cost_price, selling_price, images[0], 
            aboutCompany[0] || '', aboutCompany[1] || '', aboutCompany[2] || '',
            aboutProduct[0] || '', aboutProduct[1] || '', aboutProduct[2] || '', aboutProduct[3] || '', 0
        ], "Inserting product failed");

        // Insert images if provided
        if (images && images.length > 0) {
            const imageQuery = "INSERT INTO product_image (id, product_id, image) VALUES (?, ?, ?)";
            for (const image of images) {
                const imageId = uuidv4();
                await utilityService.sendQuery(imageQuery, [imageId, id, image], "Inserting product image failed");
            }
        }

        const { PRODUCT_CATEGORY_CACHE_KEY, NEW_ARRIVALS_CACHE_KEY } = require("../../constants/cache_keys");
        clearCache(PRODUCT_CATEGORY_CACHE_KEY);
        clearCache(NEW_ARRIVALS_CACHE_KEY);

        return { success: true, message: "Product added successfully" };
    } catch (err) {
        return { success: false, message: err.message };
    }
};

// Update product details in the database
const fs = require("fs");
const path = require("path");

const updateProduct = async (token, id, name, brand_name, title, desc, category, cost_price, selling_price, about_company, about_product, images) => {
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const seller_id = decoded.id;
        const query = `UPDATE product SET 
            name = ?, brand_name = ?, title = ?, description = ?, category = ?, 
            cost_price = ?, selling_price = ?, image = ?,
            about_company_line1 = ?, about_company_line2 = ?, about_company_line3 = ?, 
            about_product_line1 = ?, about_product_line2 = ?, about_product_line3 = ?, about_product_line4 = ? 
            WHERE id = ? AND seller_id = ?`; 
        
        const aboutCompany = about_company || [];
        const aboutProduct = about_product || [];

        // Execute the query to update product details
        const res = await utilityService.sendQuery(query, [
            name, brand_name, title, desc, category, cost_price, selling_price, images[0],
            aboutCompany[0] || '', aboutCompany[1] || '', aboutCompany[2] || '',
            aboutProduct[0] || '', aboutProduct[1] || '', aboutProduct[2] || '', aboutProduct[3] || '',
            id, seller_id
        ]);

        // Retrieve existing images from DB
        const existingImages = await utilityService.sendQuery("SELECT image FROM product_image WHERE product_id = ?", [id]);
        
        // Delete existing images from storage
        existingImages.forEach(({ image }) => {
            const imagePath = path.join("product_images", image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        });
        
        // Delete existing images from DB
        await utilityService.sendQuery("DELETE FROM product_image WHERE product_id = ?", [id]);
        
        // Insert new images if provided
        if (images && images.length > 0) {
            const imageQuery = "INSERT INTO product_image (id, product_id, image) VALUES (?, ?, ?)";
            for (const image of images) {
                const imageId = uuidv4(); 
                await utilityService.sendQuery(imageQuery, [imageId, id, image]);
            }
        }
        
        const { PRODUCT_CATEGORY_CACHE_KEY } = require("../../constants/cache_keys");
        clearCache(PRODUCT_CATEGORY_CACHE_KEY);

        return { success: true, message: "Product updated successfully" };
    } catch (err) {
        return { success: false, message: err.message };
    }
};

// Fetch products by category and the image URL
const getProductsByCategory = async (category) => {
    try {
        const query = "SELECT id, name, title, description, selling_price, image FROM product WHERE category = ?"; // SQL query to fetch products by category

        // Execute the query
        const products = await utilityService.sendQuery(query, [category]);

        // Add the image URL to each product object
        const productsWithImageURL = products.map((product) => ({
            ...product,
            image: `${process.env.BASE_URL}/prodImg/${product.image}`
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
        const query = "SELECT * FROM product WHERE id = ?"; // SQL query to fetch product details by ID
        let product = await utilityService.sendQuery(query, [id]);

        const imagesQuery = "SELECT image FROM product_image WHERE product_id = ?"; // SQL query to fetch product images by ID
        const images = await utilityService.sendQuery(imagesQuery, [id]);

        product = product[0];

        // Ensure 'images' is an array before using map
        const imagesArray = Array.isArray(images) ? images : [];
        const productWithImageURL = {
            ...product,
            image: `${process.env.BASE_URL}/prodImg/${product.image}`,
            images: imagesArray.map((img) => `${process.env.BASE_URL}/prodImg/${img.image}`)
        };

        // Return the product with image URL
        return { success: true, product: productWithImageURL };
    } catch (err) {
        // Return an error message if an error occurs
        return { success: false, message: err.message };
    }
};

// Fetch all product categories
const getProductCategories = async () => {
    const CACHE_EXPIRATION = 60 * 30; // 30 minutes
    try {
        // Check Redis cache first
        const { PRODUCT_CATEGORY_CACHE_KEY } = require("../../constants/cache_keys");
        const cachedCategories = await redisClient.get(PRODUCT_CATEGORY_CACHE_KEY);

        if (cachedCategories) {
            console.log("Serving from Redis cache");
            return { success: true, categories: JSON.parse(cachedCategories) };
        }

        // Fetch from database if cache is empty
        const query = "SELECT DISTINCT category FROM product";

        let categories = await utilityService.sendQuery(query);

        // Extract the category names from the result
        categories = categories.map((category) => category.category);
        // Store in Redis cache
        await redisClient.setEx(PRODUCT_CATEGORY_CACHE_KEY, CACHE_EXPIRATION, JSON.stringify(categories));

        return { success: true, categories };
    } catch (err) {
        return { success: false, message: err.message };
    }
};

// Get top 7 recently added products
const getRecentlyAddedProducts = async () => {
    const CACHE_EXPIRATION = 60 * 5; // 5 minutes
    try {
        const { NEW_ARRIVALS_CACHE_KEY } = require("../../constants/cache_keys");
        const cachedProducts = await redisClient.get(NEW_ARRIVALS_CACHE_KEY);

        if (cachedProducts) {
            console.log("Serving from Redis cache");
            return { success: true, products: JSON.parse(cachedProducts) };
        }

        const query = "SELECT id, name, title, description, selling_price, image FROM product WHERE createdAt >= NOW() - INTERVAL 2 DAY"; // SQL query to fetch recently added products

        // Execute the query
        const products = await utilityService.sendQuery(query);

        // Add the image URL to each product object
        const productsWithImageURL = products.map((product) => ({
            ...product,
            image: `${process.env.BASE_URL}/prodImg/${product.image}`
        }));

        // Store in Redis cache
        await redisClient.setEx(NEW_ARRIVALS_CACHE_KEY, CACHE_EXPIRATION, JSON.stringify(productsWithImageURL));

        // Return the products with image URL
        return { success: true, products: productsWithImageURL };
    } catch (err) {
        // Return an error message if an error occurs
        return { success: false, message: err.message };
    }
};

// Function to clear Redis cache 
const clearCache = async (CACHE_KEY) => {
    try {
        await redisClient.del(CACHE_KEY);
        console.log(`Cleared Redis cache for key: ${CACHE_KEY}`);
    } catch (err) {
        console.error("Error clearing Redis cache:", err.message);
    }
};

// Function to fetch all products from the database
const fetchProducts = async () => {
    const CACHE_EXPIRATION = 60 * 5; // 5 minutes
    try {
        const { ALL_PRODUCTS_CACHE_KEY } = require("../../constants/cache_keys");
        const cachedProducts = await redisClient.get(ALL_PRODUCTS_CACHE_KEY);

        if (cachedProducts) {
            console.log("Serving from Redis cache");
            return { success: true, products: JSON.parse(cachedProducts) };
        }

        const query = "SELECT id, name, title, description, selling_price FROM product";
        const products = await utilityService.sendQuery(query);

        await redisClient.setEx(ALL_PRODUCTS_CACHE_KEY, CACHE_EXPIRATION, JSON.stringify(products));
        return { success: true, products: products };
    } catch (err) {
        console.error("Error fetching products:", err.message);
        return { success: false, message: err.message };
    }
};

// Main function to search for products based on a search term
const searchProducts = async (searchTerm) => {
    try {
        // Fetch all products from the database
        const { products } = await fetchProducts();

        // Ensure products is an array and contains data
        if (!Array.isArray(products) || products.length === 0) {
            throw new Error('No products found');
        }

        // Get product names and descriptions arrays
        const productNames = products.map(p => p.name);
        const productDescriptions = products.map(p => p.description);

        // Ensure searchTerm is a string
        if (typeof searchTerm !== 'string' || searchTerm.trim() === '') {
            throw new Error('Search term should be a non-empty string');
        }

        // Combine both names and descriptions for better match
        const combinedStrings = productNames.concat(productDescriptions);

        // Use string-similarity to find the best match
        if (combinedStrings.length > 1) {
            let bestMatches = stringSimilarity.findBestMatch(searchTerm, combinedStrings);
            bestMatches = bestMatches.ratings.filter(r => r.rating > 0.06).sort((a, b) => b.rating - a.rating);

            const bestMatchProducts = bestMatches.map(match => {
                const index = combinedStrings.indexOf(match.target);
                return {
                    id: products[index].id,
                    name: products[index].name,
                    description: products[index].description,
                    price: products[index].price,
                    image: `${process.env.BASE_URL}/prodImg/${products[index].id}.png`
                };
            });

            return { success: true, products: bestMatchProducts };
        } else {
            return { success: true, products: products[0] };
        }
    } catch (error) {
        console.error('Error:', error);
        return { success: false, message: error.message };
    }
};

// Function to show suggested products based on user search history
const suggestProducts = async (userId) => {
    const { fetchUserSearchHistory } = require('../GenericModule/GenericService');

    try {
        const { success, searchHistory, message } = await fetchUserSearchHistory(userId);

        if (!success) {
            return { success: false, message };
        }

        let suggestedProducts = await Promise.all(searchHistory.map(searchTerm => searchProducts(searchTerm)));

        // flatten the array of arrays
        suggestedProducts = suggestedProducts.map(p => p.products).flat();

        // remove duplicates
        suggestedProducts = suggestedProducts.filter((product, index, self) =>
            index === self.findIndex((p) => (
                p.id === product.id
            ))
        );

        // pick random 4 products
        suggestedProducts = suggestedProducts.sort(() => Math.random() - 0.5).slice(0, 4);

        return { success: true, suggestedProducts };
    } catch (err) {
        console.error('Error suggesting products:', err);
        return { success: false, message: err.message };
    }
};

module.exports = {
    addProduct,
    updateProduct,
    getProductsByCategory,
    getProductById,
    getProductCategories,
    clearCache,
    getRecentlyAddedProducts,
    searchProducts,
    suggestProducts
};