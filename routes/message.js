const express = require("express");
const router = express.Router();
const sql = require("mssql");
const config = require("../config/db");

router.post("/GetMsgList", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    console.log("Connected to SQL Server");

    const { currentPage, perPage, message_name } = req.body; // Get the branch from request body

    // Build the WHERE clause to filter records based on the selected branch
    let whereClause = '';
    if (message_name) {
      whereClause = `WHERE Branch = '${message_name}'`;
    }

    const totalCountQuery = `SELECT COUNT(*) AS TotalCount FROM tb_messages ${whereClause}`;
    console.log("Total Count Query:", totalCountQuery);
    const resultTotalCount = await pool.request().query(totalCountQuery);
    const totalCount = resultTotalCount.recordset[0].TotalCount;
    console.log("Total Count:", totalCount);

    const query = `SELECT * FROM (SELECT *, ROW_NUMBER() OVER (ORDER BY message_id) AS RowNum FROM tb_messages
    ${whereClause} 
  ) AS RowConstrainedResult WHERE RowNum > ${(currentPage - 1) * perPage} AND RowNum <= ${(currentPage - 1) * perPage + perPage}`;

    console.log("Query:", query);

    const result = await pool.request().query(query);
    const resultSet = result.recordset;
    console.log("Result Set:", resultSet);

    const response = {
      message: "message list fetched successfully",
      Valid: true,
      TotalCount: totalCount,
      ResultSet: resultSet
    };

    res.status(200).json(response);
  } catch (err) {
    console.error("Error:", err);
    const response = {
      message: "message list not fetched",
      Valid: false,
    };
    res.status(500).json(response);
  }
});

router.post('/Message', async (req, res) => {
    try {
      const {message_name,message_type} = req.body;
      console.log(message_name,message_type );
  
      // Connect to the SQL Server database
      const pool = await sql.connect(config);
  
      // Insert the data into the table
      await pool.request()
        .input('message_name', sql.NVarChar(255), message_name)
        .input('message_type', sql.NVarChar(255), message_type)
       
        .query('INSERT INTO tb_messages (message_name,message_type) VALUES (@message_name,@message_type)');
  
      // Release the SQL Server connection
      sql.close();
  
      res.json({ Valid: true, message: 'Message added successfully' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ Valid: false, message: 'Internal Server Error' });
    }
  });


module.exports = router;