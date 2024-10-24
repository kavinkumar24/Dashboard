const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const multer = require("multer");
const xlsx = require("xlsx");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const moment = require("moment");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
dotenv.config();

const connectDB = require("./DB/Db");
const db = connectDB;

// Secret key for signing the JWT (you should store this in an environment variable)
const JWT_SECRET = "ejindiadashboard";

// Replace with your own secret
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// JWT authentication middleware
const authorize = (roles) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header

    console.log("Token:", token); // Debug: Check if token is present

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token", error: err });
      }

      req.user = decoded;

      // Check if user role is authorized
      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    });
  };
};


// Login route
const Post_Login = require("../router/post/Login");


const Send_mail = require("../router/post/Send_Mail");
app.use("/api", Send_mail);
app.use("/api", Post_Login);

// Protected route for admin
app.use("/api/admin-only", authorize(["admin"]), (req, res) => {
  res.status(200).json({ message: "Welcome, admin!" });
});

// Protected route for user
app.get("/api/user-only", authorize(["user"]), (req, res) => {
  res.status(200).json({ message: "Welcome, user!" });
});

// login page api end

const createDesignTable =
  "CREATE TABLE if not exists `design_center_task_sample` ( \
`Brief number` varchar(255) DEFAULT NULL, \
`Pre-Brief` varchar(255) DEFAULT NULL, \
`Employe id` varchar(255) DEFAULT NULL, \
`Employe Name` varchar(255) DEFAULT NULL, \
`Design center` varchar(255) DEFAULT NULL, \
`Design specification` varchar(255) DEFAULT NULL, \
`Jewel sub type` varchar(255) DEFAULT NULL, \
`Sub category` varchar(255) DEFAULT NULL, \
`Jewel type` varchar(255) DEFAULT NULL, \
`Document date` timestamp(6) NULL DEFAULT NULL, \
`Design type` varchar(255) DEFAULT NULL, \
`Minimum Weight` double DEFAULT NULL, \
`Maximum Weight` double DEFAULT NULL, \
`No Of Design` int(11) DEFAULT NULL, \
`Deadline date` timestamp(6) NULL DEFAULT NULL, \
`Confirmed` varchar(255) DEFAULT NULL, \
`Received` varchar(255) DEFAULT NULL, \
`Received by` varchar(255) DEFAULT NULL, \
`Received date` timestamp(6) NULL DEFAULT NULL, \
`Completed` timestamp(6) NULL DEFAULT NULL, \
`Created by` varchar(255) DEFAULT NULL, \
`Created date and time` varchar(255) DEFAULT NULL \
)";

db.query(createDesignTable, (err) => {
  if (err) {
    console.error("Error creating table:", err);
    return;
  }
});

const Target_post = require("../router/post/Target");
app.use("/api", Target_post);

const Design_center_post = require("../router/post/Design_center_upload");
app.use("/api", Design_center_post);

// ************ Production Data endpoints ******************* //

const createProductionTableQuery = `CREATE TABLE IF NOT EXISTS \`Production_sample_data\` (
  \`JC ID\` varchar(255) DEFAULT NULL,
  \`Brief No\` varchar(255) DEFAULT NULL,
  \`PRE-BRIEF NO\` varchar(255) DEFAULT NULL,
  \`Sketch No\` varchar(255) DEFAULT NULL,
  \`Item ID\` varchar(255) DEFAULT NULL,
  \`Purity\` varchar(255) DEFAULT NULL,
  \`Empid\` varchar(255) DEFAULT NULL,
  \`Ref Empid\` varchar(255) DEFAULT NULL,
  \`Name\` varchar(255) DEFAULT NULL,
  \`Jwl Type\` varchar(255) DEFAULT NULL,
  \`Project\` varchar(255) DEFAULT NULL,
  \`Sub Category\` varchar(255) DEFAULT NULL,
  \`CW Qty\` decimal(19,4) DEFAULT NULL,
  \`Qty\` decimal(19,4) DEFAULT NULL,
  \`From Dept\` varchar(255) DEFAULT NULL,
  \`To Dept\` varchar(255) DEFAULT NULL,
  \`In Date\` timestamp(6) NULL DEFAULT NULL,
  \`Out Date\` timestamp(6) NULL DEFAULT NULL,
  \`Hours\` varchar(255) DEFAULT NULL,
  \`Days\` double DEFAULT NULL,
  \`Description\` varchar(255) DEFAULT NULL,
  \`Design specification\` varchar(255) DEFAULT NULL,
  \`PRODUNITID\` varchar(255) DEFAULT NULL,
  \`Remarks\` varchar(255) DEFAULT NULL,
  \`fileID\` varchar(10) DEFAULT NULL,
  \`unique_fileID\` VARCHAR(10) DEFAULT NULL
)`;

db.query(createProductionTableQuery, (err) => {
  if (err) {
    console.error("Error creating table:", err);
    return;
  }
});

const Save_Remarks = require("../router/post/Save_Remarks");
app.use("/api", Save_Remarks);

const Remarks_home = require("../router/get/Remarks_Home");
const Production_Upload = require("../router/post/Production_Upload");
const Pending_Upload = require("../router/post/Pending_Upload");

app.use("/api", Remarks_home);
app.use("/api", Production_Upload);
app.use("/api", Pending_Upload);

// ************ End of Production Data post endpoint ******************* //

// ************ Pending Data post endpoints ******************* //

