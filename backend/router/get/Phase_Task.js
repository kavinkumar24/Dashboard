const express = require("express");
const axios = require("axios");
const db = require("../../config/DB/Db");
const router = express.Router();

router.get("/phase-tasks", (req, res) => {
    const query = "SELECT * FROM phase_tasks";
  
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching tasks:", err);
        return res.status(500).send("Error fetching tasks");
      }
      res.json(results);
    });
  });


  router.get("/phases", (req, res) => {
    const query = "SELECT * FROM phases";
  
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching phases:", err);
        return res.status(500).send("Error fetching phases");
      }
      res.json(results);
    });
  });

  module.exports = router
