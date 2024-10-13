const mysql = require("mysql");




const db = mysql.createConnection({
  host:'172.16.5.233',
  user: "emerald",
  password:"emerald",
  database: "Emerald",
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
