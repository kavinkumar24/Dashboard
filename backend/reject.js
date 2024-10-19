const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const mysql = require("mysql");
const cors = require("cors");
const moment = require("moment");

const app = express();
const PORT = 5000;
app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage });

// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'excel_data',
// });

const connection = mysql.createConnection({
  host: "172.16.5.233",
  user: "emerald",
  password: "emerald",
  database: "emerald",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
});

const createTableQuery = `CREATE TABLE IF NOT EXISTS rejection (
  file_ID VARCHAR(100),
  Yr VARCHAR(10),
  MONTH VARCHAR(20),
  Date VARCHAR(10),  
  RaisedDate VARCHAR(10),  
  RaisedDept VARCHAR(50),
  ReasonDept VARCHAR(50),
  ToDept VARCHAR(50),
  SketchNo VARCHAR(50),
  JcidNo VARCHAR(50),
  Collections VARCHAR(50),
  TypeOfReason VARCHAR(50),
  ProblemArised VARCHAR(255),
  Problem1 VARCHAR(255),
  ProblemArised2 VARCHAR(255),
  COUNT INT,
  OperatorNameID VARCHAR(50)
);`;

connection.query(createTableQuery, (err) => {
  if (err) {
    console.error("Error creating table:", err);
    return;
  }
});

app.post("/api/rejection/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const fileBuffer = req.file.buffer;
  const fileName = req.file.originalname;
  const file_ID = req.body.file_ID + " " + fileName;

  try {
    const workbook = xlsx.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { raw: false });

    if (jsonData.length > 0) {
      const values = jsonData.map((row) => [
        file_ID,
        row.Yr,
        row.MONTH,
        xlsx.SSF.format("DD-MM-YYYY", row.Date), // Convert Excel serial date to string
        xlsx.SSF.format("DD-MM-YYYY", row["Raised Date"]), // Convert Excel serial date to string
        row.RaisedDept,
        row["Reason Dept"],
        row["To Dept"],
        row["Sketch No"],
        row["Jcid No"],
        row.Collections,
        row["Type of Reason"],
        row["Problem arised"],
        row["Problem - 1"],
        row["Problem arised -2"],
        row.COUNT,
        row["Operator Name/ID"],
      ]);

      const query = `
        INSERT INTO rejection 
        (file_ID, Yr, MONTH, Date, RaisedDate, RaisedDept, ReasonDept, ToDept, SketchNo, JcidNo, Collections, TypeOfReason, ProblemArised, Problem1, ProblemArised2, COUNT, OperatorNameID) 
        VALUES ?`;

      connection.query(query, [values], function (error, results) {
        if (error) throw error;
        console.log("Rows inserted:", results.affectedRows);
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.get("/api/rejection/uploads", (req, res) => {
  const query = "SELECT * FROM rejection";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching uploads:", err);
      res.status(500).send("Error fetching uploads");
      return;
    }
    res.json(results);
  });
});

app.get("/api/rejection/uploads/:fileName", (req, res) => {
  const { fileName } = req.params;
  const query = "SELECT * FROM rejection WHERE file_name = ?";
  connection.query(query, [fileName], (err, results) => {
    if (err) {
      console.error("Error fetching file data:", err);
      res.status(500).send("Error fetching file data");
      return;
    }
    res.json(results);
  });
});

app.delete("/api/rejection/uploads/:fileName", (req, res) => {
  const { fileName } = req.params;
  const query = "DELETE FROM rejection WHERE file_name = ?";
  connection.query(query, [fileName], (err, result) => {
    if (err) {
      console.error("Error deleting file data:", err);
      res.status(500).send("Error deleting file data");
      return;
    }
    console.log("Rows Deleted:", result.affectedRows);
    res.send("File data deleted successfully");
  });
});
