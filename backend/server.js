const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const multer = require('multer');
const xlsx = require('xlsx');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const moment = require('moment');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "172.16.5.233",
  user: "emerald",
  password: "emerald",
  database: "emerald",
});

app.post('/save-targets', (req, res) => {
  const targets = req.body.targets; // Expecting an array of objects with project and target values

  if (!Array.isArray(targets) || targets.length === 0) {
    return res.status(400).json({ error: 'No valid target data provided' });
  }

  // Check if the table exists, and create it if it doesn't
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS projects_targets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      project VARCHAR(255) NOT NULL UNIQUE,
      target INT NOT NULL
    )
  `;

  db.query(createTableQuery, (err) => {
    if (err) {
      console.error("Error creating table:", err);
      return res.status(500).send("Error creating table");
    }

    // Insert or update the data to avoid duplicates
    const insertDataQuery = `
      INSERT INTO projects_targets (project, target) 
      VALUES ?
      ON DUPLICATE KEY UPDATE target = VALUES(target)
    `;
    const values = targets.map(item => [item.project, item.target]);

    db.query(insertDataQuery, [values], (err) => {
      if (err) {
        console.error("Error inserting data:", err);
        return res.status(500).send("Error inserting data");
      }
      res.status(200).json({ message: 'Data saved successfully' });
    });
  });
});

app.get("/pending-sum", (req, res) => {
  const query = `
    SELECT PLTCODE1, COUNT(JCPDSCWQTY1) AS total_quantity
    FROM pending
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



app.get("/targets", (req, res) => {
  db.query("SELECT * FROM projects_targets", (err, result) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res.status(500).json({ message: "Error fetching data" });
    }
    res.json(result);
  }
  );
});





// const bodyParser = require('body-parser');

// // Increase the limit to 50MB
// app.use(bodyParser.json({ limit: '50mb' }));
// app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// // For Express 4.16+ you can use the built-in middleware
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ limit: '50mb', extended: true }));




// login page api start

// Secret key for signing the JWT (you should store this in an environment variable)
const JWT_SECRET = 'ejindiadashboard';

// Replace with your own secret

app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend URL
  credentials: true
}));

// JWT authentication middleware
const authorize = (roles) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header
    
    console.log('Token:', token); // Debug: Check if token is present

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token', error: err });
      }

      req.user = decoded;

      // Check if user role is authorized
      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      next();
    });
  };
};

