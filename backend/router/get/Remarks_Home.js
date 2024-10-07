
const express = require("express");
const router = express.Router();
const db = require("../../config/DB/Db");



router.get("/remarks/data", async (req, res) => {
    const query = "SELECT dept, remarks FROM remarks_department";
  
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching remarks:", err);
        return res.status(500).send("Error fetching remarks.");
      }
      res.json(results);
    });
  });

  module.exports = router;