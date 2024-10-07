const express = require("express");
const axios = require("axios");
const db = require("../../config/DB/Db");
const router = express.Router();

router.get("/upload_time", async (req, res) => {
    const sqlPending = `SELECT MAX(UploadedDateTime) AS last_upload FROM Pending_sample_data`;
    const sqlProduction = `SELECT MAX(UploadedDateTime) AS last_upload FROM Production_sample_data`; // Ensure casing consistency
  
    try {
      const pendingResults = await new Promise((resolve, reject) => {
        db.query(sqlPending, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
  
      const productionResults = await new Promise((resolve, reject) => {
        db.query(sqlProduction, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
  
      const lastUploadTimePending =
        pendingResults.length > 0 && pendingResults[0].last_upload
          ? new Date(pendingResults[0].last_upload).toLocaleString()
          : "No uploads found for Pending";
  
      const lastUploadTimeProduction =
        productionResults.length > 0 && productionResults[0].last_upload
          ? new Date(productionResults[0].last_upload).toLocaleString()
          : "No uploads found for Production";
  
      return res.json({
        uploadTime_pending: lastUploadTimePending,
        uploadTime_production: lastUploadTimeProduction,
      });
    } catch (err) {
      console.error("Error fetching upload time:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
module.exports = router;
