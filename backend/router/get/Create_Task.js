const express = require("express");
const axios = require("axios");
const db = require("../../config/DB/Db");
const router = express.Router();

router.get("/create-task", (req, res) => {
  const sql = "SELECT * FROM Created_task";
  db.query(sql, (err, data) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Failed to fetch tasks", error: err });
    }

    const currentDate = new Date();
    const updatedTasks = data.map((task) => {
      const targetDate = new Date(task.Target_Date);
      const remainingDays =
        task.Completed_Status === "Completed"
          ? task.Remaining_Days
          : Math.ceil((targetDate - currentDate) / (1000 * 60 * 60 * 24));

      return {
        ...task,
        Remaining_Days: remainingDays,
      };
    });

    res.json(updatedTasks);
  });
});


router.delete("/delete-task/:taskId", (req, res) => {
  const taskId = req.params.taskId;
  const sql = "DELETE FROM Created_task WHERE Task_ID = ?";

  db.query(sql, [taskId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to delete task", error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  });
});


router.post("/create-task", async (req, res) => {
  console.log("Request Body:", req.body);
  const imageBuf = Buffer.from(req.body.image) || [];

  const {
    ax_brief,
    collection_name,
    project,
    no_of_qty,
    assign_date,
    target_date,
    priority,
    depart,
    assignTo,
    assignToPersonEmails,
    hodemail,
    ref_images,
    isChecked,
  } = req.body;

  if (
    !ax_brief ||
    !collection_name ||
    !project ||
    !no_of_qty ||
    !assign_date ||
    !target_date ||
    !priority
  ) {
    console.error("Missing required fields");
    return res.status(400).json({ message: "Missing required fields" });
  }

  const assignToEmails = Array.isArray(assignToPersonEmails)? assignToPersonEmails.join(", ") : assignToPersonEmails;
  const sql = `
        INSERT INTO Created_task (
            Ax_Brief, Collection_Name, References_Image, Project, Assign_Name,
            Person, OWNER, No_of_Qty, Dept, Complete_Qty, Pending_Qty,
            Assign_Date, Target_Date, Remaining_Days, Project_View, Completed_Status, Remarks, image_data
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

  const values = [
    ax_brief,
    collection_name,
    ref_images,
    project,
    assignTo,
    assignToEmails,
    hodemail,
    no_of_qty,
    depart,
    0,
    0,
    assign_date,
    target_date,
    null, // Placeholder for Remaining_Days, will set later
    isChecked ? "Yes" : "No", // Project_View
    "In Progress", // Completed_Status
    "-", // Remarks
    imageBuf || null, // image_data
  ];

  db.query(sql, values, async (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      return res
        .status(500)
        .json({ message: "Failed to create task", error: err });
    }

    console.log("Inserted Task_ID:", result.insertId);
    const calculateRemainingDays = (targetDate) => {
      const now = new Date();
      const target = new Date(targetDate);
      const diffTime = target - now;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert to days
    };
    try {
      // Check if the task is completed
      const completedStatus = "In Progress"; // Default status, you can adjust as needed
      let remainingDays;

      if (completedStatus === "Completed") {
        remainingDays = 0; // Freeze remaining days if completed
      } else {
        remainingDays = calculateRemainingDays(target_date); // Calculate remaining days if not completed
      }

      // Update Remaining_Days in the database
      const updateRemainingDaysSql = `
                UPDATE Created_task
                SET Remaining_Days = ?
                WHERE Task_ID = ?; 
            `;
      await new Promise((resolve, reject) => {
        db.query(
          updateRemainingDaysSql,
          [remainingDays, result.insertId],
          (updateErr) => {
            if (updateErr) {
              console.error("Update Remaining Days Error:", updateErr);
              return reject(updateErr);
            }
            console.log("Remaining Days updated to:", remainingDays);
            resolve();
          }
        );
      });

      // Fetch production data
      const productionResponse = await axios.get(
        "http://localhost:8081/api/production_data"
      );
      const productionData = productionResponse.data;

      // Filter production data for matching Brief No
      const matchedItems = productionData.filter(
        (item) => item["Brief No"] === ax_brief
      );
      const totalCWQty = matchedItems.reduce(
        (sum, item) => sum + (item["CW Qty"] || 0),
        0
      );
      console.log("Total CW Qty:", totalCWQty);

      // Update Complete_Qty
      const updateSql = `
                UPDATE Created_task
                SET Complete_Qty = ?
                WHERE Task_ID = ?; 
            `;
      await new Promise((resolve, reject) => {
        db.query(updateSql, [totalCWQty, result.insertId], (updateErr) => {
          if (updateErr) {
            console.error("Update Error:", updateErr);
            return reject(updateErr);
          }
          console.log(
            "Update successful, Complete_Qty updated to:",
            totalCWQty
          );
          resolve();
        });
      });

      // Fetch pending data
      const pendingResponse = await axios.get(
        "http://localhost:8081/api/pending_data"
      );
      const pendingData = pendingResponse.data;

      // Filter pending data for matching Brief No and sum JCPDSCWQTY1
      const pendingItems = pendingData.filter(
        (item) => item["BRIEFNUM1"] === ax_brief
      );
      const totalPendingQty = pendingItems.reduce(
        (sum, item) => sum + (item["JCPDSCWQTY1"] || 0),
        0
      );
      console.log("Total Pending Qty:", totalPendingQty);

      // Update Pending_Qty
      const updatePendingSql = `
                UPDATE Created_task
                SET Pending_Qty = ?
                WHERE Task_ID = ?; 
            `;
      await new Promise((resolve, reject) => {
        db.query(
          updatePendingSql,
          [totalPendingQty, result.insertId],
          (updatePendingErr) => {
            if (updatePendingErr) {
              console.error("Pending Update Error:", updatePendingErr);
              return reject(updatePendingErr);
            }
            console.log("Pending_Qty updated successfully:", totalPendingQty);
            resolve();
          }
        );
      });

      // Send response
      res.json({
        message: "Task created successfully",
        taskId: result.insertId,
        Complete_Qty: totalCWQty,
        Pending_Qty: totalPendingQty,
      });
    } catch (fetchErr) {
      console.error("Production Data Fetch Error:", fetchErr);
      return res
        .status(500)
        .json({ message: "Failed to fetch production data", error: fetchErr });
    }
  });
});


router.put("/update-task/:id", (req, res) => {
    const taskId = req.params.id;
    const { Completed_Status, Remarks } = req.body;
  
    const updates = [];
    const params = [];
  
    // Only add Completed_Status if it's provided
    if (Completed_Status !== undefined) {
      updates.push("Completed_Status = ?");
      params.push(Completed_Status);
    }
  
    // Only add Remarks if it's provided
    if (Remarks !== undefined) {
      updates.push("Remarks = ?");
      params.push(Remarks);
    }
  
    // If nothing is being updated, return an error
    if (updates.length === 0) {
      return res.status(400).send("No fields to update");
    }
  
    const sql = `
      UPDATE Created_task 
      SET 
        ${updates.join(", ")}
      WHERE 
        Task_ID = ?
    `;
  
    params.push(taskId);
  
    db.query(sql, params, (err, results) => {
      if (err) {
        console.error("Error updating task:", err);
        return res.status(500).send("Error updating task");
      }
  
      if (results.affectedRows === 0) {
        return res.status(404).send("Task not found");
      }
  
      res.send("Task updated successfully");
    });
  });

module.exports = router;
