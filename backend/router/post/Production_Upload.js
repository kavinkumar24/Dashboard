const express = require("express");
const xlsx = require("xlsx");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();
const axios = require("axios");
const db = require("../../config/DB/Db");
const formatDateForMySQL = require("../../Helpers/Date_Serialize").formatDateForMySQL;
const excelSerialDateToDate = require("../../Helpers/Date_Serialize").excelSerialDateToDate;
const isDaysValid = require("../../Helpers/Date_Serialize").isDaysValid;


router.post("/production/upload", upload.single("file"), async (req, res) => {
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
      const firstRow = jsonData[0];
      const firstColumnName = Object.keys(firstRow)[0];
      const isJCID = firstColumnName === "JC ID";
      const isJCID2 = firstColumnName === "JCID";

      // Fetch the current date
      const today = new Date().toISOString().split("T")[0];

      // Check for existing uploads for today
      const checkQuery = `
        SELECT unique_fileID FROM Production_sample_data
        WHERE DATE(uploadedDateTime) = ? AND (unique_fileID = 'PROD1' OR unique_fileID = 'PROD2')
      `;

      // Fetch existing uploads for today
      db.query(checkQuery, [today], async (err, existingRecords) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).send("Database error");
        }

        const existingIds = existingRecords.map(record => record.unique_fileID);
        const Prod1Upload = jsonData.some(row => row["unique_fileID"] === "PROD1");
        const Prod2Upload = jsonData.some(row => row["unique_fileID"] === "PROD2");

        // Check if either PROD1 or PROD2 is already uploaded today
        if (existingIds.includes("PROD1") && Prod1Upload) {
          return res.status(400).send("PROD1 data already uploaded for today");
        }

        if (existingIds.includes("PROD2") && Prod2Upload) {
          return res.status(400).send("PROD2 data already uploaded for today");
        }

        // Fetch the latest fileID and unique_fileID
        const fileIdResult = await new Promise((resolve, reject) => {
          db.query("SELECT fileID FROM Production_sample_data ORDER BY fileID DESC LIMIT 1", (err, result) => {
            if (err) return reject(err);
            resolve(result);
          });
        });

        const uniqueFileIdResult = await new Promise((resolve, reject) => {
          db.query("SELECT unique_fileID FROM Production_sample_data ORDER BY unique_fileID DESC LIMIT 1", (err, result) => {
            if (err) return reject(err);
            resolve(result);
          });
        });

        let lastFileId = fileIdResult.length > 0 ? fileIdResult[0].fileID : "PRO0";
        let lastUniqueFileId = uniqueFileIdResult.length > 0 ? uniqueFileIdResult[0].unique_fileID : "PROD0";

        let fileCounter = parseInt(lastFileId.replace("PRO", "")) + 1;
        let newUniqueFileIdNum = parseInt(lastUniqueFileId.replace("PROD", "")) + 1;
        let newUniqueFileId = `PROD${newUniqueFileIdNum}`;

        const values = jsonData.map((row, index) => {
          const inDate = excelSerialDateToDate(row["In Date"]);
          const outDate = excelSerialDateToDate(row["Out Date"]);
          const formattedInDate = formatDateForMySQL(inDate);
          const formattedOutDate = formatDateForMySQL(outDate);

          const newFileId = `PRO${fileCounter++}`;
          const daysValue = row["Days"];
          const daysToInsert = isDaysValid(daysValue) ? parseInt(daysValue) : null;

          if (!isDaysValid(daysValue)) {
            console.warn(`Invalid Days value: '${daysValue}' at row ${index + 1}. It will be set to NULL.`);
          }

          if (isJCID && !(existingIds.includes("PROD1"))) {
            return [
              row["JC ID"],
              row["Brief No"],
              row["PRE-BRIEF NO"],
              row["Sketch No"],
              row["Item ID"],
              row["Purity"],
              row["Empid"],
              row["Ref Empid"],
              row["Name"],
              row["Jwl Type"],
              row["Project"],
              row["Sub Category"],
              row["CW Qty"],
              row["Qty"],
              row["From Dept"],
              row["To Dept"],
              formattedInDate,
              formattedOutDate,
              row["Hours"],
              daysToInsert,
              row["Description"],
              row["Design specification"],
              row["PRODUNITID"],
              row["Remarks"],
              newFileId,
              "PROD1" // for JCID
            ];
          } else if(isJCID2 && !(existingIds.includes("PROD2"))) {
            return [
              row["JCID"],
              row["BRIEFNUM"],
              row["PRE-BRIEFNUM"],
              row["SKETCH NUM"],
              row["ITEMID"],
              row["PURITY"],
              row["EMP-ID"],
              row["REF-EMP-ID"],
              row["NAME"],
              row["JWTYPE"],
              row["PROJECT"],
              row["SUB-CATEGORY"],
              row["RCVCWQTY"],
              row["RCVQTY"],
              row["FROMWH"],
              row["TOWH"],
              formattedInDate,
              formattedOutDate,
              row["Hours"],
              daysToInsert,
              row["DESCRIPTION"],
              row["DESIGNSPECIFICATION"],
              row["PRODUNITID"],
              row["REMARKS"],
              newFileId, // for JCID
              "PROD2"
            ];
          }
        }).filter(value => value);

        const query = `
          INSERT INTO Production_sample_data 
          (\`JC ID\`, \`Brief No\`, \`PRE-BRIEF NO\`, \`Sketch No\`, \`Item ID\`, 
           \`Purity\`, \`Empid\`, \`Ref Empid\`, \`Name\`, \`Jwl Type\`, 
           \`Project\`, \`Sub Category\`, \`CW Qty\`, \`Qty\`, \`From Dept\`, 
           \`To Dept\`, \`In Date\`, \`Out Date\`, \`Hours\`, \`Days\`, 
           \`Description\`, \`Design specification\`, \`PRODUNITID\`, \`Remarks\`, 
           \`fileID\`, \`unique_fileID\`)
          VALUES ?;
        `;

        db.query(query, [values], async (error, results) => {
          if (error) {
            console.error("Database error:", error);
            return res.status(500).send("Database error");
          }

          try {
            const response = await axios.get("http://localhost:8081/api/filtered_production_data/aop");
            const filteredData = response.data;
            const allowedDepartments = ["CAD", "CAM", "MFD", "PD-TEXTURING", "PHOTO"];
            
            // Filter departments that are in the allowed list
            const filteredDataFromAllowed = Object.entries(filteredData).filter(([dept]) => allowedDepartments.includes(dept));
            
            for (const [dept, deptData] of filteredDataFromAllowed) {
              const { projects } = deptData;
              
              for (const [projectName, projectData] of Object.entries(projects)) {
                const { monthname, project_qty } = projectData;
                const weekData = projectData.weeks || {};
                
                for (let i = 1; i <= 4; i++) {
                  const weekKey = `week${i}`;
                  const week_qty = weekData[weekKey]?.week_qty || 0; // Get the week_qty from weekData
                  
                  // Skip weeks with no data
                  if (week_qty > 0) {
                    const query = `
                      INSERT INTO AOP_PLTCODE_Data_Week_wise (PLTCODE1, dept, Week${i}, CreatedAt, Month_data, Completed)
                      VALUES (?, ?, ?, NOW(), ?, ?)
                      ON DUPLICATE KEY UPDATE 
                          Week${i} = VALUES(Week${i}), 
                          CreatedAt = NOW(), 
                          Month_data = VALUES(Month_data),
                          Completed = VALUES(Completed);
                    `;
                    
                    // Insert project_qty as 'Completed' and week_qty for the week's data
                    const params = [projectName, dept, week_qty, monthname, project_qty];
                    
                    db.query(query, params, (err, result) => {
                      if (err) {
                        console.error("Database error:", err);
                        return res.status(500).json({ error: "Database error" });
                      }
                    });
                  }
                }
              }
            }
            
            return res.json({
              message: "File uploaded successfully!",
            });
          } catch (error) {
            console.error("Error fetching or processing data:", error);
            return res.status(500).json({ error: "Error processing data" });
          }
          
        });

      }); // End of db.query callback

    } else {
      res.status(400).send("No data found in Excel file");
    }
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).send("Error processing file");
  }
});



// Helper functions for date conversion and week number extraction
const getWeekNumber = (date) => {
  const day = date.getDate();
  return Math.ceil(day / 7);
};

const derivePltCode = (fromDept, toDept) => {
  return `${fromDept}-${toDept}`;
};

module.exports = router;
