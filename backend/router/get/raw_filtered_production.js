const express = require("express");
const axios = require("axios");
const db = require("../../config/DB/Db");
const router = express.Router();
router.get("/raw_filtered_production_data", async (req, res) => {
    const response = await axios.get("http://localhost:8081/api/department-mappings");
    const departmentMapping = response.data;
    const deptFromFilter = Object.values(departmentMapping).flatMap(
      (mapping) => mapping.from
    );
    const deptToFilter = Object.values(departmentMapping).flatMap(
      (mapping) => mapping.to
    );
  
    const sql = `
           SELECT \`From Dept\`,\`To Dept\`, \`CW Qty\`,Project
           FROM Production_sample_data
           WHERE \`From Dept\` IN (?)
           AND DATE(uploadedDateTime) = CURDATE()
              
        `;
  
    db.query(
      sql,
      [
        deptFromFilter.map((dept) => dept.toLowerCase()),
        deptToFilter.map((dept) => dept.toLowerCase()),
      ],
      (err, data) => {
        if (err) {
          console.error("Database query error:", err);
          return res.status(500).json({ error: "Database query error" });
        }
  
        res.json(data);
      }
    );
  });

  module.exports = router
  
  