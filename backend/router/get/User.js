
const express = require("express");
const axios = require("axios");
const db = require("../../config/DB/Db");
const router = express.Router();


router.get("/user", (req, res) => {
    const query = "SELECT * FROM users";
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching user:", err);
        return res.status(500).send("Error fetching user");
      }
      res.json(results);
    });
  });
  
  module.exports = router
