const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "172.16.5.233",
  user: "emerald",
  password: "emerald",
  database: "emerald",
});

// const bodyParser = require('body-parser');

// // Increase the limit to 50MB
// app.use(bodyParser.json({ limit: '50mb' }));
// app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// // For Express 4.16+ you can use the built-in middleware
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.post("/upload", (req, res) => {
  const data = req.body;

  db.query("SHOW TABLES LIKE 'Order_receiving_details'", (err, result) => {
    if (err) {
      console.error("Error checking table existence:", err);
      return res.status(500).json({ message: "Error checking table existence" });
    }

    if (result.length === 0) {
      const createTableQuery = `CREATE TABLE Order_receiving_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        NAME1 VARCHAR(255), SUB_PARTY VARCHAR(255), Group_party VARCHAR(255), JCID VARCHAR(255), 
        TRANSDATE DATE, ORDERNO VARCHAR(255), OrderType VARCHAR(255), ZONE VARCHAR(255), 
        OGPG VARCHAR(255), Purity VARCHAR(255), Color VARCHAR(255), PHOTO_NO VARCHAR(255), 
        PHOTO_NO_2 VARCHAR(255), PROJECT VARCHAR(255), TYPE VARCHAR(255), ITEM VARCHAR(255), 
        PRODUCT VARCHAR(255), SUB_PRODUCT VARCHAR(255), QTY INT, WT FLOAT, Avg FLOAT, 
        Wt_range VARCHAR(255), PL_ST VARCHAR(255), DD VARCHAR(255), SKCHNI VARCHAR(255), 
        EMP VARCHAR(255), Name VARCHAR(255), CODE VARCHAR(255), GENDER VARCHAR(255), 
        Set_Photo VARCHAR(255), Po_new VARCHAR(255), DD_month VARCHAR(255), Dyr INT, 
        Brief VARCHAR(255), Maketype VARCHAR(255), collection VARCHAR(255), 
        Collection_1 VARCHAR(255), Collection_2 VARCHAR(255)
      )`;

      db.query(createTableQuery, (err, result) => {
        if (err) {
          console.error("Error creating table:", err);
          return res.status(500).json({ message: "Error creating table" });
        }

        console.log("Order_receiving_log table created successfully");

        insertData("Order_receiving_log", data, res);
      });
    } else {
      insertData("Order_receiving_details", data, res);
    }
  });
});

function insertData(tableName, data, res) {
  const query = `INSERT INTO ${tableName} 
  (NAME1, SUB_PARTY, Group_party, JCID, TRANSDATE, ORDERNO, OrderType, ZONE, OGPG, Purity, Color, PHOTO_NO, PHOTO_NO_2, PROJECT, TYPE, ITEM, PRODUCT, SUB_PRODUCT, QTY, WT, Avg, Wt_range, PL_ST, DD, SKCHNI, EMP, Name, CODE, GENDER, Set_Photo, Po_new, DD_month, Dyr, Brief, Maketype, collection, Collection_1, Collection_2) VALUES ?`;

  const values = data.map(item => [
    item["NAME1"], item["SUB PARTY"], item["Group party"], item["JCID"], item["TRANSDATE"], item["ORDERNO"], item["OrderType"], item["ZONE"], item["OGPG"], item["Purity"], item["Color"], item["PHOTO NO"], item["PHOTO NO 2"], item["PROJECT"], item["TYPE"], item["ITEM"], item["PRODUCT"], item["SUB PRODUCT"], item["QTY"], item["WT"], item["Avg"], item["Wt range"], item["PL-ST"], item["DD"], item["SKCHNI"], item["EMP"], item["Name"], item["CODE"], item["GENDER"], item["2024 Set Photo"], item["Po-new"], item["DD&month"], item["Dyr"], item["Brief"], item["Maketype"], item["collection"], item["Collection-1"], item["Collection-2"]
  ]);

  db.query(query, [values], (err, result) => {
    if (err) {
      console.error(`Error inserting data into ${tableName}:`, err);
      return res.status(500).json({ message: `Error storing data in ${tableName}` });
    }

    res.json({ message: `Data stored successfully in ${tableName}` });
  });
}





