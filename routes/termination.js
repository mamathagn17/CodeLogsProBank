const express = require("express");
const router = express.Router();
const sql = require("mssql");
const config = require("../config/db");

router.post('/WarnMessage', async (req, res) => {
    try {
      const { warningmsg, terminationmsg, daystotermination } = req.body;
      console.log(warningmsg, terminationmsg, daystotermination )
  
      // Connect to the SQL Server database
      const pool = await sql.connect(config);
  
      // Insert the data into the table
      await pool.request()
        .input('warningmsg', sql.NVarChar(255), warningmsg)
        .input('terminationmsg', sql.NVarChar(255), terminationmsg)
        .input('daystotermination', sql.Int, daystotermination)
        .query('INSERT INTO tb_licensetermination (warningmsg, terminationmsg, daystotermination) VALUES (@warningmsg, @terminationmsg, @daystotermination)');
  
      // Release the SQL Server connection
      sql.close();
  
      res.json({ Valid: true, message: 'Message added successfully' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ Valid: false, message: 'Internal Server Error' });
    }
  });


module.exports = router;