// Login route
app.post('/api/login', (req, res) => {
  const { emp_id, password } = req.body;

  if (!emp_id || !password) {
    return res.status(400).json({ message: 'Employee ID and password are required' });
  }

  // Query to fetch the user based on emp_id
  const query = 'SELECT * FROM users WHERE emp_id = ?';

  db.query(query, [emp_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = results[0];

    // Compare password (without bcrypt)
    if (password !== user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token with role
    const token = jwt.sign(
      {
        emp_id: user.emp_id,
        employer_name: user.employer_name,
        role: user.role // Include user role in the JWT payload
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send token as part of the response
    return res.status(200).json({
      message: 'Login successful',
      token, // Return the JWT token
      user: { emp_id: user.emp_id, employer_name: user.employer_name, role: user.role } // Include role in user object
    });
  });
});

// Protected route for admin
app.use('/api/admin-only', authorize(['admin']), (req, res) => {
  res.status(200).json({ message: 'Welcome, admin!' });
});

// Protected route for user
app.get('/api/user-only', authorize(['user']), (req, res) => {
  res.status(200).json({ message: 'Welcome, user!' });
});

// login page api end

// Convert Excel serial date to JavaScript Date
function excelSerialDateToDate(serial) {
  if (!serial || isNaN(serial)) {
    return null;
  }
  const excelEpoch = new Date(1899, 11, 30); // Excel epoch starts from 1899-12-30
  const days = Math.floor(serial); // Get the whole part of the serial date
  const timeFraction = serial - days; // Get the time fraction of the day
  const date = new Date(excelEpoch.getTime() + days * 86400000); // Convert days to milliseconds
  date.setMinutes(date.getMinutes() + Math.round(timeFraction * 1440)); // Add time portion
  return date;
}

// Format date for MySQL
function formatDateForMySQL(date) {
  if (!date) return null;
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


const createDesignTable = "CREATE TABLE if not exists `design_center_task_sample` ( \
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
`fileID Varchar(255)` DEFAULT NULL \
`uploadedDateTime` timestamp NULL DEFAULT NULL \
)";


db.query(createDesignTable, (err) => {
  if (err) {
    console.error('Error creating table:', err);
    return;
  }
  console.log("table created")
});


app.post('/api/target/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const fileBuffer = req.file.buffer;

  try {
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    // Expected column names (in the order they should appear)
    const expectedColumns = ['PROJECT-1', 'Product', 'Sub_Product', 'Total'];

    // Get the first row (header row) from the Excel file
    const fileHeaders = jsonData[0];

    // Check if all required headers are present and match
    const headerMismatch = expectedColumns.filter(col => !fileHeaders.includes(col));

    if (headerMismatch.length > 0) {
      // If there's a mismatch in headers, return an error message to the user
      return res.status(400).send(`
        Attention Please!!! : The following columns are missing or mismatched: 
        ${headerMismatch.join(', ')}. 
        Please correct the column names and try re-uploading the file after refreshing or reloading the current page.
      `);
    }

    // Remove the header row and process the data
    const values = jsonData.slice(1).map(row => [
      row[fileHeaders.indexOf('PROJECT-1')],
      row[fileHeaders.indexOf('Product')],
      row[fileHeaders.indexOf('Sub_Product')],
      row[fileHeaders.indexOf('Total')],
    ]);

    db.beginTransaction((transactionErr) => {
      if (transactionErr) {
        console.error('Transaction error:', transactionErr);
        return res.status(500).send('Transaction failed');
      }

      // Create the 'target' table if it doesn't exist
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS target (
          Project VARCHAR(255),
          Product VARCHAR(255),
          SubProduct VARCHAR(255),
          Total INT,
          
        )
      `;

      db.query(createTableQuery, (createTableErr) => {
        if (createTableErr) {
          db.rollback(() => {
            console.error('Create table error:', createTableErr);
            return res.status(500).send('Error creating target table');
          });
        }

        // Delete existing data in the 'target' table
        const deleteQuery = 'DELETE FROM target';
        db.query(deleteQuery, (deleteErr) => {
          if (deleteErr) {
            db.rollback(() => {
              console.error('Delete error:', deleteErr);
              return res.status(500).send('Error deleting old target data');
            });
          }

          // Insert new data into the 'target' table
          const insertQuery = `
            INSERT INTO target (Project, Product, SubProduct, Total)
            VALUES ?
          `;

          db.query(insertQuery, [values], (insertErr, results) => {
            if (insertErr) {
              db.rollback(() => {
                console.error('Insert error:', insertErr);
                return res.status(500).send('Error inserting new target data');
              });
            }

            db.commit((commitErr) => {
              if (commitErr) {
                db.rollback(() => {
                  console.error('Commit error:', commitErr);
                  return res.status(500).send('Error committing transaction');
                });
              }

              res.send('Target data uploaded and inserted successfully.');
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).send('Error processing file');
  }
});


app.post('/api/design_center/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const fileBuffer = req.file.buffer;
  const fileName = req.file.originalname;

  try {
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    if (jsonData.length > 0) {
      const values = jsonData.map(row => {
        // Convert Excel serial date to JavaScript Date
        const documentDate = excelSerialDateToDate(row['Document date']);
        const deadlineDate = excelSerialDateToDate(row['Deadline date']);
        const receivedDate = excelSerialDateToDate(row['Received date']);
        const completedDate = excelSerialDateToDate(row['Completed']);
        
        // Format dates for MySQL
        const formattedDocumentDate = formatDateForMySQL(documentDate);
        const formattedDeadlineDate = formatDateForMySQL(deadlineDate);
        const formattedReceivedDate = formatDateForMySQL(receivedDate);
        const formattedCompletedDate = formatDateForMySQL(completedDate);


        return [
          row['Brief number'],
          row['Pre-Brief'],
          row['Employe id'],
          row['Employe Name'],
          row['Design center'],
          row['Design specification'],
          row['Jewel sub type'],
          row['Sub category'],
          row['Jewel type'],
          formattedDocumentDate,
          row['Design type'],
          row['Minimum Weight'],
          row['Maximum Weight'],
          row['No Of Design'],
          formattedDeadlineDate,
          row['Confirmed'],
          row['Received'],
          row['Received by'],
          formattedReceivedDate,
          formattedCompletedDate,
          row['Created by'],
          row['Created date and time']
        ];
      });

      const query = `
      INSERT INTO design_center_task_sample 
      (\`Brief number\`, \`Pre-Brief\`, \`Employe id\`, \`Employe Name\`, 
       \`Design center\`, \`Design specification\`, \`Jewel sub type\`, 
       \`Sub category\`, \`Jewel type\`, \`Document date\`, \`Design type\`, 
       \`Minimum Weight\`, \`Maximum Weight\`, \`No Of Design\`, 
       \`Deadline date\`, \`Confirmed\`, \`Received\`, \`Received by\`, 
       \`Received date\`, \`Completed\`, \`Created by\`, \`Created date and time\`)
      VALUES ?
    `;

      db.query(query, [values], function (error, results, fields) {
        if (error) {
          console.error('Database error:', error);
          return res.status(500).send('Database error');
        }
        res.send('File uploaded and data inserted successfully.');
      });
    } else {
      res.status(400).send('No data found in Excel file');
    }
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).send('Error processing file');
  }
});


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
  \`fileID\` varchar(255) DEFAULT NULL,
  \`uploadedDateTime\` timestamp NULL DEFAULT NULL
)`;



db.query(createProductionTableQuery, (err) => {
  if (err) {
    console.error('Error creating table:', err);
    return;
  }
  
});






app.post('/api/production/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const fileBuffer = req.file.buffer;
  const fileName = req.file.originalname;

  try {
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    if (jsonData.length > 0) {
      const values = jsonData.map(row => {
        // Convert Excel serial date to JavaScript Date
        const inDate = excelSerialDateToDate(row['In Date']);
        const outDate = excelSerialDateToDate(row['Out Date']);
        const formatedInDate = formatDateForMySQL(inDate);
        const formatedoutDate = formatDateForMySQL(outDate);

        return [
          row['JC ID'],
          row['Brief No'],
          row['PRE-BRIEF NO'],
          row['Sketch No'],
          row['Item ID'],
          row['Purity'],
          row['Empid'],
          row['Ref Empid'],
          row['Name'],
          row['Jwl Type'],
          row['Project'],
          row['Sub Category'],
          row['CW Qty'],
          row['Qty'],
          row['From Dept'],
          row['To Dept'],
          // moment(inDate).format('YYYY-MM-DD HH:mm:ss'),
          // moment(outDate).format('YYYY-MM-DD HH:mm:ss'),
          formatedInDate,
          formatedoutDate,
          row['Hours'],
          row['Days'],
          row['Description'],
          row['Design specification'],
          row['PRODUNITID'],
          row['Remarks']
        ];
      });

      const query = `
      INSERT INTO Production_sample_data 
      (\`JC ID\`, \`Brief No\`, \`PRE-BRIEF NO\`, \`Sketch No\`, \`Item ID\`, 
       \`Purity\`, \`Empid\`, \`Ref Empid\`, \`Name\`, \`Jwl Type\`, 
       \`Project\`, \`Sub Category\`, \`CW Qty\`, \`Qty\`, \`From Dept\`, 
       \`To Dept\`, \`In Date\`, \`Out Date\`, \`Hours\`, \`Days\`, 
       \`Description\`, \`Design specification\`, \`PRODUNITID\`, \`Remarks\`)
      VALUES ?
    `;

      db.query(query, [values], function (error, results, fields) {
        if (error) {
          console.error('Database error:', error);
          return res.status(500).send('Database error');
        }
        // console.log('Rows inserted:', results.affectedRows);
        res.send('File uploaded and data inserted successfully.');
      });
    } else {
      res.status(400).send('No data found in Excel file');
    }
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).send('Error processing file');
  }
});


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
  \`fileID\` varchar(255) DEFAULT NULL,
  \`uploadedDateTime\` timestamp NULL DEFAULT NULL
)`;

db.query(createPendingTableQuery, (err) => {
  if (err) {
    console.error('Error creating table:', err);
    return;
  }
  
});

app.post('/api/pending/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const fileBuffer = req.file.buffer;
  const fileName = req.file.originalname;

  try {
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    if (jsonData.length > 0) {
      const values = jsonData.map(row => {
        // Convert Excel serial date to JavaScript Date
        const recvdDate = excelSerialDateToDate(row['RECVDATE1']);
        let formattedRecvdDate = formatDateForMySQL(recvdDate);

        // Handle invalid dates
        if (!formattedRecvdDate || formattedRecvdDate === '1899-12-31 00:00:00') {
          formattedRecvdDate = null;
        }

        const date1 = excelSerialDateToDate(row['DATE1']);
        let formattedDate1 = formatDateForMySQL(date1);

        if (!formattedDate1 || formattedDate1 === '1899-12-31 00:00:00') {
          formattedDate1 = null;
        }

        return [
          row['TODEPT'],
          row['JCID1'],
          row['BRIEFNUM1'],
          row['MERCHANDISERBRIEF1'],
          row['SKETCHNUM1'],
          row['ITEMID'],
          row['PERSONNELNUMBER1'],
          row['NAME1'],
          row['PLTCODE1'],
          row['PURITY1'],
          row['ARTICLECODE1'],
          row['COMPLEXITY1'],
          row['JCPDSCWQTY1'],
          row['JCQTY1'],
          formattedDate1,  // Properly formatted DATE1
          row['Textbox56'],
          row['Textbox87'],
          row['Textbox60'],
          row['DESIGNSPEC1'],
          row['RECEIVED1'],
          formattedRecvdDate,  // Properly formatted RECVDATE1
          row['REMARKS1'],
          row['HALLMARKINCERTCODE1']
        ];
      });

      const query = `
      INSERT INTO Pending_sample_data 
      (\`TODEPT\`, \`JCID1\`, \`BRIEFNUM1\`, \`MERCHANDISERBRIEF1\`, \`SKETCHNUM1\`, \`ITEMID\`,
       \`PERSONNELNUMBER1\`, \`NAME1\`, \`PLTCODE1\`, \`PURITY1\`, \`ARTICLECODE1\`,
       \`COMPLEXITY1\`, \`JCPDSCWQTY1\`, \`JCQTY1\`, \`DATE1\`, \`Textbox56\`,
       \`Textbox87\`, \`Textbox60\`, \`DESIGNSPEC1\`, \`RECEIVED1\`, \`RECVDATE1\`,
       \`REMARKS1\`, \`HALLMARKINCERTCODE1\`)
      VALUES ?
    `;

      db.query(query, [values], function (error, results, fields) {
        if (error) {
          console.error('Database error:', error);
          return res.status(500).send('Database error');
        }
        res.send('File uploaded and data inserted successfully.');
      });
    } else {
      res.status(400).send('No data found in Excel file');
    }
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).send('Error processing file');
  }
});



