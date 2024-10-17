

const express = require("express");
const axios = require("axios");
const db = require("../../config/DB/Db");
const router = express.Router();
router.post("/party-visit", (req, res) => {
    const {
      party_name,
      visit_date,
      description,
      assign_person,
      status_data,
      image_link,
    } = req.body;
  
    // Log the incoming data
    console.log("Received data:", req.body);
  
    // If assign_person is an array, join it into a string
    const assign_person_string = Array.isArray(assign_person)
      ? assign_person.join(",")
      : assign_person;
  
    const query = `
      INSERT INTO Party_Visit (Party_Name, visit_date, Description, Assign_Person, Status_data,image_link)
      VALUES (?, ?, ?, ?, ?, ?)`;
  
    db.query(
      query,
      [
        party_name,
        visit_date,
        description,
        assign_person_string,
        status_data,
        image_link,
      ],
      (err, results) => {
        if (err) {
          console.error("Error inserting data:", err);
          return res.status(500).json({ error: "Database error", details: err });
        }
        return res
          .status(201)
          .json({ message: "Party visit created", id: results.insertId });
      }
    );
  });

  router.delete("/delete-party-visit/:taskId",(req,res)=>{
    const taskId = req.params.taskId;
    const sql = "DELETE FROM Party_Visit WHERE SL_NO = ?";
    db.query(sql,[taskId],(err,result)=>{
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to delete task", error: err });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      res.status(200).json({ message: "Task deleted successfully" });
    })
  })




  router.put("/update_party_visit_status", (req, res) => {
    const { SL_NO, Status_data, Complete_date } = req.body;
  
    const sql = `UPDATE Party_Visit SET Status_data = ?, Complete_date = ?  WHERE SL_NO = ?`;
    db.query(sql, [Status_data, Complete_date, SL_NO], (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json({ message: "Error executing query" });
      }
  
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Party visit not found" });
      }
  
      res.json({ message: "Status updated successfully", results });
    });
  });


  router.put("/update_party_visit_quantity", (req, res) => {
    const { SL_NO, Quantity } = req.body;
  
    const sql = `UPDATE Party_Visit SET Quantity = ? WHERE SL_NO = ?`;
    db.query(sql, [Quantity, SL_NO], (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json({ message: "Error executing query" });
      }
  
      res.json({ message: "Quantity updated successfully", results });
    });
  });

  router.put("/update_party_visit_brief", (req, res) => {
    console.log("Request body:", req.body); 
    const { SL_NO, Brief_no } = req.body;
  
    if (!SL_NO || !Brief_no) {
      return res.status(400).json({ message: "SL_NO and Brief_no are required" });
    }
  
    console.log("Updating with SL_NO:", SL_NO, "and Brief_no:", Brief_no);
  
    const sql = `UPDATE Party_Visit SET Brief_no = ? WHERE SL_NO = ?`;
    db.query(sql, [Brief_no, SL_NO], (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json({ message: "Error executing query" });
      }
  
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Party visit not found" });
      }
  
      res.json({ message: "Brief updated successfully", results });
    });
  });
  
  

module.exports = router;