
const express = require("express");
const axios = require("axios");
const db = require("../../config/DB/Db");
const router = express.Router();

router.get("/order_receive&new_design", (req, res) => {
    const sql = `SELECT NAME1, TRANSDATE, ORDERNO, \`Group party\`, ZONE, Purity, Color, \`PHOTO NO 2\`, PRODUCT, QTY, WT, \`DD&month\`, Dyr,TYPE,PROJECT,\`SUB PRODUCT\`, \`PL-ST\`, Brief FROM Order_receving_data`;
  
    db.query(sql, (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json({ message: "Error executing query" });
      }
  
      console.log("Query results:", results);
      res.json(results);
    });
  });

module.exports = router;