// ************ end of Pending Data post endpoints ******************* //

// ************** order rececing //////////////////////////////////

const createOrderReceivingTableQuery = `CREATE TABLE IF NOT EXISTS \`Order_receiving_log_sample\` (
  \`NAME1\` varchar(255) DEFAULT NULL,
  \`SUB_PARTY\` varchar(255) DEFAULT NULL,
  \`Group_party\` varchar(255) DEFAULT NULL,
  \`JCID\` varchar(255) DEFAULT NULL,
  \`TRANSDATE\` timestamp(6) NULL DEFAULT NULL,
  \`ORDERNO\` varchar(255) DEFAULT NULL,
  \`OrderType\` varchar(255) DEFAULT NULL,
  \`ZONE\` varchar(255) DEFAULT NULL,
  \`OGPG\` varchar(255) DEFAULT NULL,
  \`Purity\` varchar(255) DEFAULT NULL,
  \`Color\` varchar(255) DEFAULT NULL,
  \`PHOTO_NO\` varchar(255) DEFAULT NULL,
  \`PHOTO_NO_2\` varchar(255) DEFAULT NULL,
  \`PROJECT\` varchar(255) DEFAULT NULL,
  \`TYPE\` varchar(255) DEFAULT NULL,
  \`ITEM\` varchar(255) DEFAULT NULL,
  \`PRODUCT\` varchar(255) DEFAULT NULL,
  \`SUB_PRODUCT\` varchar(255) DEFAULT NULL,
  \`QTY\` double DEFAULT NULL,
  \`WT\` double DEFAULT NULL,
  \`Avg\` double DEFAULT NULL,
  \`Wt_range\` varchar(255) DEFAULT NULL,
  \`PL_ST\` varchar(255) DEFAULT NULL,
  \`DD\` timestamp(6) NULL DEFAULT NULL,
  \`SKCHNI\` varchar(255) DEFAULT NULL,
  \`EMP\` varchar(255) DEFAULT NULL,
  \`Name\` varchar(255) DEFAULT NULL,
  \`CODE\` varchar(255) DEFAULT NULL,
  \`GENDER\` varchar(255) DEFAULT NULL,
  \`2024_Set_Photo\` varchar(255) DEFAULT NULL,
  \`Po_new\` varchar(255) DEFAULT NULL,
  \`DD_month\` timestamp(6) NULL DEFAULT NULL,
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
    console.error('Error creating table:', err);
    return;
  }

});

function excelSerialDateToDate1(serial) {
  const startDate = new Date(1899, 11, 30); // Excel starts from 1899-12-30
  return new Date(startDate.getTime() + (serial * 24 * 60 * 60 * 1000));
}
function formatDateForMySQL1(date) {
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}


app.post('/api/order/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const fileBuffer = req.file.buffer;
  const fileName = req.file.originalname;

  try {
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    if (jsonData.length > 0) {
      const values = jsonData.map(row => {
        // Convert and format dates, handling possible invalid dates
        const transDate = excelSerialDateToDate1(row['TRANSDATE']);
  const formattedTransDate = transDate ? formatDateForMySQL1(transDate) : null;

  const ddDate = excelSerialDateToDate1(row['DD']);
  const formattedDdDate = ddDate ? formatDateForMySQL1(ddDate) : null;

  const ddMonth = excelSerialDateToDate1(row['DD&month']);
  const formattedDdMonth = ddMonth ? formatDateForMySQL1(ddMonth) : null;

  // Log if any date is invalid
  if (!formattedTransDate || !formattedDdDate || !formattedDdMonth) {
    console.warn('Invalid date format for row:', row);
  }

  return [
    row['NAME1'],
    row['SUB PARTY'],
    row['Group party'],
    row['JCID'],
    formattedTransDate,
    row['ORDERNO'],
    row['OrderType'],
    row['ZONE'],
    row['OGPG'],
    row['Purity'],
    row['Color'],
    row['PHOTO NO'],
    row['PHOTO NO 2'],
    row['PROJECT'],
    row['TYPE'],
    row['ITEM'],
    row['PRODUCT'],
    row['SUB PRODUCT'],
    row['QTY'],
    row['WT'],
    row['Avg'],
    row['Wt range'],
    row['PL-ST'],
    formattedDdDate,
    row['SKCHNI'],
    row['EMP'],
    row['Name'],
    row['CODE'],
    row['GENDER'],
    row['2024 Set Photo'],
    row['Po-new'],
    formattedDdMonth,
    row['Dyr'],
    row['Brief'],
    row['Maketype'],
    row['collection'],
    row['Collection-1'],
    row['Collection-2']
  ];
      });

      const query = `
        INSERT INTO Order_receiving_log_sample 
        (\`NAME1\`, \`SUB_PARTY\`, \`Group_party\`, \`JCID\`, \`TRANSDATE\`, \`ORDERNO\`,
         \`OrderType\`, \`ZONE\`, \`OGPG\`, \`Purity\`, \`Color\`, \`PHOTO_NO\`,
         \`PHOTO_NO_2\`, \`PROJECT\`, \`TYPE\`, \`ITEM\`, \`PRODUCT\`, \`SUB_PRODUCT\`,
         \`QTY\`, \`WT\`, \`Avg\`, \`Wt_range\`, \`PL_ST\`, \`DD\`, \`SKCHNI\`,
         \`EMP\`, \`Name\`, \`CODE\`, \`GENDER\`, \`2024_Set_Photo\`, \`Po_new\`,
         \`DD_month\`, \`Dyr\`, \`Brief\`, \`Maketype\`, \`collection\`, \`Collection_1\`,
         \`Collection_2\`)
        VALUES ?
      `;

      db.query(query, [values], function (error, results, fields) {
        if (error) {
          console.error('Database error:', error);
          return res.status(500).send('Database error');
        }
        res.send('File uploaded and order receiving data inserted successfully.');
      });
    } else {
      res.status(400).send('No data found in Excel file');
    }
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).send('Error processing file');
  }
});


