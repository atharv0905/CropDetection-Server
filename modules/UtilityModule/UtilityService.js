/*
    File: modules/UtilityModule/UtilityService.js
    Author: Atharv Mirgal
    Desc: This file contains all the utility functions needed
    Created: 30-01-2025
    Last Modified: 30-01-2025
*/
const db = require("../../configuration/db");

const sendQuery = async (query, params, error) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (err, result) => {
            if (err) {
                console.error(error, err);
                reject(new Error(error, err));
            } else {
                resolve(result);
            }
        });
    });
};

module.exports = {
    sendQuery
}