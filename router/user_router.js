const dbConfig = require('../db_config');
const express = require('express');
const router = express();
const axios = require("axios").default;
require("dotenv").config();

const errorLog = (error) => {
    let sqlInsert = `INSERT INTO agency_sync set count = 0, sync_at = now(), error='${error.toString()}'`;
    dbConfig.query(sqlInsert, null, (err, result) => {
      if (err) throw err;
    });
};

// get all the user
router.get('/inventory', (req, res) => {
    dbConfig.query("SELECT * FROM agency", [], (err, result) => {
      if (err) throw err;
      res.status(200).send(result);
    });
});

router.get("/agency", async (req, res) => {
  let prices = [];
  dbConfig.query("SELECT * FROM agency", [], async (err, result) => {
      if (err) throw err;
      const data = result.map((item) => {
          return { agencyPartNumber: item.data }
      })         
            
      const tokenHeader = {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      };      

      const url10Token = `https://api${process.env.client_id_10}${process.env.client_secret_10}`;
      const url73Token = `https://api${process.env.client_id_73}${process.env.client_secret_73}`;
      const token10 = await axios.get(url10Token, tokenHeader);
      const token73 = await axios.get(url73Token, tokenHeader);
     
      if (token10?.data.access_token) {
          const pricesHeader = {
            headers: null,
          };
          const url10 = `https://api`;
          const data = JSON.stringify({});
          const prices10 = await axios.post(url10, data, pricesHeader);
          if (prices10.data) {
            prices10.data.map((item) => {
              if (item.availability) {
                const Update = { br10: item.availability.totalAvailability };
                let sql = `UPDATE agency set ? where data = '${item.agencyPartNumber}'`;
                dbConfig.query(sql, Update, (err, result) => {                  
                  if (err) {errorLog(err); throw err; }
                });
              }  
            });
        }  
      }
     
      if (token73?.data.access_token) {
        const pricesHeader = {
          headers: null,
        };
        const url73 = `https://api`;
        const data = JSON.stringify({
        });
        const prices73 = await axios.post(url73, data, pricesHeader);
        if (prices73.data) {
          prices73.data.map((item) => {
              if (item.availability) {
                const Update = { br73: item.availability.totalAvailability };
                let sql = `UPDATE agency set ? where data = '${item.agencyPartNumber}'`;
                dbConfig.query(sql, Update, (err, result) => {                  
                  if (err) { errorLog(err); throw err; } ;
                });
              }
            });
        }  
      }

      dbConfig.query(sql, null, (err, result) => {
        if (err) throw err;
      }); 
    
      let sqlInsert = `INSERT INTO agency_sync set count = ${data.length}, sync_at = now()`;
      dbConfig.query(sqlInsert, null, (err, result) => {
        if (err) throw err;
      }); 
    
      res.status(200).send(data);
  });
});

module.exports = router;