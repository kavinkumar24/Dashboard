const express = require("express");
const xlsx = require("xlsx");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();
const db = require("../../config/DB/Db");

// Function to convert Excel serial date to JavaScript Date
function excelSerialDateToDate(serial) {
  const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // Excel starts counting from 1900-01-01
  return new Date(excelEpoch.getTime() + serial * 86400000); // 86400000 ms in a day
}

// Function to format a JavaScript Date to MySQL date format (YYYY-MM-DD)
function formatDateForMySQL(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Function to parse date strings in "DD-MM-YYYY" format
const parseDateString = (dateString) => {
  if (typeof dateString !== "string") return null; // Ensure it's a string
  const parts = dateString.split("-");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Months are 0-based
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return null; // Return null for invalid format
};

// Function to parse month strings in "MMM-YY" format
const parseMonthString = (monthString) => {
  if (typeof monthString === "string") {
    const [month, year] = monthString.split("-");
    const monthIndex = new Date(Date.parse(month + " 1, 2021")).getMonth();
    return new Date(2000 + parseInt(year, 10), monthIndex, 1); // Returns the first of the month
  }
  return null;
};

function formatDateToMMMYY(date) {
  const options = { month: "short", year: "2-digit" };
  return new Intl.DateTimeFormat("en-US", options)
    .format(date)
    .replace(/\s/g, "-"); // Format and replace space with hyphen
}

function convertMMMYYToDateString(mmmYY) {
  const [monthAbbr, year] = mmmYY.split("-");
  const monthMap = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };

  const month = monthMap[monthAbbr];
  const fullYear = `20${year}`; // Assuming YY is in the 2000s

  // Constructing the final date string
  return `${fullYear}-${month}-01 00:00:00.000000`;
}

// Example usage
const inputDate = "Aug-22";
const outputDate = convertMMMYYToDateString(inputDate);
console.log(outputDate); // Output: "2022-08-01 00:00:00.000000"

router.post("/order/upload", upload.single("file"), (req, res) => {
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
      const values = jsonData.map((row) => {
        const transDate = row["TRANSDATE"];
        const formattedTransDate =
          transDate != null
            ? formatDateForMySQL(excelSerialDateToDate(transDate))
            : null;

        const ddValue = row["DD"];
        let formattedDdDate = null;

        if (typeof ddValue === "number") {
          const ddDate = excelSerialDateToDate(ddValue); // Convert Excel serial date to Date
          formattedDdDate = formatDateForMySQL(ddDate); // Format it for MySQL
        } else if (typeof ddValue === "string") {
          const parsedDate = parseDateString(ddValue); // For string formats like "DD-MM-YYYY"
          formattedDdDate = parsedDate ? formatDateForMySQL(parsedDate) : null;
        }

        const parseDdAndMonth = (value) => {
          if (typeof value === "string") {
            console.log("String value:", value);
            return parseMonthString(value); // Use existing function for string format
          } else if (typeof value === "number") {
            // console.log("Number value:", value);
            const date = excelSerialDateToDate(value); // Convert Excel serial date
            return convertMMMYYToDateString(formatDateToMMMYY(date)); // Return formatted "MMM-YY"
          }
          return null;
        };

        // Get the ddMonth formatted as "MMM-YY"
        const formattedDdMonth = parseDdAndMonth(row["DD&month"]);

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
          formattedDdMonth, // This is now a string in "MMM-YY" format
          row["Dyr"],
          row["Brief"],
          row["Maketype"],
          row["collection"],
          row["Collection-1"],
          row["Collection-2"],
          null,
          new Date().toISOString().slice(0, 19).replace("T", " "),
        ];
      });

      const query = `
      INSERT INTO Order_receiving_log_sample 
      (\`NAME1\`, \`SUB PARTY\`, \`Group party\`, \`JCID\`, \`TRANSDATE\`, \`ORDERNO\`,
       \`OrderType\`, \`ZONE\`, \`OGPG\`, \`Purity\`, \`Color\`, \`PHOTO NO\`,
       \`PHOTO NO 2\`, \`PROJECT\`, \`TYPE\`, \`ITEM\`, \`PRODUCT\`, \`SUB PRODUCT\`,
       \`QTY\`, \`WT\`, \`Avg\`, \`Wt range\`, \`PL-ST\`, \`DD\`, \`SKCHNI\`,
       \`EMP\`, \`Name\`, \`CODE\`, \`GENDER\`, \`2024_Set_Photo\`, \`Po_new\`,
       \`DD&month\`, \`Dyr\`, \`Brief\`, \`Maketype\`, \`collection\`, \`Collection_1\`,
       \`Collection_2\`,fileId , uploadedDateTime)
      VALUES ?
    `;

      const batchSize = 10000;
      let index = 0;

      const insertNextBatch = () => {
        if (index < values.length) {
          const batch = values.slice(index, index + batchSize);
          db.query(query, [batch], (error, results) => {
            if (error) {
              console.error("Database error:", error);
              return res.status(500).send("Database error");
            }
            index += batchSize;
            insertNextBatch(); // Recursively call to insert the next batch
          });
        } else {
          res.send(
            "File uploaded and order receiving data inserted successfully."
          );
        }
      };

      insertNextBatch(); // Start the recursive batch insertion

      // Continue with your database insertion logic...
    } else {
      res.status(400).send("No data found in Excel file");
    }
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).send("Error processing file");
  }
});

module.exports = router;
