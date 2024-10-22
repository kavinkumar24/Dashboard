
const express = require("express");
const axios = require("axios");
const db = require("../../config/DB/Db");
const router = express.Router();
const jwt = require("jsonwebtoken");


const JWT_SECRET = "ejindiadashboard";


router.post("/login", (req, res) => {
    const { emp_id, password } = req.body;
  
    if (!emp_id || !password) {
      return res
        .status(400)
        .json({ message: "Employee ID or Email and password are required" });
    }
  
    // Check for both emp_id or Email
    const query = "SELECT * FROM users WHERE emp_id = ? OR Email = ?";
  
    db.query(query, [emp_id, emp_id], (err, results) => {
      // Using emp_id for both emp_id and Email
      if (err)
        return res.status(500).json({ message: "Database error", error: err });
  
      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const user = results[0];
  
      // Compare password (without bcrypt)
      if (password !== user.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      // Generate JWT token with role
      const token = jwt.sign(
        {
          emp_id: user.emp_id,
          employer_name: user.employer_name,
          role: user.role,
          emp_name: user.emp_name,

        },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
  
      // Send token as part of the response
      return res.status(200).json({
        message: "Login successful",
        token, // Return the JWT token
        user: {
          emp_id: user.emp_id,
          employer_name: user.employer_name,
          role: user.role,
          emp_name: user.emp_name,
        }, 
      });
    });
  });
  

  module.exports = router;