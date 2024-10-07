const express = require("express");
const axios = require("axios");
const db = require("../../config/DB/Db");
const router = express.Router();


router.post("/operational-task", (req, res) => {
    const {
      task_id,
      project_name,
      assignee,
      starting_date,
      target_date,
      priority,
      last_edited,
      attachment,
    } = req.body;
  
    const insertTaskQuery = `INSERT INTO operational_task (task_id, project_name, assignee, starting_date, target_date, priority, last_edited, attachment) 
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  
    db.query(
      insertTaskQuery,
      [
        task_id,
        project_name,
        assignee,
        starting_date,
        target_date,
        priority,
        last_edited,
        attachment || "Not Yet Received",
      ],
      (err, result) => {
        if (err) {
          console.error("Error inserting task:", err);
          return res.status(500).json({ error: "Failed to insert task" });
        }
        res.status(201).json({ message: "Task created successfully" });
      }
    );
  });



  router.post("/team-member", (req, res) => {
    const { member_id, task_id, name, email, status, attachment_file } = req.body;
  
    const insertMemberQuery = `
      INSERT INTO team_member_details (member_id, task_id, name, mail_id, status, attachment_file)
      VALUES (?, ?, ?, ?, ?, ?)`;
  
    db.query(
      insertMemberQuery,
      [
        member_id,
        task_id,
        name,
        email,
        status || "In Progress",
        attachment_file || "Not Yet Received",
      ],
      (err, result) => {
        if (err) {
          console.error("Error inserting team member:", err);
          return res.status(500).json({ error: "Failed to insert team member" });
        }
        res.status(201).json({ message: "Team member created successfully" });
      }
    );
  });

  module.exports = router;
