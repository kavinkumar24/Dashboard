const express = require("express");
const axios = require("axios");
const xlsx = require("xlsx");
const multer = require("multer");
const db = require("../../config/DB/Db");
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/target/upload", upload.single("file"), async (req, res) => {
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

    // Start a single transaction
    await new Promise((resolve, reject) => {
      db.beginTransaction(async (transactionErr) => {
        if (transactionErr) {
          console.error("Transaction error:", transactionErr);
          return reject("Transaction failed");
        }

        try {
          // Create target table if it doesn't exist
          const createTableQuery = `
            CREATE TABLE IF NOT EXISTS target (
              Project VARCHAR(255),
              Product VARCHAR(255),
              SubProduct VARCHAR(255),
              Total INT
            )
          `;
          await db.query(createTableQuery);

          // Delete existing target data
          const deleteQuery = "DELETE FROM target";
          await db.query(deleteQuery);

          // Insert new data into target
          const insertQuery = `
            INSERT INTO target (Project, Product, SubProduct, Total)
            VALUES ?
          `;
          await db.query(insertQuery, [values]);

          // Fetch target data from external API
          const response = await axios.get("http://localhost:8081/api/targets");
          const targetData = response.data;

          // Group target data by unique Project (PLTCODE)
          const uniqueProjects = groupDataByProject(targetData);

          // Define departments
          const departments = ["CAD", "CAM", "MFD", "PD-TEXTURING", "PHOTO"];

          // Insert into AOP_PLTCODE_Data_Week_wise
          const insertAOPQuery = `
            INSERT INTO AOP_PLTCODE_Data_Week_wise (PLTCODE1, Week1, Week2, Week3, Week4, dept)
            VALUES (?, ?, ?, ?, ?, ?)
          `;
          for (const dept of departments) {
            for (const project of uniqueProjects) {
              await db.query(insertAOPQuery, [project, 0, 0, 0, 0, dept]);
            }
          }

          // Commit the transaction if everything is successful
          db.commit((commitErr) => {
            if (commitErr) {
              console.error("Commit error:", commitErr);
              return db.rollback(() => reject("Error committing transaction"));
            }
            resolve();
          });
        } catch (err) {
          // Rollback the transaction if any error occurs
          console.error("Error in transaction:", err);
          db.rollback(() => reject("Transaction failed"));
        }
      });
    });

    res.send("Target data uploaded and inserted successfully.");
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).send("Error processing file");
  }
});


const groupDataByProject = (data) => {
  const groupedProjects = new Set();

  data.forEach((item) => {
    const { Project } = item;
    groupedProjects.add(Project); // Add unique project names to the Set
  });

  return Array.from(groupedProjects); // Convert the Set back to an array
};

module.exports = router;
