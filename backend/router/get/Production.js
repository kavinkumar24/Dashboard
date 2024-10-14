const express = require("express");
const axios = require("axios");
const db = require("../../config/DB/Db");
const router = express.Router();

router.get("/production_data", (req, res) => {
    const sql = "SELECT * FROM Production_sample_data";
    db.query(sql, (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
  });
  
  

router.get("/filtered_production_data", async (req, res) => {
    const response = await axios.get("http://localhost:8081/api/department-mappings");
    const departmentMappings = response.data;
    const { startDate, endDate } = req.query;
  
    const deptFromFilter = Object.values(departmentMappings).flatMap(
      (mapping) => mapping.from
    );
    const deptToFilter = Object.values(departmentMappings).flatMap(
      (mapping) => mapping.to
    );
  
    const lowerDeptFromFilter = deptFromFilter.map((dept) => dept.toLowerCase());
    const lowerDeptToFilter = deptToFilter.map((dept) => dept.toLowerCase());
  
    // Get today's date in the required format for your SQL database
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );
  
    let sql = `
      SELECT \`From Dept\`, \`To Dept\`, COUNT(\`CW Qty\`) AS total_qty
      FROM Production_sample_data
      WHERE LOWER(\`From Dept\`) IN (?)
        AND LOWER(\`To Dept\`) IN (?)
        AND UploadedDateTime >= ? AND UploadedDateTime < ?
    `;
  
    const params = [lowerDeptFromFilter, lowerDeptToFilter, startOfDay, endOfDay];
  
    if (startDate) {
      sql += ` AND \`In Date\` >= ?`;
      params.push(new Date(startDate));
    }
    if (endDate) {
      sql += ` AND \`Out Date\` <= ?`;
      params.push(new Date(endDate));
    }
  
    sql += ` GROUP BY \`From Dept\`, \`To Dept\``;
  
    db.query(sql, params, (err, data) => {
      if (err) return res.json(err);
  
      const results = Object.keys(departmentMappings).reduce((acc, group) => {
        acc[group] = { total_qty: 0 };
        return acc;
      }, {});
  
      data.forEach((row) => {
        const fromDept = row["From Dept"].toUpperCase();
        const toDept = row["To Dept"].toUpperCase();
        const qty = row.total_qty;
  
        for (const [group, { from, to }] of Object.entries(departmentMappings)) {
          if (from.includes(fromDept) && to.includes(toDept)) {
            results[group].total_qty += qty;
          }
        }
      });
  
      return res.json(results);
    });
  });

  router.get("/filtered_production_data_with_date", async (req, res) => {
    try {
      // Get department mappings
      const response = await axios.get(
        "http://localhost:8081/api/department-mappings"
      );
      const departmentMappings = response.data;
      const { startDate, endDate } = req.query;
  
      const deptFromFilter = Object.values(departmentMappings).flatMap(
        (mapping) => mapping.from
      );
      const deptToFilter = Object.values(departmentMappings).flatMap(
        (mapping) => mapping.to
      );
  
      const lowerDeptFromFilter = deptFromFilter.map((dept) =>
        dept.toLowerCase()
      );
      const lowerDeptToFilter = deptToFilter.map((dept) => dept.toLowerCase());
  
      // Get today's date range
      const today = new Date();
      const startOfToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const endOfToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1
      );
  
      // Get yesterday's date range
      const startOfYesterday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 1
      );
      const endOfYesterday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
  
      // SQL query to get total quantity for both today and yesterday
      const sql = `
        SELECT \`From Dept\`, \`To Dept\`, COUNT(\`CW Qty\`) AS total_qty, 
               CASE 
                 WHEN UploadedDateTime >= ? AND UploadedDateTime < ? THEN 'today'
                 WHEN UploadedDateTime >= ? AND UploadedDateTime < ? THEN 'previous_day'
                 ELSE NULL
               END AS day_type
        FROM Production_sample_data
        WHERE LOWER(\`From Dept\`) IN (?)
          AND LOWER(\`To Dept\`) IN (?)
          AND (UploadedDateTime >= ? AND UploadedDateTime < ? OR UploadedDateTime >= ? AND UploadedDateTime < ?)
        GROUP BY \`From Dept\`, \`To Dept\`, day_type
      `;
  
      const params = [
        startOfToday,
        endOfToday, // Today's date range
        startOfYesterday,
        endOfYesterday, // Yesterday's date range
        lowerDeptFromFilter,
        lowerDeptToFilter,
        startOfToday,
        endOfToday, // Today's date range for WHERE condition
        startOfYesterday,
        endOfYesterday, // Yesterday's date range for WHERE condition
      ];
  
      db.query(sql, params, (err, data) => {
        if (err) return res.json(err);
  
        // Initialize the result object with all departments set to 0 for both today and previous day
        const results = {
          today: {},
          previous_day: {},
        };
  
        // Set all departments to 0 initially
        Object.keys(departmentMappings).forEach((group) => {
          results.today[group] = 0;
          results.previous_day[group] = 0;
        });
  
        // Update the total_qty based on the actual query results
        data.forEach((row) => {
          const fromDept = row["From Dept"].toUpperCase();
          const toDept = row["To Dept"].toUpperCase();
          const qty = row.total_qty;
          const dayType = row.day_type; // 'today' or 'previous_day'
  
          for (const [group, { from, to }] of Object.entries(
            departmentMappings
          )) {
            if (from.includes(fromDept) && to.includes(toDept)) {
              results[dayType][group] += qty; // Add quantity to the respective day
            }
          }
        });
  
        return res.json(results);
      });
    } catch (error) {
      console.error("Error fetching production data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });


  router.get("/filtered_production_data_previous", async (req, res) => {
    const response = await axios.get("http://localhost:8081/api/department-mappings");
    const departmentMappings = response.data;
  
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );
  
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const startOfYesterday = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate()
    );
    const endOfYesterday = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate() + 1
    );
  
    const deptFromFilter = Object.values(departmentMappings).flatMap(
      (mapping) => mapping.from
    );
    const deptToFilter = Object.values(departmentMappings).flatMap(
      (mapping) => mapping.to
    );
  
    const lowerDeptFromFilter = deptFromFilter.map((dept) => dept.toLowerCase());
    const lowerDeptToFilter = deptToFilter.map((dept) => dept.toLowerCase());
  
    // SQL for today's data
    let sqlToday = `
      SELECT \`From Dept\`, \`To Dept\`, COUNT(\`CW Qty\`) AS total_qty
      FROM Production_sample_data
      WHERE LOWER(\`From Dept\`) IN (?)
        AND LOWER(\`To Dept\`) IN (?)
        AND UploadedDateTime >= ? AND UploadedDateTime < ?
      GROUP BY \`From Dept\`, \`To Dept\`
    `;
  
    const paramsToday = [
      lowerDeptFromFilter,
      lowerDeptToFilter,
      startOfToday,
      endOfToday,
    ];
  
    // SQL for yesterday's data
    let sqlYesterday = `
      SELECT \`From Dept\`, \`To Dept\`, COUNT(\`CW Qty\`) AS total_qty
      FROM Production_sample_data
      WHERE LOWER(\`From Dept\`) IN (?)
        AND LOWER(\`To Dept\`) IN (?)
        AND UploadedDateTime >= ? AND UploadedDateTime < ?
      GROUP BY \`From Dept\`, \`To Dept\`
    `;
  
    const paramsYesterday = [
      lowerDeptFromFilter,
      lowerDeptToFilter,
      startOfYesterday,
      endOfYesterday,
    ];
  
    try {
      const [todayData, yesterdayData] = await Promise.all([
        new Promise((resolve, reject) => {
          db.query(sqlToday, paramsToday, (err, data) =>
            err ? reject(err) : resolve(data)
          );
        }),
        new Promise((resolve, reject) => {
          db.query(sqlYesterday, paramsYesterday, (err, data) =>
            err ? reject(err) : resolve(data)
          );
        }),
      ]);
  
      const results = Object.keys(departmentMappings).reduce((acc, group) => {
        acc[group] = { total_qty: 0 };
        return acc;
      }, {});
  
      const processRowData = (data) => {
        data.forEach((row) => {
          const fromDept = row["From Dept"].toUpperCase();
          const toDept = row["To Dept"].toUpperCase();
          const qty = row.total_qty;
  
          for (const [group, { from, to }] of Object.entries(
            departmentMappings
          )) {
            if (from.includes(fromDept) && to.includes(toDept)) {
              results[group].total_qty += qty;
            }
          }
        });
      };
  
      // Process both today's and yesterday's data
      processRowData(todayData);
      processRowData(yesterdayData);
  
      return res.json(results);
    } catch (err) {
      return res.json(err);
    }
  });


  

  
  module.exports = router
  