/////// ******** end of order receving *************************//


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

// const departmentMappings = {
//   CAD: {
//     from: ["WBKOL-CAD", "U4PD-CAD", "U1CAD", "U1CAD-NMP"],
//     to: [
//       "U4PD-PRBOM",
//       "U1MMD",
//       "U1TOOL",
//       "U1CAM",
//       "U4PD-CAM",
//       "U1ST-SISMA",
//       "U1PRE-BOM",
//     ],
//   },
//   "PRE-BOM": {
//     from: ["U4PD-PRBOM", "U1PRE-BOM"],
//     to: [
//       "U4PD-CAM",
//       "U4PD-WAX",
//       "U4PD-DIE",
//       "U1CAM",
//       "U4DIE",
//       "U4PD3-SISM",
//       "U1ST-SISMA",
//       "U1PDD3-BUF",
//     ],
//   },
//   CAM: {
//     from: ["U1CAM", "U4PD-CAM", "U1INWARD"],
//     to: [
//       "U4PD-MFD",
//       "U1MP",
//       "U1WAX-PL",
//       "U1WAX-SORT",
//       "U1NMP-SFD",
//       "U1EXP-SFD",
//       "U1SFD",
//       "U4MFD",
//       "U1MP",
//       "U4-EFMFD",
//     ],
//   },
//   MFD: {
//     from: ["U4PD-MFD", "U1NMP-SFD", "U1SFD"],
//     to: ["U4PD-DIE", "U4PD-WAX", "U4PD-PRBOM", "U1SAM-WAX", "U1DIE"],
//   },
//   SFD: {
//     from: ["U1NMP-SFD"],
//     to: ["U4PD-WAX", "U1SAM-WAX", "U1DIE"],
//   },

