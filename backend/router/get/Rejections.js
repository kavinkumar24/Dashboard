
const express = require("express");
const axios = require("axios");
const db = require("../../config/DB/Db");
const router = express.Router();

router.get("/rejection/uploads", (req, res) => {
    const query = "SELECT * FROM rejection";
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
