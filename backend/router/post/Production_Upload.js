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
      const lastFileIdQuery =
        "SELECT fileID FROM Production_sample_data ORDER BY fileID DESC LIMIT 1";
      const lastUniqueFileIdQuery =
        "SELECT unique_fileID FROM Production_sample_data ORDER BY unique_fileID DESC LIMIT 1";

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

          let lastFileId = fileIdResult[0]?.fileID || "PRO0";
          let lastUniqueFileId =
            uniqueFileIdResult[0]?.unique_fileID || "PROD0";

          let fileCounter = parseInt(lastFileId.replace("PRO", "")) + 1;
          let newUniqueFileIdNum =
            parseInt(lastUniqueFileId.replace("PROD", "")) + 1;
          let newUniqueFileId = `PROD${newUniqueFileIdNum}`;

          const values = jsonData
            .map((row, index) => {
              const inDate = excelSerialDateToDate(row["In Date"]);
              const outDate = excelSerialDateToDate(row["Out Date"]);
              const formattedInDate = formatDateForMySQL(inDate);
              const formattedOutDate = formatDateForMySQL(outDate);

              const newFileId = `PRO${fileCounter++}`;

              const daysValue = row["Days"];
              const daysToInsert = isDaysValid(daysValue)
                ? parseInt(daysValue)
                : null; // Insert NULL for invalid values

              if (!isDaysValid(daysValue)) {
                console.warn(
                  `Invalid Days value: '${daysValue}' at row ${
                    index + 1
                  }. It will be set to NULL.`
                );
              }

              console.log(
                `Row ${index + 1}: JC ID: ${
                  row["JC ID"] || row["JCID"]
                }, Days: ${daysValue}, Valid: ${isDaysValid(daysValue)}`
              );

              if (Object.keys(row)[0] === "JC ID") {
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
                  daysToInsert, // Use validated daysToInsert
                  row["Description"],
                  row["Design specification"],
                  row["PRODUNITID"],
                  row["Remarks"],
                  newFileId,
                  newUniqueFileId,
                ];
              } else if (Object.keys(row)[0] === "JCID") {
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
                  row["Hours       "],
                  daysToInsert, // Use validated daysToInsert
                  row["DESCRIPTION"],
                  row["DESIGNSPECIFICATION"],
                  row["PRODUNITID"],
                  row["REMARKS"],
                  newFileId,
                  newUniqueFileId,
                ];
              }
            })
            .filter((value) => value); // Filter out any undefined values due to invalid rows

          // Log the values before inserting
          console.log("Inserting values:", values);

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

          db.query(query, [values], function (error, results) {
            if (error) {
              console.error("Database error:", error);
              return res.status(500).send("Database error");
            }
            res.send("File uploaded and new data inserted successfully.");
          });
        });
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