//   DIE: {
//     from: ["U4PD-DIE", "U1DIE"],
//     to: ["U4PD-WAX", "U1SAM-WAX"],
//   },

//   MP: {
//     from: ["U1MP"],
//     to: ["U4PD-DIE", "U1DIE", "U4PD-WAX", "U4PD-PRBOM", "U1SAM-WAX"],
//   },
//   WAX: {
//     from: ["U4PD-WAX", "U1SAM-WAX"],
//     to: ["U4SJ-CAST", "U1CAST"],
//   },
//   CAST: {
//     from: ["U1CAST", "U4SJ-CAST"],
//     to: [
//       "U1SAMP",
//       "U1PDD2-SEP",
//       "U1SEP-SPR1",
//       "U1SEP-SST",
//       "U1SEP",
//       "U4PD1-SEP",
//     ],
//   },
//   SEPRATION: {
//     from: ["U1PDD2-SEP", "U1SAMP"],
//     to: [
//       "U1PDD2-ASY",
//       "U1PDD2-BUF",
//       "U1C5L1-ASY",
//       "U1C5L1-ASS",
//       "U1PDD3-BUF",
//       "U1PDD3-ASY",
//       "U1PDD3-CLR",
//       "U1PDD3-COR",
//       "U1PDD3-BP",
//       "U1PDD2-CLR",
//       "U1FUSION",
//       "U1PDD",
//       "U1PDD2-COR",
//       "U1PDD3-SEP",
//       "U1C5L1-ASY",
//       "U1C6L2-ASY",
//       "U1PDD",
//       "U1C6L1-COR",
//       "U1FUL2-ASY",
//       "U1C22-ASY",
//       "U1C22-COR",
//       "U1C5L1-ASY",
//       "U1CELL-6",
//       "U1CNC-ASY",
//       "U1C22-PLT",
//       "U1MGS-L&F",
//       "U1MGS-ASY",
//       "U1IND",
//       "U1MARIYA",
//     ],
//   },
//   "PD-ASSY": {
//     from: ["U1PDD2-ASY", "U1SAM-ASY"],
//     to: ["U1PDD2-BUF", "U1BP"],
//   },
//   BP: {
//     from: ["U1BP"],
//     to: ["U1SAM-COR"],
//   },
//   "PD-CORR": {
//     from: ["U1SAM-COR"],
//     to: ["U1SAM-QC", "U1SAM-SST", "U1SAM-BUF"],
//   },
//   "PD-SETTING": {
//     from: ["U1SAM-SST", "U1PDD2-SST"],
//     to: ["U1SAM-BUF", "U1PDD2-TXT"],
//   },
//   "PD-BUFF": {
//     from: ["U1PDD2-BUF", "U1SAM-BUF"],
//     to: [
//       "U1PDD2-SST",
//       "U1PDD2-TXT",
//       "U1SAM-TEX",
//       "U1CH-18K",
//       "U1CH-22K",
//       "U1MGS-L&F",
//     ],
//   },
//   "PD-TEXTURING": {
//     from: ["U1PDD2-TXT", "U1SAM-TEX"],
//     to: [
//       "U1PDD2-CORR",
//       "U1GS",
//       "U1C5L1-ASY",
//       "U1C5L1-ASS",
//       "U1C5L1-BUF",
//       "U1PDD3-SST",
//       "U1PDD2-CORR",
//     ],
//   },
//   "PD-BOM": {
//     from: ["U1PDD3-SST", "U4PD3-BOM", "U1PDD-CORR"],
//     to: ["U1PDD2-CORR", "U4FI-BOM", "U1PHOTO", "U1PACK", "U1PACK-SI"],
//   },
//   PHOTO: {
//     from: ["U1PHOTO"],
//     to: ["U1PACK", "U1PACK-SI"],
//   },
//   // 'CORR':{
//   //    from:['U1PDD-CORR','U1PHOTO'],
//   //    to:['U1PHOTO','U1PACK','U1PACK-SI']
//   // },
//   SISMA: {
//     from: ["U4PD3-SISM", "U1PDD3-BUF"],
//     to: [
//       "U4PD3-1",
//       "U4PD3-2",
//       "U4PD3-3",
//       "U4PD3-4",
//       "U4PD3-5",
//       "U4PD3-6",
//       "U4PD3-7",
//       "U4PD1-SEP",
//       "U1PDD3-ASY",
//       "U1PDD3-BP",
//       "U1PDD3-CLR",
//       "U1PDD3-SEP",
//       "U1PDD3-BUF",
//       "U1PDD",
//       "U1PDD3-COR",
//       "U1PDD2-SEP",
//       "U1PDD2-ASY",
//     ],
//   },
//   "INDIANIA CELL": {
//     from: ["U1IND"],
//     to: ["U1SAM-TEX", "U1PDD2-TXT"],
//   },
//   "MMD CELL": {
//     from: ["U1MMD", "U1MMD1", "U1MMD2"],
//     to: ["U1GS", "U1SAM-BUF", "U1SAM-TEX", "U1PDD2-TXT", "U1PDD2-BUF"],
//   },

