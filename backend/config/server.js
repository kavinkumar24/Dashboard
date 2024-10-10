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

const Operational_Task_post = require("../router/post/Operational_Task")
const Operational_Task_get = require("../router/get/Operational_Task")

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

const Phase_Task_post = require("../router/post/Phase_Task")
const Phase_Task_get = require("../router/get/Phase_Task")
app.use("/api", Phase_Task_post);
app.use("/api",Phase_Task_get)



const party_Visit_post = require("../router/post/Party_Visit");
app.use("/api", party_Visit_post);


const User_get = require("../router/get/User")
app.use("/api", User_get)








app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
