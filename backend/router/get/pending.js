const express = require("express");
const axios = require("axios");
const db = require("../../config/DB/Db");
const router = express.Router();

router.get("/pending", (req, res) => {
  const sql =
    "SELECT BRIEFNUM1, DESIGNSPEC1, PLTCODE1, SKETCHNUM1 FROM Pending_sample_data";

  db.query(sql, (err, data) => {
    if (err) return res.json(err);

    const groupedData = data.reduce((result, current) => {
      const { BRIEFNUM1, DESIGNSPEC1, PLTCODE1, SKETCHNUM1 } = current;

      if (!result[BRIEFNUM1]) {
        result[BRIEFNUM1] = {
          BRIEFNUM1,
          designspecs: new Set(),
          pltcodes: new Set(),
          sketchnums: new Set(),
        };
      }

      // Add unique design specs, PLTCODE1, and SKETCHNUM1
      result[BRIEFNUM1].designspecs.add(DESIGNSPEC1);
      result[BRIEFNUM1].pltcodes.add(PLTCODE1);
      if (SKETCHNUM1) result[BRIEFNUM1].sketchnums.add(SKETCHNUM1); // Only add if it exists

      return result;
    }, {});

    const formattedData = Object.values(groupedData).map((item) => ({
      BRIEFNUM1: item.BRIEFNUM1,
      designspecs: Array.from(item.designspecs), // Convert sets to arrays
      pltcodes: Array.from(item.pltcodes),
      sketchnums: Array.from(item.sketchnums), // Convert SKETCHNUM1 set to array
    }));

    return res.json(formattedData);
  });
});
router.get("/pending_data", (req, res) => {
  const sql =
    "SELECT * FROM Pending_sample_data WHERE DATE(uploadedDateTime) = CURDATE()";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});


router.get("/pending_data_brief",(req,res)=>{
  const sql = "SELECT * FROM Pending_sample_data";
  db.query(sql,(err,data)=>{
    if(err) return res.json(err);
    return res.json(data);
  });
})
router.get("/raw_filtered_pending_data", async (req, res) => {
  const response = await axios.get(
    "http://localhost:8081/api/department-mappings"
  );
  const departmentMappings = response.data;
  const deptToFilter = Object.values(departmentMappings).flatMap(
    (mapping) => mapping.from
  );
  const lowerToDeptFilter = deptToFilter.map((dept) => dept.toLowerCase());

  const sql = `
              SELECT TODEPT, CAST(JCPDSCWQTY1 AS DECIMAL) as JCPDSCWQTY1,PLTCODE1
              FROM Pending_sample_data
              WHERE LOWER(TODEPT) IN (?)
               AND DATE(uploadedDateTime) = CURDATE()
           `;

  db.query(sql, [lowerToDeptFilter], (err, data) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Database query error" });
    }

    console.log("Fetched Pending Data:", data);

    res.json(data);
  });
});

router.get("/filtered_pending_data", async (req, res) => {
  const response = await axios.get(
    "http://localhost:8081/api/department-mappings"
  );
  const departmentMappings = response.data;

  const deptFromFilter = Object.values(departmentMappings).flatMap(
    (mapping) => mapping.from
  );
  const lowerDeptFromFilter = deptFromFilter.map((dept) => dept.toLowerCase());

  const { startDate, endDate } = req.query;

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
      SELECT todept, COUNT(CAST(jcpdscwqty1 AS DECIMAL)) AS total_qty
      FROM Pending_sample_data
      WHERE LOWER(todept) IN (?)
        AND UploadedDateTime >= ? AND UploadedDateTime < ?
    `;

  const params = [lowerDeptFromFilter, startOfDay, endOfDay];

  if (startDate) {
    sql += ` AND UploadedDateTime >= ?`;
    params.push(new Date(startDate));
  }
  if (endDate) {
    sql += ` AND UploadedDateTime <= ?`;
    params.push(new Date(endDate));
  }

  sql += ` GROUP BY todept`;

  db.query(sql, params, (err, data) => {
    if (err) return res.json(err);

    const results = Object.keys(departmentMappings).reduce((acc, group) => {
      acc[group] = { total_qty: 0 };
      return acc;
    }, {});

    data.forEach((row) => {
      const toDept = row.todept ? row.todept.toUpperCase() : null;
      const qty = row.total_qty;

      if (toDept) {
        for (const [group, { from }] of Object.entries(departmentMappings)) {
          if (from.includes(toDept)) {
            results[group].total_qty += qty;
          }
        }
      }
    });

    return res.json(results);
  });
});

router.get("/filtered_pending_data_with_date", async (req, res) => {
  try {
    // Get department mappings
    const response = await axios.get(
      "http://localhost:8081/api/department-mappings"
    );
    const departmentMappings = response.data;

    const toDeptFilter = Object.values(departmentMappings).flatMap(
      (mapping) => mapping.from
    );
    const lowerToDeptFilter = toDeptFilter.map((dept) => dept.toLowerCase());

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
        SELECT todept, COUNT(CAST(jcpdscwqty1 AS DECIMAL)) AS total_qty,
               CASE 
                 WHEN UploadedDateTime >= ? AND UploadedDateTime < ? THEN 'today'
                 WHEN UploadedDateTime >= ? AND UploadedDateTime < ? THEN 'previous_day'
                 ELSE NULL
               END AS day_type
        FROM Pending_sample_data
        WHERE LOWER(todept) IN (?)
          AND (UploadedDateTime >= ? AND UploadedDateTime < ? OR UploadedDateTime >= ? AND UploadedDateTime < ?)
        GROUP BY todept, day_type
      `;

    const params = [
      startOfToday,
      endOfToday, // Today's date range
      startOfYesterday,
      endOfYesterday, // Yesterday's date range
      lowerToDeptFilter,
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
        const toDept = row.todept ? row.todept.toUpperCase() : null;
        const qty = row.total_qty;
        const dayType = row.day_type; // 'today' or 'previous_day'

        if (toDept) {
          for (const [group, { from }] of Object.entries(departmentMappings)) {
            if (from.includes(toDept)) {
              results[dayType][group] += qty; // Add quantity to the respective day
            }
          }
        }
      });

      return res.json(results);
    });
  } catch (error) {
    console.error("Error fetching pending data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/pending-sum", (req, res) => {
  const query = `
  SELECT PLTCODE1, COUNT(JCPDSCWQTY1) AS total_quantity
FROM Pending_sample_data
WHERE DATE(uploadedDateTime) = CURDATE()
GROUP BY PLTCODE1;

    `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res.status(500).json({ message: "Error fetching data" });
    }
    res.json(result);
  });
});
module.exports = router;