//  app.get('/filtered_production_data', (req, res) => {
//    const deptFilter = ['WBKOL-CAD', 'U4PD-CAD'];
//    const toDeptFilter = ['U4PD-PRBOM', 'U1MMD', 'U1TOOL', 'U1CAM', 'U4PD-CAM'];

//    const lowerDeptFilter = deptFilter.map(dept => dept.toLowerCase());
//    const lowerToDeptFilter = toDeptFilter.map(dept => dept.toLowerCase());

//    const sql = `
//        SELECT fromdept1, todept1, SUM(pdscwqty1) AS total_qty
//        FROM production_log
//        WHERE LOWER(fromdept1) IN (?)
//          AND LOWER(todept1) IN (?)
//        GROUP BY fromdept1, todept1
//    `;

//    db.query(sql, [lowerDeptFilter, lowerToDeptFilter], (err, data) => {
//        if (err) return res.json(err);
//        return res.json(data);
//    });
// });

const departmentMappings = {
  CAD: {
    from: ["WBKOL-CAD", "U4PD-CAD", "U1CAD", "U1CAD-NMP"],
    to: [
      "U4PD-PRBOM",
      "U1MMD",
      "U1TOOL",
      "U1CAM",
      "U4PD-CAM",
      "U1ST-SISMA",
      "U1PRE-BOM",
    ],
  },
  "PRE-BOM": {
    from: ["U4PD-PRBOM", "U1PRE-BOM"],
    to: [
      "U4PD-CAM",
      "U4PD-WAX",
      "U4PD-DIE",
      "U1CAM",
      "U4DIE",
      "U4PD3-SISM",
      "U1ST-SISMA",
      "U1PDD3-BUF",
    ],
  },
  CAM: {
    from: ["U1CAM", "U4PD-CAM", "U1INWARD"],
    to: [
      "U4PD-MFD",
      "U1MP",
      "U1WAX-PL",
      "U1WAX-SORT",
      "U1NMP-SFD",
      "U1EXP-SFD",
      "U1SFD",
      "U4MFD",
      "U1MP",
      "U4-EFMFD",
    ],
  },
  MFD: {
    from: ["U4PD-MFD", "U1NMP-SFD", "U1SFD"],
    to: ["U4PD-DIE", "U4PD-WAX", "U4PD-PRBOM", "U1SAM-WAX", "U1DIE"],
  },
  SFD: {
    from: ["U1NMP-SFD"],
    to: ["U4PD-WAX", "U1SAM-WAX", "U1DIE"],
  },

  DIE: {
    from: ["U4PD-DIE", "U1DIE"],
    to: ["U4PD-WAX", "U1SAM-WAX"],
  },

  MP: {
    from: ["U1MP"],
    to: ["U4PD-DIE", "U1DIE", "U4PD-WAX", "U4PD-PRBOM", "U1SAM-WAX"],
  },
  WAX: {
    from: ["U4PD-WAX", "U1SAM-WAX"],
    to: ["U4SJ-CAST", "U1CAST"],
  },
  CAST: {
    from: ["U1CAST", "U4SJ-CAST"],
    to: [
      "U1SAMP",
      "U1PDD2-SEP",
      "U1SEP-SPR1",
      "U1SEP-SST",
      "U1SEP",
      "U4PD1-SEP",
    ],
  },
  SEPRATION: {
    from: ["U1PDD2-SEP", "U1SAMP"],
    to: [
      "U1PDD2-ASY",
      "U1PDD2-BUF",
      "U1C5L1-ASY",
      "U1C5L1-ASS",
      "U1PDD3-BUF",
      "U1PDD3-ASY",
      "U1PDD3-CLR",
      "U1PDD3-COR",
      "U1PDD3-BP",
      "U1PDD2-CLR",
      "U1FUSION",
      "U1PDD",
      "U1PDD2-COR",
      "U1PDD3-SEP",
      "U1C5L1-ASY",
      "U1C6L2-ASY",
      "U1PDD",
      "U1C6L1-COR",
      "U1FUL2-ASY",
      "U1C22-ASY",
      "U1C22-COR",
      "U1C5L1-ASY",
      "U1CELL-6",
      "U1CNC-ASY",
      "U1C22-PLT",
      "U1MGS-L&F",
      "U1MGS-ASY",
      "U1IND",
      "U1MARIYA",
    ],
  },
  "PD-ASSY": {
    from: ["U1PDD2-ASY", "U1SAM-ASY"],
    to: ["U1PDD2-BUF", "U1BP"],
  },
  BP: {
    from: ["U1BP"],
    to: ["U1SAM-COR"],
  },
  "PD-CORR": {
    from: ["U1SAM-COR"],
    to: ["U1SAM-QC", "U1SAM-SST", "U1SAM-BUF"],
  },
  "PD-SETTING": {
    from: ["U1SAM-SST", "U1PDD2-SST"],
    to: ["U1SAM-BUF", "U1PDD2-TXT"],
  },
  "PD-BUFF": {
    from: ["U1PDD2-BUF", "U1SAM-BUF"],
    to: [
      "U1PDD2-SST",
      "U1PDD2-TXT",
      "U1SAM-TEX",
      "U1CH-18K",
      "U1CH-22K",
      "U1MGS-L&F",
    ],
  },
  "PD-TEXTURING": {
    from: ["U1PDD2-TXT", "U1SAM-TEX"],
    to: [
      "U1PDD2-CORR",
      "U1GS",
      "U1C5L1-ASY",
      "U1C5L1-ASS",
      "U1C5L1-BUF",
      "U1PDD3-SST",
      "U1PDD2-CORR",
    ],
  },
  "PD-BOM": {
    from: ["U1PDD3-SST", "U4PD3-BOM", "U1PDD-CORR"],
    to: ["U1PDD2-CORR", "U4FI-BOM", "U1PHOTO", "U1PACK", "U1PACK-SI"],
  },
  PHOTO: {
    from: ["U1PHOTO"],
    to: ["U1PACK", "U1PACK-SI"],
  },
  // 'CORR':{
  //    from:['U1PDD-CORR','U1PHOTO'],
  //    to:['U1PHOTO','U1PACK','U1PACK-SI']
  // },
  SISMA: {
    from: ["U4PD3-SISM", "U1PDD3-BUF"],
    to: [
      "U4PD3-1",
      "U4PD3-2",
      "U4PD3-3",
      "U4PD3-4",
      "U4PD3-5",
      "U4PD3-6",
      "U4PD3-7",
      "U4PD1-SEP",
      "U1PDD3-ASY",
      "U1PDD3-BP",
      "U1PDD3-CLR",
      "U1PDD3-SEP",
      "U1PDD3-BUF",
      "U1PDD",
      "U1PDD3-COR",
      "U1PDD2-SEP",
      "U1PDD2-ASY",
    ],
  },
  "INDIANIA CELL": {
    from: ["U1IND"],
    to: ["U1SAM-TEX", "U1PDD2-TXT"],
  },
  "MMD CELL": {
    from: ["U1MMD", "U1MMD1", "U1MMD2"],
    to: ["U1GS", "U1SAM-BUF", "U1SAM-TEX", "U1PDD2-TXT", "U1PDD2-BUF"],
  },

  "STAMPING CELL": {
    from: ["U1ST-PRESS"],
    to: ["U1GS", "U1SAMP", "U1PDD2-SEP"],
  },
  "ENAMEL CELL": {
    from: ["U1DLE", "U1PDD2-QC", "U1SAM-QC"],
    to: ["U1PDD2-TXT", "U1SAM-TEX", "U1SAM-BUF", "U1SAM-SST"],
  },
  "Imprez cell": {
    from: ["U1IM-PRESS"],
    to: ["U1GS", "U1SAMP", "U1PDD2-SEP"],
  },
  "Fusion Cell": {
    from: ["U1FUL1-BUF", "U1FU-TEXT", "U1FUL1-ASY", "U1FUL1-COR"],
    to: ["U1GS", "U1PDD2-BUF", "U1SAM-BUF", "U1PDD2-TXT", "U1SAM-TEX"],
  },
  "Gemstone cell": {
    from: [
      "U1C5L1-SST",
      "U1C5L1-ASY",
      "U1C5L1-ASS",
      "U1C5L1-BUF",
      "U1C5L1-TXT",
    ],
    to: ["U1GS", "U1QA", "U1SAM-TEX", "U1PDD2-TXT"],
  },
  "Cnc cell": {
    from: ["U1CNC -TXT"],
    to: ["U1QA"],
  },
  "UNIT-4 EFCELL": {
    from: [
      "U4PD-3DSCA",
      "U4FOUN",
      "U4MFD",
      "U4SCUL",
      "U4DIE",
      "U4CAST",
      "U4EF",
    ],
    to: [
      "U4PD-CAD",
      "U4FOUN",
      "U4CAST",
      "U4DIE",
      "U4PD-PRBOM",
      "U4EF",
      "U4SEP",
      "U4PD1-SEP",
    ],
  },
  "PD3 CELL": {
    from: [
      "U4PD3-1",
      "U4PD3-2",
      "U4PD3-3",
      "U4PD3-4",
      "U4PD3-5",
      "U4PD3-6",
      "U4PD3-7",
      "U1PDD3-ASY",
      "U1PDD3-BP",
      "U1PDD3-CLR",
      "U1PDD3-SEP",
      "U1PDD",
      "U1PDD3-COR",
    ],
    to: ["U4PD1-BUF", "U4PD1-SST", "U1PDD2-BUF", "U1PDD2-SST"],
  },
};
app.get("/departmentMappings", (req, res) => {
  res.json(departmentMappings);
});

