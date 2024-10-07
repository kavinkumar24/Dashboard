


const express = require("express");
const router = express.Router();
const db = require("../../config/DB/Db");

router.get("/jewel-master", (req, res) => {
    const sql = `
    SELECT JewelCode, Product, \`sub Product\` from Jewel_Master
    `;
    db.query(sql, (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
  });
  
    module.exports = router;