const createPendingTableQuery = `CREATE TABLE IF NOT EXISTS \`Pending_sample_data\` (
  \`TODEPT\` varchar(255) DEFAULT NULL,
  \`JCID1\` varchar(255) DEFAULT NULL,
  \`BRIEFNUM1\` varchar(255) DEFAULT NULL,
  \`MERCHANDISERBRIEF1\` varchar(255) DEFAULT NULL,
  \`SKETCHNUM1\` varchar(255) DEFAULT NULL,
  \`ITEMID\` varchar(255) DEFAULT NULL,
  \`PERSONNELNUMBER1\` varchar(255) DEFAULT NULL,
  \`NAME1\` varchar(255) DEFAULT NULL,
  \`PLTCODE1\` varchar(255) DEFAULT NULL,
  \`PURITY1\` varchar(255) DEFAULT NULL,
  \`ARTICLECODE1\` varchar(255) DEFAULT NULL,
  \`COMPLEXITY1\` varchar(255) DEFAULT NULL,
  \`JCPDSCWQTY1\` double DEFAULT NULL,
  \`JCQTY1\` double DEFAULT NULL,
  \`DATE1\` timestamp(6) NULL DEFAULT NULL,
  \`Textbox56\` double DEFAULT NULL,
  \`Textbox87\` double DEFAULT NULL,
  \`Textbox60\` double DEFAULT NULL,
  \`DESIGNSPEC1\` varchar(255) DEFAULT NULL,
  \`RECEIVED1\` varchar(255) DEFAULT NULL,
  \`RECVDATE1\` timestamp(6) NULL DEFAULT NULL,
  \`REMARKS1\` varchar(255) DEFAULT NULL,
  \`HALLMARKINCERTCODE1\` varchar(255) DEFAULT NULL,
  \`fileID\` varchar(10) DEFAULT NULL,
  \`unique_fileID\` varchar(10) DEFAULT NULL,
  \`uploadedDateTime\` timestamp NULL DEFAULT NULL
)`;

db.query(createPendingTableQuery, (err) => {
  if (err) {
    console.error("Error creating table:", err);
    return;
  }
});

// ************ end of Pending Data post endpoints ******************* //

// ************** order rececing //////////////////////////////////

const createOrderReceivingTableQuery = `CREATE TABLE IF NOT EXISTS \`Order_receiving_log_sample\` (
  \`NAME1\` varchar(255) DEFAULT NULL,
  \`SUB PARTY\` varchar(255) DEFAULT NULL,
  \`Group party\` varchar(255) DEFAULT NULL,
  \`JCID\` varchar(255) DEFAULT NULL,
  \`TRANSDATE\` timestamp(6) NULL DEFAULT NULL,
  \`ORDERNO\` varchar(255) DEFAULT NULL,
  \`OrderType\` varchar(255) DEFAULT NULL,
  \`ZONE\` varchar(255) DEFAULT NULL,
  \`OGPG\` varchar(255) DEFAULT NULL,
  \`Purity\` varchar(255) DEFAULT NULL,
  \`Color\` varchar(255) DEFAULT NULL,
  \`PHOTO NO\` varchar(255) DEFAULT NULL,
  \`PHOTO NO 2\` varchar(255) DEFAULT NULL,
  \`PROJECT\` varchar(255) DEFAULT NULL,
  \`TYPE\` varchar(255) DEFAULT NULL,
  \`ITEM\` varchar(255) DEFAULT NULL,
  \`PRODUCT\` varchar(255) DEFAULT NULL,
  \`SUB PRODUCT\` varchar(255) DEFAULT NULL,
  \`QTY\` double DEFAULT NULL,
  \`WT\` double DEFAULT NULL,
  \`Avg\` double DEFAULT NULL,
  \`Wt range\` varchar(255) DEFAULT NULL,
  \`PL-ST\` varchar(255) DEFAULT NULL,
  \`DD\` timestamp(6) NULL DEFAULT NULL,
  \`SKCHNI\` varchar(255) DEFAULT NULL,
  \`EMP\` varchar(255) DEFAULT NULL,
  \`Name\` varchar(255) DEFAULT NULL,
  \`CODE\` varchar(255) DEFAULT NULL,
  \`GENDER\` varchar(255) DEFAULT NULL,
  \`2024_Set_Photo\` varchar(255) DEFAULT NULL,
  \`Po_new\` varchar(255) DEFAULT NULL,
  \`DD&month\` varchar(255) NULL DEFAULT NULL,
  \`Dyr\` double DEFAULT NULL,
  \`Brief\` varchar(255) DEFAULT NULL,
  \`Maketype\` varchar(255) DEFAULT NULL,
  \`collection\` double DEFAULT NULL,
  \`Collection_1\` varchar(255) DEFAULT NULL,
  \`Collection_2\` varchar(255) DEFAULT NULL,
  \`fileID\` varchar(255) DEFAULT NULL,
  \`uploadedDateTime\` timestamp NULL DEFAULT NULL
);`;

db.query(createOrderReceivingTableQuery, (err) => {
  if (err) {
    console.error("Error creating table:", err);
    return;
  }
});

const Order_receving_upload = require("../router/post/Order_Receive_upload");
app.use("/api", Order_receving_upload);

/////// ******** end of order receving *************************//

