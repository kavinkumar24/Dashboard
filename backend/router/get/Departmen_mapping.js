const express = require("express");
const db = require("../../config/DB/Db");
const router = express.Router();


router.get("/department-mappings", (req, res) => {
    const sql = "SELECT * FROM Production_master_deparment_mapping";
    db.query(sql, (err, rows) => {
      if (err) return res.json(err);
  
      // Transform the data into the desired format
      const result = {};
  
      rows.forEach((row) => {
        const groupWh = row["Group Wh"];
        if (!result[groupWh]) {
          result[groupWh] = { from: [], to: [] };
        }
        if (
          row["From Dept"] &&
          !result[groupWh].from.includes(row["From Dept"])
        ) {
          result[groupWh].from.push(row["From Dept"]);
        }
        if (row["To Dept"] && !result[groupWh].to.includes(row["To Dept"])) {
          result[groupWh].to.push(row["To Dept"]);
        }
      });
  
      res.json(result);
    });
  });

  module.exports = router