//   "STAMPING CELL": {
//     from: ["U1ST-PRESS"],
//     to: ["U1GS", "U1SAMP", "U1PDD2-SEP"],
//   },
//   "ENAMEL CELL": {
//     from: ["U1DLE", "U1PDD2-QC", "U1SAM-QC"],
//     to: ["U1PDD2-TXT", "U1SAM-TEX", "U1SAM-BUF", "U1SAM-SST"],
//   },
//   "Imprez cell": {
//     from: ["U1IM-PRESS"],
//     to: ["U1GS", "U1SAMP", "U1PDD2-SEP"],
//   },
//   "Fusion Cell": {
//     from: ["U1FUL1-BUF", "U1FU-TEXT", "U1FUL1-ASY", "U1FUL1-COR"],
//     to: ["U1GS", "U1PDD2-BUF", "U1SAM-BUF", "U1PDD2-TXT", "U1SAM-TEX"],
//   },
//   "Gemstone cell": {
//     from: [
//       "U1C5L1-SST",
//       "U1C5L1-ASY",
//       "U1C5L1-ASS",
//       "U1C5L1-BUF",
//       "U1C5L1-TXT",
//     ],
//     to: ["U1GS", "U1QA", "U1SAM-TEX", "U1PDD2-TXT"],
//   },
//   "Cnc cell": {
//     from: ["U1CNC -TXT"],
//     to: ["U1QA"],
//   },
//   "UNIT-4 EFCELL": {
//     from: [
//       "U4PD-3DSCA",
//       "U4FOUN",
//       "U4MFD",
//       "U4SCUL",
//       "U4DIE",
//       "U4CAST",
//       "U4EF",
//     ],
//     to: [
//       "U4PD-CAD",
//       "U4FOUN",
//       "U4CAST",
//       "U4DIE",
//       "U4PD-PRBOM",
//       "U4EF",
//       "U4SEP",
//       "U4PD1-SEP",
//     ],
//   },
//   "PD3 CELL": {
//     from: [
//       "U4PD3-1",
//       "U4PD3-2",
//       "U4PD3-3",
//       "U4PD3-4",
//       "U4PD3-5",
//       "U4PD3-6",
//       "U4PD3-7",
//       "U1PDD3-ASY",
//       "U1PDD3-BP",
//       "U1PDD3-CLR",
//       "U1PDD3-SEP",
//       "U1PDD",
//       "U1PDD3-COR",
//     ],
//     to: ["U4PD1-BUF", "U4PD1-SST", "U1PDD2-BUF", "U1PDD2-SST"],
//   },
// };