const JewelMaster = require("../router/get/JewelMaster");
const Target = require("../router/get/Target");
const Department_mapping = require("../router/get/Departmen_mapping");
const raw_filtered_production_data = require("../router/get/raw_filtered_production");
const pending = require("../router/get/pending");
const Production = require("../router/get/Production");
const User_Data = require("../router/get/Logging_Data");
const Create_Task = require("../router/get/Create_Task");
const Upload_Time = require("../router/get/Upload_Time");

app.use("/api", JewelMaster);
app.use("/api", Target);
app.use("/api", Department_mapping);
app.use("/api", raw_filtered_production_data);
app.use("/api", pending);
app.use("/api", Production);
app.use("/api", User_Data);
app.use("/api", Create_Task);
app.use("/api", Upload_Time);

const PORT = process.env.PORT || 8081;

app.get("/", (req, res) => {
  return res.json("From Backend Side");
});

const Order_Receive = require("../router/get/Order_receive");
const Rejection = require("../router/post/Rejections");
const Rejection_get = require("../router/get/Rejections");
const Design_center_brief = require("../router/get/Design_center_brief");
const Cellmaster = require("../router/get/CellMaster");
const party_Visit = require("../router/get/Party_Visit");
app.use("/api", Order_Receive);

const createTableQuery = `CREATE TABLE IF NOT EXISTS rejection (
  file_ID VARCHAR(100),
  Yr VARCHAR(10),
  MONTH VARCHAR(20),
  Date VARCHAR(10),  
  RaisedDate VARCHAR(10),  
  RaisedDept VARCHAR(50),
  ReasonDept VARCHAR(50),
  ToDept VARCHAR(50),
  SketchNo VARCHAR(50),
  JcidNo VARCHAR(50),
  Collections VARCHAR(50),
  TypeOfReason VARCHAR(50),
  ProblemArised VARCHAR(255),
  Problem1 VARCHAR(255),
  ProblemArised2 VARCHAR(255),
  COUNT INT,
  OperatorNameID VARCHAR(50),
  uploadedDateTime TIMESTAMP
);`;

db.query(createTableQuery, (err) => {
  if (err) {
    console.error("Error creating table:", err);
    return;
  }
});

app.use("/api", Rejection);
app.use("/api", Rejection_get);
app.use("/api", Design_center_brief);
app.use("/api/", Cellmaster);
app.use("/api", party_Visit);

app.get("/api/dept_targets", (req, res) => {
  const query = "SELECT department_name, target FROM Dept_Target";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching targets:", err);
      return res.status(500).send("Server error");
    }

    res.json(results);
  });
});

// Assuming you're using Express and have a database connection setup
app.post("/api/depart_targets", (req, res) => {
  const { department_name, target } = req.body;

  // Basic validation
  if (!department_name || target === undefined) {
    return res.status(400).send("Department name and target are required");
  }

  const query = "UPDATE Dept_Target SET target = ? WHERE department_name = ?";
  db.query(query, [target, department_name], (err, results) => {
    if (err) {
      console.error("Error updating target:", err);
      return res.status(500).send("Server error");
    }

    res.json({ success: true, department_name, target });
  });
});


app.delete("/api/deletetoday_pro", (req, res) => {
  const query = "DELETE FROM Production_sample_data WHERE DATE(uploadedDateTime) = CURDATE()";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error deleting today's production data:", err);
      return res.status(500).send("Server error");
    }

    res.json({ success: true });
  });
});


app.delete("/api/deletePending", (req, res) => {
  const { month, year } = req.query;

  const monthMap = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };

  const monthNumber = monthMap[month];
  
  if (!monthNumber || !year) {
    return res.status(400).send("Month and year are required.");
  }

  const query = `
    DELETE FROM Pending_sample_data 
    WHERE MONTH(uploadedDateTime) = ? AND YEAR(uploadedDateTime) = ?
  `;

  db.query(query, [monthNumber, year], (err, results) => {
    if (err) {
      console.error("Error deleting pending data:", err);
      return res.status(500).send("Server error");
    }

    res.json({ success: true });
  });
});

app.delete("api/delete_pro_month", (req, res) => {
  const { month, year } = req.query;

  const monthMap = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };

  const monthNumber = monthMap[month];
  
  if (!monthNumber || !year) {
    return res.status(400).send("Month and year are required.");
  }

  const query = ` DELETE FROM Production_sample_data 
    WHERE MONTH(uploadedDateTime) = ? AND YEAR(uploadedDateTime) = ?`

  db.query(query, [monthNumber, year], (err, results) => {
    if (err) {
      console.error("Error deleting production data:", err);
      return res.status(500).send("Server error");
    }

    res.json({ success: true });
  });
});




app.delete("/api/deletetoday_pen", (req, res) => {
  const query = "DELETE FROM Pending_sample_data WHERE DATE(uploadedDateTime) = CURDATE()";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error deleting today's pending data:", err);
      return res.status(500).send("Server error");
    }

    res.json({ success: true });
  });
});

app.delete("/api/delete-target", (req, res) => {
  const query = "TRUNCATE target";
  db.query(query, [req.body.department_name], (err, results) => {
    if (err) {
      console.error("Error deleting target:", err);
      return res.status(500).send("Server error");
    }

    res.json({ success: true });
  }
  );
});

app.delete("/api/delete-total-pro", (req, res) => {
  const query = "TRUNCATE Production_sample_data";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error deleting total production data:", err);
      return res.status(500).send("Server error");
    }
    
    res.json({ success: true });
  });
});

