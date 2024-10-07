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

  router.post("/api/design_center/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
  
    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;
  
    try {
      const workbook = xlsx.read(fileBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet);
  
      if (jsonData.length > 0) {
        const values = jsonData.map((row) => {
          const documentDate = excelSerialDateToDate(row["Document date"]);
          const deadlineDate = excelSerialDateToDate(row["Deadline date"]);
          const receivedDate = excelSerialDateToDate(row["Received date"]);
          const completedDate = excelSerialDateToDate(row["Completed"]);
  
          // Format dates for MySQL
          const formattedDocumentDate = formatDateForMySQL(documentDate);
          const formattedDeadlineDate = formatDateForMySQL(deadlineDate);
          const formattedReceivedDate = formatDateForMySQL(receivedDate);
          const formattedCompletedDate = formatDateForMySQL(completedDate);
  
          return [
            row["Brief number"],
            row["Pre-Brief"],
            row["Employe id"],
            row["Employe Name"],
            row["Design center"],
            row["Design specification"],
            row["Jewel sub type"],
            row["Sub category"],
            row["Jewel type"],
            formattedDocumentDate,
            row["Design type"],
            row["Minimum Weight"],
            row["Maximum Weight"],
            row["No Of Design"],
            formattedDeadlineDate,
            row["Confirmed"],
            row["Received"],
            row["Received by"],
            formattedReceivedDate,
            formattedCompletedDate,
            row["Created by"],
            row["Created date and time"],
          ];
        });
  
        const query = `
        INSERT INTO design_center_task_sample 
        (\`Brief number\`, \`Pre-Brief\`, \`Employe id\`, \`Employe Name\`, 
         \`Design center\`, \`Design specification\`, \`Jewel sub type\`, 
         \`Sub category\`, \`Jewel type\`, \`Document date\`, \`Design type\`, 
         \`Minimum Weight\`, \`Maximum Weight\`, \`No Of Design\`, 
         \`Deadline date\`, \`Confirmed\`, \`Received\`, \`Received by\`, 
         \`Received date\`, \`Completed\`, \`Created by\`, \`Created date and time\`)
        VALUES ?
      `;
  
        db.query(query, [values], function (error, results, fields) {
          if (error) {
            console.error("Database error:", error);
            return res.status(500).send("Database error");
          }
          res.send("File uploaded and data inserted successfully.");
        });
      } else {
        res.status(400).send("No data found in Excel file");
      }
    } catch (error) {
      console.error("Error processing file:", error);
      res.status(500).send("Error processing file");
    }
  });

module.exports = router;