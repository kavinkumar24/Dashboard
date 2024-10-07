const express = require("express");
const db = require("../../config/DB/Db");
const router = express.Router();

// router.get("/target", (req, res) => {
//   const sql = "SELECT * FROM aop";
//   db.query(sql, (err, data) => {
//     if (err) return res.json(err);
//     return res.json(data);
//   });
// });

router.get("/targets", (req, res) => {
  db.query("SELECT * FROM target", (err, result) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res.status(500).json({ message: "Error fetching data" });
    }
    res.json(result);
  });
});

module.exports = router;