app.delete("/api/delete-total-pen", (req, res) => {
  const query = "TRUNCATE Pending_sample_data";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error deleting total pending data:", err);
      return res.status(500).send("Server error");
    }

    res.json({ success: true });
  });
});

app.delete("/api/delete-total-rejections", (req, res) => {
  const query = "TRUNCATE rejection";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error deleting total rejection data:", err);
      return res.status(500).send("Server error");
    }

    res.json({ success: true });
  });
});

app.delete("/api/delete-created-task", (req, res) => {
  const query = "TRUNCATE Created_task";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error deleting total order receiving data:", err);
      return res.status(500).send("Server error");
    }

    res.json({ success: true });
  });
});

app.delete("/api/delete-total-design-center", (req, res) => {
  const query = "TRUNCATE design_center_task_sample";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error deleting total design center data:", err);
      return res.status(500).send("Server error");
    }

    res.json({ success: true });
  });
}
);

app.post("/api/Add_users", (req, res) => {
  const { emp_id, email, password, role, emp_name, dept } = req.body;

  // Validate the required fields
  if (!emp_id || !email || !password || !role || !emp_name || !dept) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Ensure `dept` is an array and convert it to JSON if necessary
  const department = JSON.stringify(dept); // Convert array to JSON string

  // Insert into the database
  const query = `INSERT INTO users (emp_id, Email, password, role, emp_name, dept) VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(query, [emp_id, email, password, role, emp_name, department], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error adding user" });
    }
    res.status(200).json({ message: "User added successfully" });
  });
});







// Function to group the target data by unique Project (PLTCODE)
app.get("/aop/WeeklyData", async (req, res) => {
  const sql = `SELECT dept, PLTCODE1, Week1, Week2, Week3, Week4, Month_data, Completed
                 FROM AOP_PLTCODE_Data_Week_wise;`;

  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error fetching AOP data:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    // Initialize the output structure
    const output = {};

    // Process each row
    data.forEach((row) => {
      const { dept, PLTCODE1, Week1, Week2, Week3, Week4, Month_data } = row;

      // Initialize the department if it doesn't exist
      if (!output[dept]) {
        output[dept] = [];
      }

      // Find or create the PLTCODE1 entry in the department
      let pltCodeEntry = output[dept].find(
        (entry) => entry.PLTCODE1 === PLTCODE1
      );

      if (!pltCodeEntry) {
        pltCodeEntry = { PLTCODE1: PLTCODE1, data: [] };
        output[dept].push(pltCodeEntry);
      }

      // Add the weekly data
      pltCodeEntry.data.push({
        Week1: Week1,
        Week2: Week2,
        Week3: Week3,
        Week4: Week4,
        Month_data: Month_data,
        Completed: row.Completed,
      });
      output[dept].push({ Month_data: Month_data });
    });

    // Send the response
    res.json(output);
  });
});

app.post("/api/week-wise-data", async (req, res) => {
  const updates = req.body;

  const updateQueries = updates.map((update) => {
    const { PLTCODE1, Week1, Week2, Week3, Week4, Dept } = update;

    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO AOP_PLTCODE_Data_Week_wise (PLTCODE1, Dept, Week1, Week2, Week3, Week4)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          Week1 = Week1 + VALUES(Week1),
          Week2 = Week2 + VALUES(Week2),
          Week3 = Week3 + VALUES(Week3),
          Week4 = Week4 + VALUES(Week4)
      `;

      const values = [PLTCODE1, Dept, Week1, Week2, Week3, Week4];

      db.query(sql, values, (err, result) => {
        if (err) {
          console.error("Error updating week data:", err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  });

  try {
    await Promise.all(updateQueries);
    res.status(200).json({ message: "Weeks updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update weeks" });
  }
});

app.post("/api/update-week-data", async (req, res) => {
  try {
    const updatedProjects = req.body; // Array of updated PLTCODE1 data

    // Iterate over each project to update the week data in the database
    for (const project of updatedProjects) {
      const { PLTCODE1, Dept, Week1, Week2, Week3, Week4 } = project;

      // Check if the PLTCODE1 and Dept combination exists
      const existingEntry = await db.query(
        "SELECT * FROM AOP_PLTCODE_Data_Week_wise WHERE PLTCODE1 = ? AND dept = ?",
        [PLTCODE1, Dept]
      );

      if (existingEntry.length > 0) {
        // If the entry exists, update only the week data
        await db.query(
          `UPDATE AOP_PLTCODE_Data_Week_wise 
           SET Week1 = ?, Week2 = ?, Week3 = ?, Week4 = ? 
           WHERE PLTCODE1 = ? AND dept = ?`,
          [Week1, Week2, Week3, Week4, PLTCODE1, Dept]
        );
      } else {
        // If no entry exists, create a new one with week data (optional)
        await db.query(
          `INSERT INTO AOP_PLTCODE_Data_Week_wise 
           (PLTCODE1, dept, Week1, Week2, Week3, Week4) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [PLTCODE1, Dept, Week1, Week2, Week3, Week4]
        );
      }
    }

    res.status(200).json({ message: "Week data successfully updated!" });
  } catch (error) {
    console.error("Error updating week data:", error);
    res.status(500).json({ message: "Error updating week data." });
  }
});

const createOperationalTaskTableQuery = `CREATE TABLE IF NOT EXISTS operational_task (
    task_id VARCHAR(10) PRIMARY KEY,
    project_name VARCHAR(255),
    STATUS VARCHAR(50) DEFAULT 'In Progress',
    assignee VARCHAR(255),
    starting_date DATE,
    target_date DATE,
    priority VARCHAR(50),
    last_edited DATE,
    attachment VARCHAR(50) DEFAULT 'Not Yet Received'
);
`;
db.query(createOperationalTaskTableQuery, (err) => {
  if (err) {
    console.error("Error creating operational_task table:", err);
    return;
  }
});

const Operational_Task_post = require("../router/post/Operational_Task");
const Operational_Task_get = require("../router/get/Operational_Task");

app.use("/api", Operational_Task_post);

app.use("/api", Operational_Task_get);

const createTeamDetailsTableQuery = `
  CREATE TABLE IF NOT EXISTS team_member_details (
    member_id VARCHAR(20),
    task_id VARCHAR(20),
    name VARCHAR(255),
    mail_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'In Progress',
    attachment_file TEXT,
    FOREIGN KEY (task_id) REFERENCES operational_task(task_id) ON DELETE CASCADE,
    PRIMARY KEY (member_id)
  );
`;

db.query(createTeamDetailsTableQuery, (err) => {
  if (err) {
    console.error("Error creating team_member_details table:", err);
    return;
  }
});

// Function to run when the server starts
const initializeDepartments = () => {
  // SQL to create the Dept_Target table if it doesn't exist
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS Dept_Target (
      id INT AUTO_INCREMENT PRIMARY KEY,
      department_name VARCHAR(255) NOT NULL UNIQUE,
      target INT DEFAULT 100
    );
  `;

  // First, create the table
  db.query(createTableQuery, (err) => {
    if (err) {
      console.error("Error creating Dept_Target table:", err);
      return; // Handle error appropriately
    }

    // Now proceed to fetch department mappings
    const departmentTarget = `
      SELECT * FROM Production_master_deparment_mapping
    `;

    db.query(departmentTarget, (err, rows) => {
      if (err) {
        console.error("Error fetching department mappings:", err);
        return; // Handle error appropriately
      }

      // Transform the data into the desired format
      const result = {};

      rows.forEach((row) => {
        const groupWh = row["Group Wh"];
        if (!result[groupWh]) {
          result[groupWh] = { from: [], to: [] };
        }
        if (
          row["From Dept"] &&
          !result[groupWh].from.includes(row["From Dept"])
        ) {
          result[groupWh].from.push(row["From Dept"]);
        }
        if (row["To Dept"] && !result[groupWh].to.includes(row["To Dept"])) {
          result[groupWh].to.push(row["To Dept"]);
        }
      });

      // Prepare department names for insertion into Dept_Target
      const departmentsToInsert = Object.keys(result).filter(
        (dept) => dept !== "null"
      );

      // Check existing departments
      const existingDepartmentsQuery = `
        SELECT department_name FROM Dept_Target WHERE department_name IN (${departmentsToInsert
          .map((dept) => `'${dept}'`)
          .join(",")})
      `;

      db.query(existingDepartmentsQuery, (err, existingRows) => {
        if (err) {
          console.error("Error checking existing departments:", err);
          return; // Handle error appropriately
        }

        // Create a set of existing department names for quick lookup
        const existingDepartmentsSet = new Set(
          existingRows.map((row) => row.department_name)
        );

        // Insert departments into Dept_Target if they don't exist
        const insertPromises = departmentsToInsert.map((dept) => {
          if (!existingDepartmentsSet.has(dept)) {
            return new Promise((resolve, reject) => {
              const insertSql = `INSERT INTO Dept_Target (department_name, target) VALUES ('${dept}', 100);`;
              db.query(insertSql, (insertErr) => {
                if (insertErr) {
                  console.error("Error inserting department:", insertErr);
                  reject(insertErr);
                } else {
                  resolve();
                }
              });
            });
          }
          // If the department already exists, resolve immediately
          return Promise.resolve();
        });

        // Execute all insert promises
        Promise.all(insertPromises)
          .then(() => {
            console.log("Departments initialized successfully.");
          })
          .catch((error) => {
            console.error("Error during department inserts:", error);
          });
      });
    });
  });
};

const createPhaseTableQuery = `
CREATE TABLE IF NOT EXISTS phase_tasks (
  task_id VARCHAR(10),
  phase_id VARCHAR(10),
  task_name VARCHAR(255),
  description TEXT,
  start_date DATE,
  end_date DATE,
  assignee VARCHAR(255),
  owner_email VARCHAR(255),
  grace_period DATE,
  STATUS VARCHAR(50) DEFAULT 'In Progress',
  notes TEXT,
  ot_id VARCHAR (10)
);
`;

db.query(createPhaseTableQuery, (err) => {
  if (err) {
    console.error("Error creating team_member_details table:", err);
    return;
  }
});

const Phase_Task_post = require("../router/post/Phase_Task");
const Phase_Task_get = require("../router/get/Phase_Task");
app.use("/api", Phase_Task_post);
app.use("/api", Phase_Task_get);

const party_Visit_post = require("../router/post/Party_Visit");
app.use("/api", party_Visit_post);

const User_get = require("../router/get/User");
app.use("/api", User_get);

async function getPasswordForEmail(email) {
  try {
    const response = await axios.get(
      "http://localhost:8081/api/user/loggedin/data",
      {
        params: { email },
      }
    );

    const user = response.data.find((user) => user.Email === email);
    // console.log(user,"user")

    if (user) {
      // console.log(user,"yeah")
      return user.password; // Return the password if user found
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    console.error("Error fetching password:", error);
    throw error; // Rethrow or handle as necessary
  }
}

async function getUsernameForEmail(email) {
  try {
    const response = await axios.get(
      "http://localhost:8081/api/user/loggedin/data",
      {
        params: { email },
      }
    );
    const user = response.data.find((user) => user.Email === email);
    if (user) {
      return user.emp_name;
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    console.error("Error fetching username:", error);
    throw error; // Rethrow or handle as necessary
  }
}

const nodemailer = require("nodemailer");

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}









app.post("/clear-weekly-data", async (req, res) => {
  try {
    const query = `
      UPDATE AOP_PLTCODE_Data_Week_wise
      SET Week1 = 0,
          Week2 = 0,
          Week3 = 0,
          Week4 = 0,
          CreatedAt = NOW(),
          Month_data = NULL,
          Completed = NULL;
    `;

    db.query(query, (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).send("Database error");
      }
      res.json({ message: "Weekly data cleared successfully!" });
    });
  } catch (error) {
    console.error("Error clearing weekly data:", error);
    res.status(500).send("Error clearing weekly data");
  }
});


app.get("/filtered_production_data_with_dates", async (req, res) => {
  try {
    // Get department mappings
    const response = await axios.get(
      "http://localhost:8081/api/department-mappings"
    );
    const departmentMappings = response.data;
    const { startDate, endDate } = req.query;
    // const startDate = '2024-10-18';
    // const endDate = '2024-10-22';

    // Validate the provided dates
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Please provide valid startDate and endDate" });
    }

    // Parse the start and end dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check the difference between start and end dates should be 5 days
    const dayDifference = (end - start) / (1000 * 60 * 60 * 24);
    if (dayDifference !== 4) {
      return res
        .status(400)
        .json({ error: "Please provide a range of 5 days" });
    }

    // Generate date ranges for each of the 5 days
    const dateRanges = [];
    for (let i = 0; dateRanges.length < 5; i++) {
      const dayStart = new Date(start);
      dayStart.setDate(start.getDate() + i);
    
      // If the day is Sunday, skip this iteration
      if (dayStart.getDay() === 0) continue;
    
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);
    
      dateRanges.push({ dayStart, dayEnd });
    }


    // Extract department mappings
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

    // SQL query to get total quantity for each day
    const sql = `
    SELECT \`From Dept\`, \`To Dept\`, COUNT(\`CW Qty\`) AS total_qty, 
           CASE 
             ${dateRanges
               .map(
                 (_, i) =>
                   `WHEN UploadedDateTime >= ? AND UploadedDateTime < ? THEN 'day${i + 1}'`
               )
               .join("\n")}
             ELSE NULL
           END AS day_type
    FROM Production_sample_data
    WHERE LOWER(\`From Dept\`) IN (?) 
      AND LOWER(\`To Dept\`) IN (?) 
      AND (${dateRanges
        .map(() => "(UploadedDateTime >= ? AND UploadedDateTime < ?)")
        .join(" OR ")})
    GROUP BY \`From Dept\`, \`To Dept\`, day_type
  `;
  

    // Flatten the params for all days
    const params = [
      ...dateRanges.flatMap(({ dayStart, dayEnd }) => [dayStart, dayEnd]),
      lowerDeptFromFilter,
      lowerDeptToFilter,
      ...dateRanges.flatMap(({ dayStart, dayEnd }) => [dayStart, dayEnd]),
    ];

    db.query(sql, params, (err, data) => {
      if (err) return res.json(err);

      // Initialize the result object with all departments set to 0 for all 5 days
      const results = {
        day1: {},
        day2: {},
        day3: {},
        day4: {},
        day5: {},
      };

      // Set all departments to 0 initially
      Object.keys(departmentMappings).forEach((group) => {
        for (let i = 1; i <= 5; i++) {
          results[`day${i}`][group] = 0;
        }
      });

      // Update the total_qty based on the actual query results
      data.forEach((row) => {
        const fromDept = row["From Dept"].toUpperCase();
        const toDept = row["To Dept"].toUpperCase();
        const qty = row.total_qty;
        const dayType = row.day_type; // 'day1', 'day2', ..., 'day5'

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


app.get("/aop", async (req, res) => {
  const sql = `SELECT * FROM AOP_PLTCODE_Data_Week_wise`;
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error fetching AOP data:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    res.json(data);
  });
});

app.get("/filtered_pending_data_with_dates", async (req, res) => {
  try {
    // Get department mappings
    const response = await axios.get(
      "http://localhost:8081/api/department-mappings"
    );
    const departmentMappings = response.data;

    // Get startDate and endDate from query params
    const { startDate, endDate } = req.query;
    // const startDate = '2024-10-12';
    // const endDate = '2024-10-16';

    // Validate the provided dates
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Please provide valid startDate and endDate" });
    }

    // Parse the start and end dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check that the difference between start and end dates is exactly 5 days
    const dayDifference = (end - start) / (1000 * 60 * 60 * 24);
    if (dayDifference !== 4) {
      return res
        .status(400)
        .json({ error: "Please provide a range of 5 days" });
    }

    const dateRanges = [];
    for (let i = 0; dateRanges.length < 5; i++) {
      const dayStart = new Date(start);
      dayStart.setDate(start.getDate() + i);
    
      // If the day is Sunday, skip this iteration
      if (dayStart.getDay() === 0) continue;
    
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);
    
      dateRanges.push({ dayStart, dayEnd });
    }
    // Extract department mappings
    const toDeptFilter = Object.values(departmentMappings).flatMap(
      (mapping) => mapping.from
    );
    const lowerToDeptFilter = toDeptFilter.map((dept) => dept.toLowerCase());

    // SQL query to get total quantity for each day
    const sql = `
    SELECT todept, 
           COUNT(CAST(jcpdscwqty1 AS DECIMAL)) AS total_qty,
           CASE 
               ${dateRanges
                 .map(
                   (_, i) => `WHEN UploadedDateTime >= ? AND UploadedDateTime < ? THEN 'day${i + 1}'`
                 )
                 .join("\n")}
               ELSE NULL
           END AS day_type
    FROM Pending_sample_data
    WHERE LOWER(todept) IN (?)
      AND (${dateRanges
        .map(() => "(UploadedDateTime >= ? AND UploadedDateTime < ?)")
        .join(" OR ")})
    GROUP BY todept, day_type
  `;
  

    // Flatten the params for all days
    const params = [
      ...dateRanges.flatMap(({ dayStart, dayEnd }) => [dayStart, dayEnd]),
      lowerToDeptFilter,
      ...dateRanges.flatMap(({ dayStart, dayEnd }) => [dayStart, dayEnd]),
    ];

    db.query(sql, params, (err, data) => {
      if (err) return res.json(err);

      // Initialize the result object with all departments set to 0 for all 5 days
      const results = {
        day1: {},
        day2: {},
        day3: {},
        day4: {},
        day5: {},
      };

      // Set all departments to 0 initially
      Object.keys(departmentMappings).forEach((group) => {
        for (let i = 1; i <= 5; i++) {
          results[`day${i}`][group] = 0;
        }
      });

      // Update the total_qty based on the actual query results
      data.forEach((row) => {
        const toDept = row.todept ? row.todept.toUpperCase() : null;
        const qty = row.total_qty;
        const dayType = row.day_type; // 'day1', 'day2', ..., 'day5'

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



// month -filter

app.get("/filtered_production_data_with_months", async (req, res) => {
  try {
    // Get department mappings
    const response = await axios.get(
      "http://localhost:8081/api/department-mappings"
    );
    const departmentMappings = response.data;
    if (!departmentMappings) {
      throw new Error("Department mappings not available");
    }
    const { month1, month2, year } = req.query;

    // Validate the provided months
    if (!month1 || !month2 || !year) {
      return res
        .status(400)
        .json({ error: "Please provide valid months and year" });
    }

    const m1 = parseInt(month1);
    const m2 = parseInt(month2);

    // Validate the months (should be between 1 and 12)
    if (m1 < 1 || m1 > 12 || m2 < 1 || m2 > 12) {
      return res.status(400).json({ error: "Please provide valid month values between 1 and 12" });
    }

    const y = parseInt(year);

    const start = new Date(y, m1-1, 2); // Start of the first selected month
    const end = new Date(y, m2, 2);       // First day of the next month
    end.setDate(end.getDate() - 1);       // Subtract 1 day to get the last day of the selected second month

    


    // Helper function to generate a list of all dates between start and end
    const getAllDatesInRange = (startDate, endDate) => {
      const dates = [];
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const formattedDate = currentDate.toISOString().split("T")[0]; // Format YYYY-MM-DD
        dates.push(formattedDate);
        currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
      }

      return dates;
    };

    // Get all dates between the start and end date
    const allDates = getAllDatesInRange(start, end);

    // SQL query to get daily quantity for each day in the selected months
    const sql = `
      SELECT \`From Dept\`, \`To Dept\`, COUNT(\`CW Qty\`) AS total_qty, 
             DATE(UploadedDateTime) AS production_date
      FROM Production_sample_data
      WHERE LOWER(\`From Dept\`) IN (?) 
        AND LOWER(\`To Dept\`) IN (?)
        AND (UploadedDateTime >= ? AND UploadedDateTime <= ?)
      GROUP BY \`From Dept\`, \`To Dept\`, production_date
      ORDER BY production_date
    `;

    // Convert department mappings to lowercase filters
    const lowerDeptFromFilter = Object.values(departmentMappings).flatMap((mapping) => {
      if (Array.isArray(mapping.from)) {
        return mapping.from.map((dept) => dept.toLowerCase());
      } else if (typeof mapping.from === 'string') {
        return mapping.from.toLowerCase();
      } else {
        console.error('Unexpected type for mapping.from:', mapping.from);
        return [];
      }
    });
    
    const lowerDeptToFilter = Object.values(departmentMappings).flatMap((mapping) => {
      if (Array.isArray(mapping.to)) {
        return mapping.to.map((dept) => dept.toLowerCase());
      } else if (typeof mapping.to === 'string') {
        return mapping.to.toLowerCase();
      } else {
        console.error('Unexpected type for mapping.to:', mapping.to);
        return [];
      }
    });
    
    const params = [lowerDeptFromFilter, lowerDeptToFilter, start, end];

    db.query(sql, params, (err, data) => {
      if (err) return res.json(err);
    
      const results = {};
    
      // Initialize results with all dates and empty department quantities
      allDates.forEach((date) => {
        results[date] = Object.keys(departmentMappings).map((group) => ({
          [group]: 0, // Initialize each department's quantity to 0
        }));
      });
    
      // Update results based on actual query data
      data.forEach((row) => {
        const fromDept = row["From Dept"].toUpperCase();
        const toDept = row["To Dept"].toUpperCase();
        const productionDate = row.production_date;
    
        // Format the productionDate to YYYY-MM-DD
        const formattedDate = new Date(productionDate).toISOString().split("T")[0];
    
        const qty = row.total_qty;
    
        // Ensure the formatted date exists in results
        if (!results[formattedDate]) {
          results[formattedDate] = Object.keys(departmentMappings).map((group) => ({
            [group]: 0, // Initialize with 0
          }));
        }
    
        // Update the quantity for the matching department
        Object.keys(departmentMappings).forEach((group) => {
          const { from, to } = departmentMappings[group];
          if (from.includes(fromDept) && to.includes(toDept)) {
            results[formattedDate] = results[formattedDate].map((deptData) => {
              if (deptData[group] !== undefined) {
                return { [group]: qty }; // Update the department's quantity
              }
              return deptData;
            });
          }
        });
      });
    
      return res.json(results);
    });
    
    
  } catch (error) {
    console.error("Error fetching production data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});







app.get("/filtered_pending_data_with_months", async (req, res) => {
  try {
    // Get department mappings
    const response = await axios.get(
      "http://localhost:8081/api/department-mappings"
    );
    const departmentMappings = response.data;

    // Get month1, month2, and year from query params
    const { month1, month2, year } = req.query;

    // Validate the provided months and year
    if (!month1 || !month2 || !year) {
      return res
        .status(400)
        .json({ error: "Please provide valid months and year" });
    }

    const m1 = parseInt(month1);
    const m2 = parseInt(month2);
    const y = parseInt(year);

    // Validate the months (should be between 1 and 12)
    if (m1 < 1 || m1 > 12 || m2 < 1 || m2 > 12) {
      return res.status(400).json({ error: "Please provide valid month values between 1 and 12" });
    }

    const start = new Date(y, m1-1, 2); // Start of the first selected month
    const end = new Date(y, m2, 2);       // First day of the next month
    end.setDate(end.getDate() - 1);       // Subtract 1 day to get the last day of the selected second month


    // Extract department mappings
    const toDeptFilter = Object.values(departmentMappings).flatMap(
      (mapping) => mapping.from
    );
    const lowerToDeptFilter = toDeptFilter.map((dept) => dept.toLowerCase());

    // SQL query to get total quantity for each day in the selected months
    const sql = `
      SELECT todept, COUNT(CAST(jcpdscwqty1 AS DECIMAL)) AS total_qty,
          DATE(UploadedDateTime) AS production_date
      FROM Pending_sample_data
      WHERE LOWER(todept) IN (?) 
        AND (UploadedDateTime >= ? AND UploadedDateTime <= ?)
      GROUP BY todept, production_date
      ORDER BY production_date
    `;

    const params = [lowerToDeptFilter, start, end];

    db.query(sql, params, (err, data) => {
      if (err) return res.json(err);

      const results = {};

      // Initialize results for each day in the date range
      const currentDate = new Date(start);
      while (currentDate <= end) {
        const formattedDate = currentDate.toISOString().split("T")[0]; // Format YYYY-MM-DD
        results[formattedDate] = Object.keys(departmentMappings).reduce((acc, group) => {
          acc[group] = 0; // Initialize each department's quantity to 0
          return acc;
        }, {});
        currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
      }

      // Update results based on actual query data
      data.forEach((row) => {
        const toDept = row.todept ? row.todept.toUpperCase() : null;
        const qty = row.total_qty;
        const productionDate = row.production_date;

        // Ensure the formatted date exists in results
        const formattedDate = new Date(productionDate).toISOString().split("T")[0];
        if (results[formattedDate]) {
          // Update the quantity for the matching department
          Object.keys(departmentMappings).forEach((group) => {
            const { from } = departmentMappings[group];
            if (from.includes(toDept)) {
              results[formattedDate][group] += qty; // Add quantity to the respective group
            }
          });
        }
      });

      return res.json(results);
    });
  } catch (error) {
    console.error("Error fetching pending data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get("/total_qty_dept", async (req, res) => {
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

  const lowerDeptFromFilter = deptFromFilter.map((dept) => dept.toLowerCase());
  const lowerDeptToFilter = deptToFilter.map((dept) => dept.toLowerCase());

  // Initial SQL query to get total_qty without date filtering
  let sql = `
      SELECT \`From Dept\`, \`To Dept\`, Project, UploadedDateTime, COUNT(\`CW Qty\`) AS total_qty
      FROM Production_sample_data
      WHERE LOWER(\`From Dept\`) IN (?)
        AND LOWER(\`To Dept\`) IN (?)
    `;

  const params = [lowerDeptFromFilter, lowerDeptToFilter];

  // Optionally filter by startDate and endDate
  if (startDate) {
    sql += ` AND \`In Date\` >= ?`;
    params.push(new Date(startDate));
  }
  if (endDate) {
    sql += ` AND \`Out Date\` <= ?`;
    params.push(new Date(endDate));
  }

  sql += ` GROUP BY \`From Dept\`, \`To Dept\`, Project`;

  db.query(sql, params, (err, data) => {
    if (err) return res.json(err);

    const results = Object.keys(departmentMappings).reduce((acc, group) => {
      acc[group] = { total_qty: 0};
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
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
  initializeDepartments();
});