app.get("/raw_filtered_production_data", (req, res) => {
  const deptFromFilter = Object.values(departmentMappings).flatMap(
    (mapping) => mapping.from
  );
  const deptToFilter = Object.values(departmentMappings).flatMap(
    (mapping) => mapping.to
  );

  const sql = `
         SELECT fromdept1, todept1, pdscwqty1,pltcode
         FROM production_log
         WHERE fromdept1 IN (?)
            
      `;

  db.query(
    sql,
    [
      deptFromFilter.map((dept) => dept.toLowerCase()),
      deptToFilter.map((dept) => dept.toLowerCase()),
    ],
    (err, data) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).json({ error: "Database query error" });
      }

      res.json(data);
    }
  );
});

app.get("/filtered_production_data", (req, res) => {
  const deptFromFilter = Object.values(departmentMappings).flatMap(
    (mapping) => mapping.from
  );
  const deptToFilter = Object.values(departmentMappings).flatMap(
    (mapping) => mapping.to
  );

  const lowerDeptFromFilter = deptFromFilter.map((dept) => dept.toLowerCase());
  const lowerDeptToFilter = deptToFilter.map((dept) => dept.toLowerCase());

  const sql = `
            SELECT fromdept1, todept1, SUM(pdscwqty1) AS total_qty
            FROM production_log
            WHERE LOWER(fromdept1) IN (?)
               AND LOWER(todept1) IN (?)
            GROUP BY fromdept1, todept1
         `;

  db.query(sql, [lowerDeptFromFilter, lowerDeptToFilter], (err, data) => {
    if (err) return res.json(err);

    const results = Object.keys(departmentMappings).reduce((acc, group) => {
      acc[group] = { total_qty: 0 };
      return acc;
    }, {});

    data.forEach((row) => {
      const fromDept = row.fromdept1.toUpperCase();
      const toDept = row.todept1.toUpperCase();
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

// app.get('/filtered_production_data', (req, res) => {
//    const deptFilter = ['WBKOL-CAD', 'U4PD-CAD'];
//    const toDeptFilter = ['U4PD-PRBOM', 'U1MMD', 'U1TOOL', 'U1CAM', 'U4PD-CAM'];

//    const depar2filter = ['U4PD-PRBOM']
//    const todepatfilter = ['U4PD-CAM','U4PD-WAX','U4PD-DIE','U1CAM','U4DIE','U4PD3-SISM','U1ST-SISMA','U1PDD3-BUF']
//    const sql = `
//        SELECT fromdept1, todept1, SUM(pdscwqty1) AS total_qty
//        FROM production_log
//        WHERE LOWER(fromdept1) IN (?)
//          AND LOWER(todept1) IN (?)
//        GROUP BY fromdept1, todept1
//    `;

//    db.query(sql, [deptFilter.map(dept => dept.toLowerCase()), toDeptFilter.map(dept => dept.toLowerCase())], (err, data) => {
//        if (err) return res.json(err);

//        const departmentMappings = {
//            'CAD': ['WBKOL-CAD', 'U4PD-CAD'],
//            'PRBOM': ['U4PD-PRBOM'],
//            'MMD': ['U1MMD'],
//            'TOOL': ['U1TOOL'],
//            'CAM': ['U1CAM', 'U4PD-CAM']
//        };

//        const results = Object.keys(departmentMappings).reduce((acc, group) => {
//            acc[group] = { total_qty: 0 };
//            return acc;
//        }, {});

//        data.forEach(row => {
//            const fromDept = row.fromdept1.toUpperCase();
//            const toDept = row.todept1.toUpperCase();
//            const qty = row.total_qty;

//            for (const [group, depts] of Object.entries(departmentMappings)) {
//                if (depts.includes(fromDept) || depts.includes(toDept)) {
//                    results[group].total_qty += qty;
//                }
//            }
//        });

//        return res.json(results);
//    });
// });

app.get("/production_data", (req, res) => {
  const sql = "SELECT * FROM production_log";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/pending_data", (req, res) => {
  const sql = "SELECT * FROM pending_log";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/raw_filtered_pending_data", (req, res) => {
  const deptToFilter = Object.values(departmentMappings).flatMap(
    (mapping) => mapping.from
  );
  const lowerToDeptFilter = deptToFilter.map((dept) => dept.toLowerCase());

  const sql = `
            SELECT todept, CAST(jcpdscwqty1 AS DECIMAL) as jcpdscwqty1,pltcoded1
            FROM pending_log
            WHERE LOWER(todept) IN (?)
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

app.get("/create-task", (req, res) => {
   const sql = "SELECT * FROM task";
   db.query(sql, (err, data) => {
      if (err) {
         console.error(err);
         return res.status(500).json({ message: "Failed to fetch tasks", error: err });
      }
      res.json(data);
   });
});

app.post("/create-task", (req, res) => {
   console.log("Request Body:", req.body);
   const { ax_brief, collection_name, project, no_of_qty, assign_date, target_date, priority } = req.body;
 
   if (!ax_brief || !collection_name || !project || !no_of_qty || !assign_date || !target_date || !priority) {
     console.error("Missing required fields");
     return res.status(400).json({ message: "Missing required fields" });
   }
 
   const sql = `
     INSERT INTO task (ax_brief, collection_name, project, no_of_qty, assign_date, target_date, priority)
     VALUES (?, ?, ?, ?, ?, ?, ?)`;
 
   const values = [ax_brief, collection_name, project, no_of_qty, assign_date, target_date, priority];
 
   db.query(sql, values, (err, result) => {
     if (err) {
       console.error("Database Error:", err); 
       return res.status(500).json({ message: "Failed to create task", error: err });
     }
     res.json({ message: "Task created successfully", taskId: result.insertId });
   });
 });
 
app.get("/tasks", (req, res) => {
   const sql = "SELECT * FROM task";
   db.query(sql, (err, data) => {
      if (err) {
         console.error(err);
         return res.status(500).json({ message: "Failed to fetch tasks", error: err });
      }
      res.json(data);
   });
   }
);
app.get("/filtered_pending_data", (req, res) => {
  const toDeptFilter = Object.values(departmentMappings).flatMap(
    (mapping) => mapping.from
  );
  const lowerToDeptFilter = toDeptFilter.map((dept) => dept.toLowerCase());

  const sql = `
            SELECT todept, SUM(CAST(jcpdscwqty1 AS DECIMAL)) AS total_qty
            FROM pending_log
            WHERE LOWER(todept) IN (?)
            GROUP BY todept
         `;

  db.query(sql, [lowerToDeptFilter], (err, data) => {
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

const PORT = process.env.PORT || 8081;

app.get("/", (req, res) => {
  return res.json("From Backend Side");
  
});



app.get("/order_receive&new_design", (req, res) => {
  const sql = `SELECT NAME1, TRANSDATE, ORDERNO, ZONE, Purity, Color, \`PHOTO NO 2\`, PRODUCT, QTY, WT, \`DD&month\`, Dyr 
               FROM Order_receiving_log`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ message: "Error executing query" });
    }

    console.log("Query results:", results); // Debug log to inspect results
    res.json(results);
  });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
