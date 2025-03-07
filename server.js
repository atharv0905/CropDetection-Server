/**
 * File: server.js
 * Author: Atharv Mirgal, Yash Balotiya
 * Description: This is the main express server
 * Created on: 27-1-2025
 * Last Modified: 03-02-2025
 */

const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const http = require("http");
const socketIO = require("socket.io");
const EventEmitter = require("events");
require("dotenv").config();

// Initialize EventEmitter
const appEvents = new EventEmitter();

// PORT and IP
const PORT = process.env.PORT || 3000;
const IP = process.env.IP || "localhost";

// Create Express app
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
    },
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("dev"));

// Clears the console
console.log("\x1Bc");

// Database Initialization
if (process.env.SERVER_ENV === "development") {
    const { initializeDatabase } = require("./configuration/db_dev");

    initializeDatabase()
        .then(() => {
            // console.log("Database initialized successfully.");
            appEvents.emit("dbReady");
        })
        .catch((err) => {
            // console.error("Database initialization failed:", err);
            process.exit(1); // Exit if database initialization fails
        });
} else {
    console.log("Skipping database initialization in non-development environment.");
    appEvents.emit("dbReady");
}

// Route and Socket Initialization
appEvents.on("dbReady", () => {
    console.log("Initializing routes and socket handlers...");

    // Routes
    const productsRoute = require("./modules/ProductsModule/ProductsRoute");
    app.use("/product", productsRoute);

    const genericRoute = require("./modules/GenericModule/GenericRoute");
    app.use("/generic", genericRoute);

    const userRoutes = require("./modules/UserModule/UserRoutes");
    app.use("/user", userRoutes)

    const sellerRoutes = require("./modules/SellerModule/SellerRoutes");
    app.use("/seller", sellerRoutes);

    const cartRoutes = require("./modules/CartModule/CartRoutes");
    app.use("/cart", cartRoutes);

    const profileRoutes = require("./modules/ProfileModule/ProfileRoutes");
    app.use("/profile", profileRoutes);

    const checkoutRoutes = require("./modules/CheckoutModule/CheckoutRoutes");
    app.use("/checkout", checkoutRoutes);
    
    const consultantRoutes = require("./modules/ConsultantModule/ConsultantRoutes");
    app.use("/consultant", consultantRoutes);
    
    app.use("/templates", express.static(path.join(__dirname, "template_images"))); // Serve template images
    app.use("/prodImg", express.static(path.join(__dirname, "product_images"))); // Serve product images
    app.use("/promImgs", express.static(path.join(__dirname, "promotion_images"))); // Serve promotion images
    app.use("/consultantImgs", express.static(path.join(__dirname, "consultant_images"))); // Serve promotion images

    // Start the server
    server.listen(process.env.PORT, process.env.IP, () => {
        console.log(`Server is running on http://${process.env.IP}:${process.env.PORT}`);
    });
});

// Basic Route
app.get("/", (req, res) => {
    res.send("Welcome to the Express Server!");
});
