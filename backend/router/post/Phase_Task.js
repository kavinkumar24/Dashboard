
const express = require("express");
const axios = require("axios");
const db = require("../../config/DB/Db");
const router = express.Router();

router.post("/phase-task", async (req, res) => {
    const tasks = req.body;
  
    tasks.forEach((task) => {
      if (!task.task_id || !task.phase_id || !task.task_name) {
        return res.status(400).json({ error: "Missing required fields in task" });
      }
    });
  
    const missingFields = tasks.some(
      (task) => !task.task_id || !task.phase_id || !task.task_name
    );
  
    if (missingFields) {
      return res.status(400).json({ error: "Missing required fields in task" });
    }
  
    const insertTaskQuery = `INSERT INTO phase_tasks (task_id, phase_id, task_name, description, start_date, end_date, assignee, owner_email, grace_period, status, notes,ot_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?);
    `;
  
    try {
      const insertPromises = tasks.map((task) => {
        return new Promise((resolve, reject) => {
          db.query(
            insertTaskQuery,
            [
              task.task_id,
              task.phase_id,
              task.task_name,
              task.description,
              task.start_date || null,
              task.end_date || null,
              task.assignee,
              task.owner_email,
              task.grace_period || null,
              task.status || "In Progress",
              task.notes || "Not Yet Received",
              task.ot_id,
            ],
            (err, result) => {
              if (err) {
                console.error("Error inserting task:", err);
                reject(err); // Reject the promise on error
              } else {
                resolve(result); // Resolve the promise on success
              }
            }
          );
        });
      });
  
      await Promise.all(insertPromises); // Wait for all inserts to complete
      res.status(201).json({ message: "Tasks created successfully" });
    } catch (error) {
      console.error("Failed to insert tasks:", error);
      res.status(500).json({ error: "Failed to insert tasks" });
    }
  });
  


  
  router.post("/phase", (req, res) => {
    const { task_id, phase_id, phase_name } = req.body;
  
    const insertTaskQuery = `
      INSERT INTO phases ( phase_id,task_id, phase_name)
      VALUES (?, ?, ?);
    `;
  
    db.query(insertTaskQuery, [phase_id, task_id, phase_name], (err, result) => {
      if (err) {
        console.error("Error inserting task:", err);
        return res.status(500).json({ error: "Failed to insert task" });
      }
      res.status(201).json({ message: "Task created successfully" });
    });
  });




  router.put("/phase-task/:task_id", (req, res) => {
    const { task_id } = req.params;
    const { status, notes, type, link, grace_period } = req.body;
  
    let updateTaskQuery;
    let queryParams;
  
    // Check the type and update the relevant field(s)
    if (type === "note") {
      updateTaskQuery = `
        UPDATE phase_tasks
        SET notes = ? , link = ?
        WHERE task_id = ?;
      `;
      queryParams = [notes, link, task_id];
    } else if (type === "state") {
      updateTaskQuery = `
        UPDATE phase_tasks
        SET status = ?
        WHERE task_id = ?;
      `;
      queryParams = [status, task_id];
    } else if (type === "grace") {
      updateTaskQuery = `
        UPDATE phase_tasks
        SET grace_period = ?
        WHERE task_id = ?;
      `;
      queryParams = [grace_period, task_id];
    }
  
    db.query(updateTaskQuery, queryParams, (err, result) => {
      if (err) {
        console.error("Error updating task:", err);
        return res.status(500).json({ error: "Failed to update task" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.status(200).json({ message: "Task updated successfully" });
    });
  });




  router.put("/update-phase/:phase_id", (req, res) => {
    const { phase_id } = req.params;
    const { phase_status } = req.body;
  
    const updatePhaseQuery = `
      UPDATE phases
      SET phase_status = ?
      WHERE phase_id = ?;
    `;
  
    db.query(updatePhaseQuery, [phase_status, phase_id], (err, result) => {
      if (err) {
        console.error("Error updating phase:", err);
        return res.status(500).json({ error: "Failed to update phase" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Phase not found" });
      }
      res.status(200).json({ message: "Phase updated successfully" });
    });
  });
  
  module.exports = router
