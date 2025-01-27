/**
 * File: db.js
 * Author: Atharv Mirgal
 * Description: This file is used for mysql database connection and initialization. This file will be only used for development purpose.
 * Created on: 6-1-2025
 * Last Modified: 6-1-2025
 */

const mysql = require("mysql2");
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
});

const initializeDatabase = async () => {
    const dbName = process.env.DATABASE_NAME;
    const sqlFilePath = path.join(__dirname, 'db.sql');

    try {
        // Check if the database exists
        await new Promise((resolve, reject) => {
            db.query(`SHOW DATABASES LIKE ?`, [dbName], (err, results) => {
                if (err) return reject(err);
                if (results.length === 0) {
                    // Create the database if it does not exist
                    db.query(`CREATE DATABASE ??`, [dbName], (err) => {
                        if (err) return reject(err);
                        // console.log(`Database '${dbName}' created.`);
                        resolve();
                    });
                } else {
                    // console.log(`Database '${dbName}' already exists.`);
                    resolve();
                }
            });
        });

        // Use the database
        await new Promise((resolve, reject) => {
            db.query(`USE ??`, [dbName], (err) => {
                if (err) return reject(err);
                // console.log(`Switched to database '${dbName}'.`);
                resolve();
            });
        });

        // Check and create tables if missing
        const sqlCommands = fs.readFileSync(sqlFilePath, 'utf-8').split(';').map(cmd => cmd.trim()).filter(cmd => cmd);

        for (const command of sqlCommands) {
            if (command.toLowerCase().startsWith('create table')) {
                const tableName = command.match(/create table `?(\w+)`?/i)?.[1];
                if (tableName) {
                    await new Promise((resolve, reject) => {
                        db.query(`SHOW TABLES LIKE ?`, [tableName], (err, results) => {
                            if (err) return reject(err);
                            if (results.length === 0) {
                                // console.log(`Creating table: ${tableName}`);
                                db.query(command, (err) => {
                                    if (err) return reject(err);
                                    // console.log(`Table '${tableName}' created.`);
                                    resolve();
                                });
                            } else {
                                // console.log(`Table '${tableName}' already exists.`);
                                resolve();
                            }
                        });
                    });
                }
            }
        }

        console.log('Database initialization complete.');
    } catch (err) {
        console.error('Error during database initialization:', err);
    }
};

module.exports = { db, initializeDatabase };
