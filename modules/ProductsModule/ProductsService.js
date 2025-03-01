/*
    File: modules/ProductsModule/ProductsService.js
    Author: Atharv Mirgal, Yash Balotiya
    Desc: This file contains the service methods for the Products module.
    Created: 28-01-2025
    Last Modified: 07-02-2025
*/

const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const redis = require("redis");
const utilityService = require("../UtilityModule/UtilityService");
const stringSimilarity = require("string-similarity");
const { PRODUCT_CATEGORY_CACHE_KEY, NEW_ARRIVALS_CACHE_KEY } = require("../../constants/cache_keys");

// Initialize Redis client
const redisClient = redis.createClient();
redisClient.connect(); // For Redis v4+

// Add a product
const addProduct = async (token, productData) => {
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        productData.seller_id = decoded.id;
        
        const query = `INSERT INTO product 
            (id, seller_id, name, brand_name, title, description, category, cost_price, selling_price, image,
            about_company_line1, about_company_line2, about_company_line3, 
            about_product_line1, about_product_line2, about_product_line3, about_product_line4, quantity) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const values = [
            productData.id, 
            productData.seller_id, 
            productData.name, 
            productData.brand_name, 
            productData.title, 
            productData.desc, 
            productData.category, 
            productData.cost_price, 
            productData.selling_price, 
            productData.images[0],
            productData.about_company_1 || '', 
            productData.about_company_2 || '', 
            productData.about_company_3 || '',
            productData.about_product_1 || '', 
            productData.about_product_2 || '', 
            productData.about_product_3 || '', 
            productData.about_product_4 || '',
            parseInt(productData.quantity)
        ];

        await utilityService.sendQuery(query, values, "Failed to insert product");
        
        if (productData.images.length > 0) {
            const imageQuery = "INSERT INTO product_image (id, product_id, image) VALUES (?, ?, ?)";
            for (const image of productData.images) {
                await utilityService.sendQuery(imageQuery, [uuidv4(), productData.id, image], "Failed to insert product image");
            }
        }

        clearCache(PRODUCT_CATEGORY_CACHE_KEY);
        clearCache(NEW_ARRIVALS_CACHE_KEY);

        return { status: 201, success: true, message: "Product added successfully", result: null };
    } catch (err) {
        return { status: 500, success: false, message: err.message, result: null };
    }
};

const updateProduct = async (token, id, name, brand_name, title, desc, category, cost_price, selling_price, about_company, about_product, images) => {
    try {
        // Decode the token to get the seller ID
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const seller_id = decoded.id;

        // Query to update product details in the database
        const query = `UPDATE product SET 
            name = ?, brand_name = ?, title = ?, description = ?, category = ?, 
            cost_price = ?, selling_price = ?, image = ?,
            about_company_line1 = ?, about_company_line2 = ?, about_company_line3 = ?, 
            about_product_line1 = ?, about_product_line2 = ?, about_product_line3 = ?, about_product_line4 = ? 
            WHERE id = ? AND seller_id = ?`;

        // Extract about_company and about_product arrays from the request body
        const aboutCompany = about_company || [];
        const aboutProduct = about_product || [];

        // Execute the query to update product details
        const res = await utilityService.sendQuery(query, [
            name, brand_name, title, desc, category, cost_price, selling_price, images[0],
            aboutCompany[0] || '', aboutCompany[1] || '', aboutCompany[2] || '',
            aboutProduct[0] || '', aboutProduct[1] || '', aboutProduct[2] || '', aboutProduct[3] || '',
            id, seller_id
        ], "Failed to update product");

        const result = await utilityService.sendQuery(query, values, "Failed to update product");
        if (result.affectedRows === 0) {
            return { status: 404, success: false, message: "Product not found or unauthorized", result: null };
        }

        // Retrieve existing images from DB
        const existingImages = await utilityService.sendQuery("SELECT image FROM product_image WHERE product_id = ?", [id], "Failed to fetch product images");

        // Delete existing images from storage
        existingImages.forEach(({ image }) => {
            const imagePath = path.join("product_images", image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        });

        // Delete existing images from DB
        await utilityService.sendQuery("DELETE FROM product_image WHERE product_id = ?", [id], "Failed to delete product images");

        // Insert new images if provided
        if (images && images.length > 0) {
            const imageQuery = "INSERT INTO product_image (id, product_id, image) VALUES (?, ?, ?)";
            for (const image of images) {
                const imageId = uuidv4();
                await utilityService.sendQuery(imageQuery, [imageId, id, image], "Failed to insert product image");
            }
        }

        clearCache(PRODUCT_CATEGORY_CACHE_KEY);

        return { status: 200, success: true, message: "Product updated successfully", result: null };
    } catch (err) {
        return { status: 500, success: false, message: err.message, result: null };
    }
};

// Fetch products by category and the image URL
const getProductsByCategory = async (category) => {
    try {
        const query = "SELECT id, name, title, description, selling_price, image FROM product WHERE category = ?";
        const products = await utilityService.sendQuery(query, [category], "Failed to fetch products");

        const productsWithImageURL = products.map(product => ({
            ...product,
            image: `${process.env.BASE_URL}/prodImg/${product.image}`
        }));

        return { status: 200, success: true, message: "Products fetched successfully", products: productsWithImageURL };
    } catch (err) {
        return { status: 500, success: false, message: err.message, products: null };
    }
};

// Fetch product details by ID and the image URL
const getProductById = async (id) => {
    try {
        const query = "SELECT * FROM product WHERE id = ?";
        const product = await utilityService.sendQuery(query, [id], "Failed to fetch product");
        if (!product.length) {
            return { status: 404, success: false, message: "Product not found", product: null };
        }
        const imagesQuery = "SELECT image FROM product_image WHERE product_id = ?";
        const images = await utilityService.sendQuery(imagesQuery, [id], "Failed to fetch product images");

        const productWithImageURL = {
            ...product[0],
            image: `${process.env.BASE_URL}/prodImg/${product[0].image}`,
            images: images.map(img => `${process.env.BASE_URL}/prodImg/${img.image}`)
        };

        return { status: 200, success: true, message: "Product fetched successfully", product: productWithImageURL };
    } catch (err) {
        return { status: 500, success: false, message: err.message, product: null };
    }
};

// Fetch all product categories
const getProductCategories = async () => {
    const CACHE_EXPIRATION = 60 * 30; // 30 minutes
    try {
        const CACHE_EXPIRATION = 60 * 30; // 30 minutes
        const cachedCategories = await redisClient.get(PRODUCT_CATEGORY_CACHE_KEY);

        if (cachedCategories) {
            return { status: 200, success: true, message: "Categories fetched successfully (cached)", result: JSON.parse(cachedCategories) };
        }

        const query = "SELECT DISTINCT category FROM product";
        let categories = await utilityService.sendQuery(query, [], "Failed to fetch categories");
        categories = categories.map(category => category.category);

        await redisClient.setEx(PRODUCT_CATEGORY_CACHE_KEY, CACHE_EXPIRATION, JSON.stringify(categories));
        return { status: 200, success: true, message: "Categories fetched successfully", result: categories };
    } catch (err) {
        return { status: 500, success: false, message: err.message, result: null };
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
            // return { success: true, products: JSON.parse(cachedProducts) };
            return { success: true, products: JSON.parse(cachedProducts), message: "Recently added products fetched successfully", status: 200 };
        }

        const query = "SELECT id, name, title, description, selling_price, image FROM product WHERE createdAt >= NOW() - INTERVAL 2 DAY"; // SQL query to fetch recently added products

        // Execute the query
        const products = await utilityService.sendQuery(query, [], "Failed to fetch recently added products");

        // Add the image URL to each product object
        const productsWithImageURL = products.map((product) => ({
            ...product,
            image: `${process.env.BASE_URL}/prodImg/${product.image}`
        }));

        // Store in Redis cache
        await redisClient.setEx(NEW_ARRIVALS_CACHE_KEY, CACHE_EXPIRATION, JSON.stringify(productsWithImageURL));

        // Return the products with image URL
        return { success: true, products: productsWithImageURL, message: "Recently added products fetched successfully", status: 200 };
    } catch (err) {
        // Return an error message if an error occurs
        return { success: false, message: err.message, status: 500 };
    }
};

// Function to clear Redis cache 
const clearCache = async (CACHE_KEY) => {
    try {
        await redisClient.del(CACHE_KEY);
        console.log(`Cleared Redis cache for key: ${CACHE_KEY}`);

        return { success: true, message: "Redis cache cleared successfully", status: 200 };
    } catch (err) {
        console.error("Error clearing Redis cache:", err.message);
        return { success: false, message: err.message, status: 500 };
    }
};

// Function to fetch all products from the database
const fetchProducts = async () => {
    const CACHE_EXPIRATION = 60 * 5; // 5 minutes
    try {
        // Check Redis cache first
        const { ALL_PRODUCTS_CACHE_KEY } = require("../../constants/cache_keys");
        const cachedProducts = await redisClient.get(ALL_PRODUCTS_CACHE_KEY);

        // If cache exists, return the cached products
        if (cachedProducts) {
            console.log("Serving from Redis cache");
            return { success: true, products: JSON.parse(cachedProducts), message: "Products fetched successfully", status: 200 };
        }

        // Fetch products from the database
        const query = "SELECT id, name, title, description, selling_price FROM product";
        const products = await utilityService.sendQuery(query, [], "Failed to fetch products");

        await redisClient.setEx(ALL_PRODUCTS_CACHE_KEY, CACHE_EXPIRATION, JSON.stringify(products));

        // Return the products
        return { success: true, products: products, message: "Products fetched successfully", status: 200 };
    } catch (err) {
        // Return an error message if an error occurs
        console.error("Error fetching products:", err.message);
        return { success: false, message: err.message, status: 500 };
    }
};

// Main function to search for products based on a search term
const searchProducts = async (searchTerm) => {
    try {
        // Fetch all products from the database
        const { products } = await fetchProducts();

        // Ensure products is an array and contains data
        if (!Array.isArray(products) || products.length === 0) {
            return { success: false, message: "No products found", status: 404 };
        }

        // Get product names and descriptions arrays
        const productNames = products.map(p => p.name);
        const productDescriptions = products.map(p => p.description);

        // Ensure searchTerm is a string
        if (typeof searchTerm !== 'string' || searchTerm.trim() === '') {
            return { success: false, message: "Search term should be a non-empty string", status: 400 };
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

            return { success: true, products: bestMatchProducts, message: "Products fetched successfully", status: 200 };
        } else {
            return { success: true, products: products[0], message: "Products fetched successfully", status: 200 };
        }
    } catch (error) {
        // Return an error message if an error occurs
        console.error('Error:', error);
        return { success: false, message: error.message, status: 500 };
    }
};

// Function to show suggested products based on user search history
const suggestProducts = async (userId) => {
    // Import the fetchUserSearchHistory function from the GenericService module
    const { fetchUserSearchHistory } = require('../GenericModule/GenericService');

    try {
        // Fetch the user's search history
        const { success, searchHistory, message } = await fetchUserSearchHistory(userId);

        if (!success) {
            return { success: false, message, status: 500 };
        }

        // Fetch products for each search term
        let suggestedProducts = await Promise.all(searchHistory.map(searchTerm => searchProducts(searchTerm)));

        // flatten the array of arrays
        suggestedProducts = suggestedProducts.map(p => p.products).flat();

        // remove duplicates
        // suggestedProducts = suggestedProducts.filter((product, index, self) =>
        //     index === self.findIndex((p) => (
        //         p.id === product.id
        //     ))
        // );

        // pick random 4 products
        if (suggestedProducts.length == 0) {
            suggestedProducts = [];
        } else {
            suggestedProducts = suggestedProducts.sort(() => Math.random() - 0.5).slice(0, 4);
        }

        return { success: true, suggestedProducts, message: "Suggested products fetched successfully", status: 200 };
    } catch (err) {
        // Return an error message if an error occurs
        console.error('Error suggesting products:', err);
        return { success: false, message: err.message, status: 500 };
    }
};

// Function to update product quantity
const updateProductQuantity = async (productId, seller_id, quantity) => {
    try {
        const query = "UPDATE product SET quantity = ? WHERE id = ? AND seller_id = ?";
        await utilityService.sendQuery(query, [quantity, productId, seller_id], "Failed to update product quantity");
        return { success: true, message: "Product quantity updated successfully", status: 200 };
    } catch (err) {
        return { success: false, message: err.message, status: 500 };
    }
};

// Export the service methods
module.exports = {
    addProduct,
    updateProduct,
    getProductsByCategory,
    getProductById,
    getProductCategories,
    clearCache,
    getRecentlyAddedProducts,
    searchProducts,
    suggestProducts,
    updateProductQuantity
};