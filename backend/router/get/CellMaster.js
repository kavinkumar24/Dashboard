const express = require("express");
const axios = require("axios");
const db = require("../../config/DB/Db");
const router = express.Router();

router.get("/cellmaster", (req, res) => {
    const query = "SELECT * FROM Cell_Master";
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