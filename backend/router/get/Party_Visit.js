
const express = require("express");
const axios = require("axios");
const db = require("../../config/DB/Db");
const router = express.Router();
router.get("/party_visit", (req, res) => {
    const query = "SELECT * FROM Party_Visit";
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching uploads:", err);
        res.status(500).send("Error fetching uploads");
        return;
      }
      res.json(results);
    });
  });
module.exports = router;