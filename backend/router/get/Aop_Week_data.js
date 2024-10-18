const express = require("express");
const axios = require("axios");
const db = require("../../config/DB/Db");
const router = express.Router();

router.post("/Aop_week_data", async (req, res) => {
    try {
        // Fetch filtered production data
        const response = await axios.get("http://localhost:8081/api/filtered_production_data");
        const filteredData = response.data;

        // Allowed departments
        const allowedDepartments = ["CAD", "CAM", "MFD", "PD-TEXTURING", "PHOTO"];

        // Filter the data to only include allowed departments
        const filteredDataFromAllowed = Object.entries(filteredData).filter(([dept]) => 
            allowedDepartments.includes(dept)
        );

        // Loop through the filtered data and prepare SQL for inserting/updating
        for (const [dept, deptData] of filteredDataFromAllowed) {
            const { projects } = deptData;

            for (const [projectName, projectData] of Object.entries(projects)) {
                const { total_qty, Week_count } = projectData;
                
                // Check if the record for this PLTCODE1 and dept exists in the database
                const query = `
                    INSERT INTO AOP_PLTCODE_Data_Week_wise (PLTCODE1, dept, Week${Week_count}, CreatedAt)
                    VALUES (?, ?, ?, NOW())
                    ON DUPLICATE KEY UPDATE Week${Week_count} = Week${Week_count} + ?, CreatedAt = NOW()
                `;

                // Replace PLTCODE1 with the project name for this case
                const params = [projectName, dept, total_qty, total_qty];

                // Execute the query
                db.query(query, params, (err, result) => {
                    if (err) {
                        console.error("Database error:", err);
                        return res.status(500).json({ error: "Database error" });
                    }
                });
            }
        }

        // Send success response
        return res.json({ message: "Week-wise data successfully stored" });

    } catch (error) {
        console.error("Error fetching or processing data:", error);
        return res.status(500).json({ error: "Error processing data" });
    }
});

module.exports = router;



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
                  : null;
  
                if (!isDaysValid(daysValue)) {
                  console.warn(
                    `Invalid Days value: '${daysValue}' at row ${
                      index + 1
                    }. It will be set to NULL.`
                  );
                }
  
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
                    daysToInsert,
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
                    daysToInsert,
                    row["DESCRIPTION"],
                    row["DESIGNSPECIFICATION"],
                    row["PRODUNITID"],
                    row["REMARKS"],
                    newFileId,
                    newUniqueFileId,
                  ];
                }
              })
              .filter((value) => value);
  
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
                const response = await axios.get(
                  "http://localhost:8081/api/filtered_production_data"
                );
                const filteredData = response.data;
                const allowedDepartments = [
                  "CAD",
                  "CAM",
                  "MFD",
                  "PD-TEXTURING",
                  "PHOTO",
                ];
                const filteredDataFromAllowed = Object.entries(
                  filteredData
                ).filter(([dept]) => allowedDepartments.includes(dept));
  
                for (const [dept, deptData] of filteredDataFromAllowed) {
                  const { projects } = deptData;
  
                  for (const [projectName, projectData] of Object.entries(
                    projects
                  )) {
                    const { total_qty, Week_count } = projectData;
  
                    const query = `
                        INSERT INTO AOP_PLTCODE_Data_Week_wise (PLTCODE1, dept, Week${Week_count}, CreatedAt)
                        VALUES (?, ?, ?, NOW())
                        ON DUPLICATE KEY UPDATE Week${Week_count} = Week${Week_count} + ?, CreatedAt = NOW()
                      `;
  
                    const params = [projectName, dept, total_qty, total_qty];
  
                    db.query(query, params, (err, result) => {
                      if (err) {
                        console.error("Database error:", err);
                        return res.status(500).json({ error: "Database error" });
                      }
                    });
                  }
                }
  
                return res.json({
                  message: "Week-wise data successfully stored",
                });
              } catch (error) {
                console.error("Error fetching or processing data:", error);
                return res.status(500).json({ error: "Error processing data" });
              }
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