// app.get("/departmentMappings", (req, res) => {
//   res.json(departmentMappings);
// });

app.get("/jewel-master",(req,res)=>{
  const sql = `
  SELECT JewelCode, Product, \`sub Product\` from Jewel_Master
  `;
  db.query(sql,(err,data)=>{
    if(err) return res.json(err);
    return res.json(data);
  }
  )

})

app.get('/department-mappings', (req, res) => {
  const sql = 'SELECT * FROM Production_master_deparment_mapping';
  db.query(sql, (err, rows) => {
    if (err) return res.json(err);

    // Transform the data into the desired format
    const result = {};

    rows.forEach(row => {
      const groupWh = row['Group Wh'];
      if (!result[groupWh]) {
        result[groupWh] = { from: [], to: [] };
      }
      if (row['From Dept'] && !result[groupWh].from.includes(row['From Dept'])) {
        result[groupWh].from.push(row['From Dept']);
      }
      if (row['To Dept'] && !result[groupWh].to.includes(row['To Dept'])) {
        result[groupWh].to.push(row['To Dept']);
      }
    });

    res.json(result);
  });
});

app.get("/raw_filtered_production_data",async(req, res) => {
  const response = await axios.get("http://localhost:8081/department-mappings");
  const departmentMapping = response.data;
  const deptFromFilter = Object.values(departmentMapping).flatMap(
    (mapping) => mapping.from
  );
  const deptToFilter = Object.values(departmentMapping).flatMap(
    (mapping) => mapping.to
  );

  const sql = `
         SELECT \`From Dept\`,\`To Dept\`, \`CW Qty\`,Project
         FROM Production_updated_data
         WHERE \`From Dept\` IN (?)
            
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
app.get("/filtered_production_data", async (req, res) => {
  const response = await axios.get("http://localhost:8081/department-mappings");
  const departmentMappings = response.data;
  const { startDate, endDate } = req.query;

  const deptFromFilter = Object.values(departmentMappings).flatMap(mapping => mapping.from);
  const deptToFilter = Object.values(departmentMappings).flatMap(mapping => mapping.to);

  const lowerDeptFromFilter = deptFromFilter.map(dept => dept.toLowerCase());
  const lowerDeptToFilter = deptToFilter.map(dept => dept.toLowerCase());

  let sql = `
    SELECT \`From Dept\`, \`To Dept\`, SUM(\`CW Qty\`) AS total_qty
    FROM Production_updated_data
    WHERE LOWER(\`From Dept\`) IN (?)
      AND LOWER(\`To Dept\`) IN (?)
  `;

  const params = [lowerDeptFromFilter, lowerDeptToFilter];

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
  const sql = "SELECT * FROM Production_updated_data";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/jewel_master", (req, res) => {
  const sql = "SELECT * FROM Jewel_Master";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/pending_data", (req, res) => {
  const sql = "SELECT * FROM pending";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/raw_filtered_pending_data", async (req, res) => {
  const response = await axios.get("http://localhost:8081/department-mappings");
  const departmentMappings = response.data;
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

const axios = require("axios");

app.get("/filtered_pending_data", async (req, res) => {
  const response = await axios.get("http://localhost:8081/department-mappings");
const departmentMappings = response.data;

  const toDeptFilter = Object.values(departmentMappings).flatMap(
    (mapping) => mapping.from
  );
  const lowerToDeptFilter = toDeptFilter.map((dept) => dept.toLowerCase());

  const sql = `
            SELECT todept, SUM(CAST(jcpdscwqty1 AS DECIMAL)) AS total_qty
            FROM pending
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
  const sql = `SELECT NAME1, TRANSDATE, ORDERNO, \`Group party\`, ZONE, Purity, Color, \`PHOTO NO 2\`, PRODUCT, QTY, WT, \`DD&month\`, Dyr,TYPE,PROJECT,\`SUB PRODUCT\`, \`PL-ST\` FROM Order_receving_data`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ message: "Error executing query" });
    }

    console.log("Query results:", results); 
    res.json(results);
  });
});


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
  OperatorNameID VARCHAR(50)
  file_ID VARCHAR(100),
  uploadedDateTime TIMESTAMP,
);`;

db.query(createTableQuery, (err) => {
  if (err) {
    console.error('Error creating table:', err);
    return;
  }
});

app.post('/api/rejection/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const fileBuffer = req.file.buffer;
  const fileName = req.file.originalname;
  const file_ID = req.body.file_ID + " " + fileName;

  try {
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { raw: false });

    if (jsonData.length > 0) {
      const values = jsonData.map(row => [
        file_ID,
        row.Yr,
        row.MONTH,
        xlsx.SSF.format('DD-MM-YYYY', row.Date),  // Convert Excel serial date to string
        xlsx.SSF.format('DD-MM-YYYY', row['Raised Date']),  // Convert Excel serial date to string
        row.RaisedDept,
        row['Reason Dept'],
        row['To Dept'],
        row['Sketch No'],
        row['Jcid No'],
        row.Collections,
        row['Type of Reason'],
        row['Problem arised'],
        row['Problem - 1'],
        row['Problem arised -2'],
        row.COUNT,
        row['Operator Name/ID']
      ]);

      const query = `
        INSERT INTO rejection 
        (file_ID, Yr, MONTH, Date, RaisedDate, RaisedDept, ReasonDept, ToDept, SketchNo, JcidNo, Collections, TypeOfReason, ProblemArised, Problem1, ProblemArised2, COUNT, OperatorNameID) 
        VALUES ?`;

      db.query(query, [values], function (error, results) {
        if (error) throw error;
        console.log('Rows inserted:', results.affectedRows);
        res.send('File uploaded and data inserted successfully.');
      });
    } else {
      res.status(400).send('No data found in Excel file');
    }
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).send('Error processing file');
  }
});

  

  app.get('/api/rejection/uploads', (req, res) => {
    const query = 'SELECT * FROM rejection';
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching uploads:', err);
        res.status(500).send('Error fetching uploads');
        return;
      }
      res.json(results);
    });
  });

  app.get('/api/desCenTask', (req, res) => {
    const query = 'SELECT * FROM design_center_task';
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching uploads:', err);
        res.status(500).send('Error fetching uploads');
        return;
      }
      res.json(results);
    });
  });
  app.get('/api/cellmaster', (req, res) => {
    const query = 'SELECT * FROM Cell_Master';
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching uploads:', err);
        res.status(500).send('Error fetching uploads');
        return;
      }
      res.json(results);
    });
  });
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});


