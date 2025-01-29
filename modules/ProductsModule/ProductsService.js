/*
    File: modules/ProductsModule/ProductsService.js
    Author: Atharv Mirgal
    Desc: This file contains the service methods for the Products module.
    Created: 28-01-2025
    Last Modified: 29-01-2025
*/

const db = require("../../configuration/db");
const redis = require("redis");
const { promisify } = require("util");
const stringSimilarity = require('string-similarity');
const levenshtein = require('fast-levenshtein');
const { console } = require("inspector");
const e = require("cors");
dotenv = require("dotenv");

// Initialize Redis client
const redisClient = redis.createClient();
redisClient.connect(); // For Redis v4+

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

        const { PRODUCT_CATEGORY_CACHE_KEY, NEW_ARRIVALS_CACHE_KEY } = require("../../constants/cache_keys");
        clearCache(PRODUCT_CATEGORY_CACHE_KEY); // Clear Redis cache for product categories
        clearCache(NEW_ARRIVALS_CACHE_KEY); // Clear Redis cache for new arrivals

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

        const { PRODUCT_CATEGORY_CACHE_KEY } = require("../../constants/cache_keys");
        clearCache(PRODUCT_CATEGORY_CACHE_KEY); // Clear Redis cache for product categories

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
            image: `${process.env.BASE_URL}/prodImg/${product.image}`
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

        const categories = await new Promise((resolve, reject) => {
            db.query(query, (err, result) => {
                if (err) reject(err);
                else resolve(result.map(row => row.category)); // Extract categories
            });
        });

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

        const query = "SELECT id, name, description, price, image FROM product WHERE createdAt >= NOW() - INTERVAL 2 DAY"; // SQL query to fetch recently added products

        // Execute the query
        const products = await new Promise((resolve, reject) => {
            db.query(query, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        // randomly select any 7 products
        const randomProducts = products.sort(() => Math.random() - 0.5).slice(0, 7);

        // Add the image URL to each product object
        const productsWithImageURL = randomProducts.map((product) => ({
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

        const query = "SELECT id, name, description, price FROM product";
        const products = await new Promise((resolve, reject) => {
            db.query(query, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

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