const express = require('express');
const mysql = require('mysql')
const cors = require('cors')
const app =express()
 app.use(cors())



 const db = mysql.createConnection({
    host:"172.16.5.233",
    user:'emerald',
    password:'emerald',
    database:"emerald"
 })

 app.get('/production_data', (req, res)=> {
    const sql = "SELECT * FROM production_log";
    db.query(sql, (err, data)=> {
    if(err) return res.json(err);
    return res.json(data);
    })
    })

    
 app.get('/pending_data', (req, res)=> {
    const sql = "SELECT * FROM pending_log";
    db.query(sql, (err, data)=> {
    if(err) return res.json(err);
    return res.json(data);
    })
    })

    const PORT = process.env.PORT || 8081;

    app.get('/', (req, res) => {
        return res.json("From Backend Side");
    });
    
    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    });