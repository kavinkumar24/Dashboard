const express = require("express");
const axios = require("axios");
const db = require("../../config/DB/Db");
const router = express.Router();


router.get("/operational-task", (req, res) => {
    const query = "SELECT * FROM operational_task";
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching tasks:", err);
        res.status(500).send("Error fetching tasks");
        return;
      }
      res.json(results);
    });
  });



  router.get("/team-member", (req, res) => {
    const query = "SELECT * FROM team_member_details";
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching team members:", err);
        res.status(500).send("Error fetching team members");
        return;
      }
      res.json(results);
    });
  });

  module.exports = router;
