const mysql = require("mysql");

// ip - > 172.16.5.233
//db -> emerald_db_cmp
const db = mysql.createConnection({
  host:'localhost',
  user: "root",
  password:"",
  database: "emerald_db_cmp",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to the database.');
  }
});

module.exports = db;