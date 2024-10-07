const express = require("express");
const xlsx = require("xlsx");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();
const db = require("../../config/DB/Db");

// Function to convert Excel serial date to JavaScript Date
function excelSerialDateToDate(serial) {
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  return new Date(excelEpoch.getTime() + serial * 86400000);
}

// Function to format a JavaScript Date to MySQL date format (YYYY-MM-DD)
function formatDateForMySQL(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Function to parse date strings in "DD-MM-YYYY" format
const parseDateString = (dateValue) => {
  if (dateValue instanceof Date) {
    return dateValue;
  }
  return null; // Return null if not a Date object
};

// Function to parse month strings in "MMM-YY" format
const parseMonthString = (monthValue) => {
  if (monthValue instanceof Date) {
    return monthValue;
  }
  return null; // Return null if not a Date object
};

router.post("/order/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const fileBuffer = req.file.buffer;

  try {
    const workbook = xlsx.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { raw: true }); // Keep raw values

    console.log("Parsed JSON Data:", jsonData); // Log parsed data for debugging

    if (jsonData.length > 0) {
      const values = jsonData.map((row) => {
        console.log("Processing row:", row); // Log each row being processed

        const transDate = row["TRANSDATE"];
        const formattedTransDate = transDate ? formatDateForMySQL(transDate) : null;

        const ddDate = parseDateString(row["DD"]); // Now using the Date object directly
        const formattedDdDate = ddDate ? formatDateForMySQL(ddDate) : null;

        const ddMonth = parseMonthString(row["DD&month"]); // Now using the Date object directly
        const formattedDdMonth = ddMonth ? formatDateForMySQL(ddMonth) : null;

        return [
          row["NAME1"],
          row["SUB PARTY"],
          row["Group party"],
          row["JCID"],
          formattedTransDate,
          row["ORDERNO"],
          row["OrderType"],
          row["ZONE"],
          row["OGPG"],
          row["Purity"],
          row["Color"],
          row["PHOTO NO"],
          row["PHOTO NO 2"],
          row["PROJECT"],
          row["TYPE"],
          row["ITEM"],
          row["PRODUCT"],
          row["SUB PRODUCT"],
          row["QTY"],
          row["WT"],
          row["Avg"],
          row["Wt range"],
          row["PL-ST"],
          formattedDdDate,
          row["SKCHNI"],
          row["EMP"],
          row["Name"],
          row["CODE"],
          row["GENDER"],
          row["2024 Set Photo"],
          row["Po-new"],
          formattedDdMonth,
          row["Dyr"],
          row["Brief"],
          row["Maketype"],
          row["collection"],
          row["Collection-1"],
          row["Collection-2"],
        ];
      });

      // Database insertion logic...
      const query = `
        INSERT INTO Order_receiving_log_sample 
        (\`NAME1\`, \`SUB_PARTY\`, \`Group_party\`, \`JCID\`, \`TRANSDATE\`, \`ORDERNO\`,
         \`OrderType\`, \`ZONE\`, \`OGPG\`, \`Purity\`, \`Color\`, \`PHOTO_NO\`,
         \`PHOTO_NO_2\`, \`PROJECT\`, \`TYPE\`, \`ITEM\`, \`PRODUCT\`, \`SUB_PRODUCT\`,
         \`QTY\`, \`WT\`, \`Avg\`, \`Wt_range\`, \`PL_ST\`, \`DD\`, \`SKCHNI\`,
         \`EMP\`, \`Name\`, \`CODE\`, \`GENDER\`, \`2024_Set_Photo\`, \`Po_new\`,
         \`DD_month\`, \`Dyr\`, \`Brief\`, \`Maketype\`, \`collection\`, \`Collection_1\`,
         \`Collection_2\`)
        VALUES ?
      `;

      // Insertion code...

      res.send("File uploaded and order receiving data inserted successfully.");
    } else {
      res.status(400).send("No data found in Excel file");
    }
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).send("Error processing file");
  }
});

module.exports = router;
