
const express = require("express");
const axios = require("axios");
const db = require("../../config/DB/Db");
const router = express.Router();

router.get("/user/loggedin/data", async (req, res) => {
  const sql = "SELECT * FROM users";
  
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json(err);

    const updatedData = data.map(user => {
      return {
        ...user,
        dept: user.dept ? JSON.parse(user.dept) : [],
      };
    });

    return res.json(updatedData);
  });
});

module.exports = router;