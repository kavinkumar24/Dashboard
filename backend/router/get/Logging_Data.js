
const express = require("express");
const axios = require("axios");
const db = require("../../config/DB/Db");
const router = express.Router();

router.get("/user/loggedin/data", async (req, res) => {
    const sql = "SELECT * FROM users";
    db.query(sql, (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
  });

module.exports = router;