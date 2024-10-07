const express = require("express");
const axios = require("axios");
const db = require("../../config/DB/Db");
const router = express.Router();

router.get("/descenTask_Brief", (req, res) => {
    const query = "SELECT DISTINCT `Brief number` FROM design_center_task_sample";
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching uploads:", err);
        res.status(500).send("Error fetching uploads");
        return;
      }
      res.json(results);
    });
  });


  router.get("/desCenTask", (req, res) => {
    const query = "SELECT * FROM design_center_task_sample";
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