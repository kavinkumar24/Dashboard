

const express = require("express");
const axios = require("axios");
const db = require("../../config/DB/Db");
const router = express.Router();


router.post("/save-remarks", async (req, res) => {
    const { dept, remarks } = req.body;
    console.log(dept, remarks);
  
    if (!dept || !remarks) {
      return res.status(400).send("Department and remarks are required.");
    }
  
    // Use upsert logic depending on your database
    const query = `
      INSERT INTO remarks_department (dept, remarks)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE remarks = ?;
    `;
  
    db.query(query, [dept, remarks, remarks], (err, result) => {
      if (err) {
        console.error("Error updating remarks:", err);
        return res.status(500).send("Error updating remarks.");
      }
      res.send("Remarks updated successfully.");
    });
  });

  module.exports = router
