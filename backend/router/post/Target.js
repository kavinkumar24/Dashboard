
const express = require("express");
const axios = require("axios");
const xlsx = require("xlsx");
const multer = require("multer");
const db = require("../../config/DB/Db");
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/target/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
  
    const fileBuffer = req.file.buffer;
  
    try {
      const workbook = xlsx.read(fileBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  
      // Expected column names (in the order they should appear)
      const expectedColumns = ["PROJECT-1", "Product", "Sub_Product", "Total"];
  
      // Get the first row (header row) from the Excel file
      const fileHeaders = jsonData[0];
  
      // Check if all required headers are present and match
      const headerMismatch = expectedColumns.filter(
        (col) => !fileHeaders.includes(col)
      );
  
      if (headerMismatch.length > 0) {
        // If there's a mismatch in headers, return an error message to the user
        return res.status(400).send(`
          Attention Please!!! : The following columns are missing or mismatched: 
          ${headerMismatch.join(", ")}. 
          Please correct the column names and try re-uploading the file after refreshing or reloading the current page.
        `);
      }
  
      // Remove the header row and process the data
      const values = jsonData
        .slice(1)
        .map((row) => [
          row[fileHeaders.indexOf("PROJECT-1")],
          row[fileHeaders.indexOf("Product")],
          row[fileHeaders.indexOf("Sub_Product")],
          row[fileHeaders.indexOf("Total")],
        ]);
  
      db.beginTransaction((transactionErr) => {
        if (transactionErr) {
          console.error("Transaction error:", transactionErr);
          return res.status(500).send("Transaction failed");
        }
  
        // Create the 'target' table if it doesn't exist
        const createTableQuery = `
          CREATE TABLE IF NOT EXISTS target (
            Project VARCHAR(255),
            Product VARCHAR(255),
            SubProduct VARCHAR(255),
            Total INT
            
          )
        `;
  
        db.query(createTableQuery, (createTableErr) => {
          if (createTableErr) {
            db.rollback(() => {
              console.error("Create table error:", createTableErr);
              return res.status(500).send("Error creating target table");
            });
          }
  
          // Delete existing data in the 'target' table
          const deleteQuery = "DELETE FROM target";
          db.query(deleteQuery, (deleteErr) => {
            if (deleteErr) {
              db.rollback(() => {
                console.error("Delete error:", deleteErr);
                return res.status(500).send("Error deleting old target data");
              });
            }
  
            // Insert new data into the 'target' table
            const insertQuery = `
              INSERT INTO target (Project, Product, SubProduct, Total)
              VALUES ?
            `;
  
            db.query(insertQuery, [values], (insertErr, results) => {
              if (insertErr) {
                db.rollback(() => {
                  console.error("Insert error:", insertErr);
                  return res.status(500).send("Error inserting new target data");
                });
              }
  
              db.commit((commitErr) => {
                if (commitErr) {
                  db.rollback(() => {
                    console.error("Commit error:", commitErr);
                    return res.status(500).send("Error committing transaction");
                  });
                }
  
                res.send("Target data uploaded and inserted successfully.");
              });
            });
          });
        });
      });
    } catch (error) {
      console.error("Error processing file:", error);
      res.status(500).send("Error processing file");
    }
  });

  module.exports = router;