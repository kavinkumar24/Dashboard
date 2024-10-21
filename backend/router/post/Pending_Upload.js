const express = require("express");
const xlsx = require("xlsx");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();
const db = require("../../config/DB/Db");
const formatDateForMySQL =
  require("../../Helpers/Date_Serialize").formatDateForMySQL;
const excelSerialDateToDate =
  require("../../Helpers/Date_Serialize").excelSerialDateToDate;
const isDaysValid = require("../../Helpers/Date_Serialize").isDaysValid;



  


router.post("/pending/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const fileBuffer = req.file.buffer;
  try {
    const workbook = xlsx.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (jsonData.length === 0) {
      return res.status(400).send("No data found in Excel file.");
    }

    // Fetch the latest fileID
    const lastFileIdQuery = "SELECT fileID FROM Pending_sample_data ORDER BY fileID DESC LIMIT 1";

    db.query(lastFileIdQuery, (err, fileIdResult) => {
      if (err) {
        console.error("Error fetching fileID:", err);
        return res.status(500).send("Database error");
      }

      let lastFileId = fileIdResult[0]?.fileID || "PEND0";
      let fileCounter = parseInt(lastFileId.replace("PEND", "")) + 1;

      const today = new Date().toISOString().split('T')[0];

      // Check for existing records for today
      const checkQuery = `
        SELECT unique_fileID FROM Pending_sample_data
        WHERE DATE(uploadedDateTime) = ? AND (unique_fileID = 'PENDING1' OR unique_fileID = 'PENDING2')
      `;

      db.query(checkQuery, [today], (err, existingRecords) => {
        if (err) {
          console.error("Database error:", err.message);
          return res.status(500).send("Database error");
        }

        const existingIds = existingRecords.map(record => record.unique_fileID);
        
        // Check if PENDING1 or PENDING2 exists for today
        const pending1Exists = existingIds.includes("PENDING1");
        const pending2Exists = existingIds.includes("PENDING2");

        // Check for uploads in jsonData
        const pending1InUpload = jsonData.some(row => row["unique_fileID"] === "PENDING1");
        const pending2InUpload = jsonData.some(row => row["unique_fileID"] === "PENDING2");

        // Return error if either already exists and an attempt to upload that type is made
        if (pending1Exists && pending1InUpload) {
          return res.status(400).send("Record for PENDING1 already exists for today.");
        }
        if (pending2Exists && pending2InUpload) {
          return res.status(400).send("Record for PENDING2 already exists for today.");
        }

        // Prepare values for insertion
        const values = [];
        
        jsonData.forEach(row => {
          const newFileId = `PEND${fileCounter++}`;
          if (Object.keys(row)[0] === "TOWH1" && !pending2Exists) {
            // Ensure only one PENDING2 upload
            values.push([
              row["TOWH1"],
              row["JCID"],
              row["BRIEFNUM"],
              row["MERCHANDISERBRIEF"],
              row["SKETCHNUM"],
              row["ITEMID"],
              row["PERSONNELNUMBER"],
              row["NAME"],
              row["PLTCODE"],
              row["PURITY"],
              row["ARTICLECODE"],
              row["COMPLEXITY"],
              row["RCVCWQTY"],
              row["RCVQTY"],
              null,
              row["dd"],
              row["Textbox39"],
              row["Textbox42"],
              row["DESIGNSPEC"],
              null,
              null,
              row["RCVCWQTY2"],
              row["RCVQTY2"],
              newFileId,
              'PENDING2',
              new Date(),
            ]);
          } else if (Object.keys(row)[0] === "TODEPT" && !pending1Exists) {
            // Ensure only one PENDING1 upload
            values.push([
              row["TODEPT"],
              row["JCID1"],
              row["BRIEFNUM1"],
              row["MERCHANDISERBRIEF1"],
              row["SKETCHNUM1"],
              row["ITEMID"],
              row["PERSONNELNUMBER1"],
              row["NAME1"],
              row["PLTCODE1"],
              row["PURITY1"],
              row["ARTICLECODE1"],
              row["COMPLEXITY1"],
              row["JCPDSCWQTY1"],
              row["JCQTY1"],
              null,
              row["Textbox56"],
              row["Textbox87"],
              row["Textbox60"],
              row["DESIGNSPEC1"],
              row["RECEIVED1"],
              null,
              row["REMARKS1"],
              row["HALLMARKINCERTCODE1"],
              newFileId,
              'PENDING1',
              new Date(),
            ]);
          }
        });

        // Proceed if there are values to insert
        if (values.length > 0) {
          const query = `INSERT INTO Pending_sample_data 
            (\`TODEPT\`, \`JCID1\`, \`BRIEFNUM1\`, \`MERCHANDISERBRIEF1\`, \`SKETCHNUM1\`, 
             \`ITEMID\`, \`PERSONNELNUMBER1\`, \`NAME1\`, \`PLTCODE1\`, \`PURITY1\`, 
             \`ARTICLECODE1\`, \`COMPLEXITY1\`, \`JCPDSCWQTY1\`, \`JCQTY1\`, 
             \`DATE1\`, \`Textbox56\`, \`Textbox87\`, \`Textbox60\`, \`DESIGNSPEC1\`, 
             \`RECEIVED1\`, \`RECVDATE1\`, \`REMARKS1\`, \`HALLMARKINCERTCODE1\`, 
             \`fileID\`, \`unique_fileID\`, \`uploadedDateTime\`)
            VALUES ?`;

          // Log the values for debugging
          console.log("Inserting values:", values);

          db.query(query, [values], (error, results) => {
            if (error) {
              console.error("Database error:", error.message);
              return res.status(500).send("Database error");
            }
            return res.send("Pending file uploaded and data inserted successfully.");
          });
        } else {
          return res.status(400).send("No valid data to insert.");
        }
      });
    });
  } catch (error) {
    console.error("Error processing file:", error);
    return res.status(500).send("Error processing file.");
  }
});







module.exports = router;
