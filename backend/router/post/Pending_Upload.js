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
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet);
  
      if (jsonData.length > 0) {
        // Fetch the latest fileID and unique_fileID from Pending_sample_data
        const lastFileIdQuery =
          "SELECT fileID FROM Pending_sample_data ORDER BY fileID DESC LIMIT 1";
        const lastUniqueFileIdQuery =
          "SELECT unique_fileID FROM Pending_sample_data ORDER BY unique_fileID DESC LIMIT 1";
  
        db.query(lastFileIdQuery, (err, fileIdResult) => {
          if (err) {
            console.error("Error fetching fileID:", err);
            return res.status(500).send("Database error");
          }
  
          db.query(lastUniqueFileIdQuery, (err, uniqueFileIdResult) => {
            if (err) {
              console.error("Error fetching unique_fileID:", err);
              return res.status(500).send("Database error");
            }
  
            // Fetch the latest fileID and unique_fileID
            let lastFileId = fileIdResult[0]?.fileID || "PEND0";
            let lastUniqueFileId =
              uniqueFileIdResult[0]?.unique_fileID || "PENDING0";
  
            // Increment fileID for each row and unique_fileID for the entire upload
            let fileCounter = parseInt(lastFileId.replace("PEND", "")) + 1;
            let newUniqueFileIdNum =
              parseInt(lastUniqueFileId.replace("PENDING", "")) + 1;
            let newUniqueFileId = `PENDING${newUniqueFileIdNum}`;
  
            const values = jsonData.map((row) => {
              const recvdDate = excelSerialDateToDate(row["RECVDATE1"]);
              let formattedRecvdDate = formatDateForMySQL(recvdDate);
              if (formattedRecvdDate === "1899-12-30 00:00:00") {
                formattedRecvdDate = null;
              }
  
              const date1 = excelSerialDateToDate(row["DATE1"]);
              let formattedDate1 = formatDateForMySQL(date1);
              if (formattedDate1 === "1899-12-31 00:00:00") {
                formattedDate1 = null;
              }
  
              const newFileId = `PEND${fileCounter++}`;
  
              if (Object.keys(row)[0] === "TOWH1") {
                return [
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
                  newUniqueFileId, // Same unique_fileID for all rows in the file
                  new Date(),
                ];
              } else {
                return [
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
                  newUniqueFileId, // Same unique_fileID for all rows in the file
                  new Date(),
                ];
              }
            });
  
            const query = `INSERT INTO Pending_sample_data 
              (\`TODEPT\`, \`JCID1\`, \`BRIEFNUM1\`, \`MERCHANDISERBRIEF1\`, \`SKETCHNUM1\`, 
               \`ITEMID\`, \`PERSONNELNUMBER1\`, \`NAME1\`, \`PLTCODE1\`, \`PURITY1\`, 
               \`ARTICLECODE1\`, \`COMPLEXITY1\`, \`JCPDSCWQTY1\`, \`JCQTY1\`, 
               \`DATE1\`, \`Textbox56\`, \`Textbox87\`, \`Textbox60\`, \`DESIGNSPEC1\`, 
               \`RECEIVED1\`, \`RECVDATE1\`, \`REMARKS1\`, \`HALLMARKINCERTCODE1\`, 
               \`fileID\`, \`unique_fileID\`, \`uploadedDateTime\`)
              VALUES ? `;
  
            db.query(query, [values], function (error, results) {
              if (error) {
                console.error("Database error:", error);
                return res.status(500).send("Database error");
              }
              res.send("Pending file uploaded and data inserted successfully.");
            });
          });
        });
      } else {
        res.status(400).send("No data found in Excel file.");
      }
    } catch (error) {
      console.error("Error processing file:", error);
      res.status(500).send("Error processing file.");
    }
  });

module.exports = router;
