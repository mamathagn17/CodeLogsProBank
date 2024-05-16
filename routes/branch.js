const express = require('express');
const router = express.Router();
const sql = require('mssql');
const config = require('../config/db');

router.get('/fetchclient', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM tb_clientmaster');
    

    res.status(200).json({ clients: result.recordset });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error occurred while fetching Clients.' });
  }
});

router.post("/fetchbranch", async (req, res) => {
  try {
    const { currentPage, perPage } = req.body;
    const pool = await sql.connect(config);

    const totalCountQuery = `SELECT COUNT(*) AS TotalCount FROM tb_branch`;
    const resultTotalCount = await pool.request().query(totalCountQuery);
    const totalCount = resultTotalCount.recordset[0].TotalCount;

    const query = `
      SELECT b.branch_id, b.branch_name, c.client_name, b.branch_code
      FROM (
        SELECT *, ROW_NUMBER() OVER (ORDER BY branch_id) AS RowNum
        FROM tb_branch
      ) AS b
      INNER JOIN tb_clientmaster AS c ON b.client_id = c.client_id
      WHERE RowNum > ${(currentPage - 1) * perPage}
      AND RowNum <= ${(currentPage - 1) * perPage + perPage}
    `;

    const result = await pool.request().query(query);
    const resultSet = result.recordset;

   

    const response = {
      message: "Branch list fetched successfully",
      Valid: true,
      TotalCount: totalCount,
      ResultSet: resultSet
    };

    res.status(200).json(response);
  } catch (err) {
    console.error("Error:", err);
    const response = {
      message: "Branch list not fetched",
      Valid: false,
    };
    res.status(500).json(response);
  }
});

router.post("/addbranch", async (req, res) => {
  try {
    console.log("Received data:", req.body);
  
    // Connect to the database
    const pool = await sql.connect(config);
    console.log("Connected to SQL Server");
  
    var { branch_name, client_id, branch_code } = req.body;
    console.log(branch_name, client_id, branch_code);
  
    const checkbranch = `SELECT COUNT(branch_id) as count FROM tb_branch WHERE branch_name = @branch_name `;
    const checkbranchResult = await pool.request()
      .input('branch_name', sql.VarChar, branch_name)
      .query(checkbranch);
  
    const existingbranchCount = checkbranchResult.recordset[0].count;
  
    // User with the given email or phone already exists
    if (existingbranchCount > 0) {
      var response = {
        message: "Branch with the provided Branch Name already exists",
        Valid: false
      };
      return res.status(200).json(response);
    }
  
    var query =`INSERT INTO tb_branch (branch_name,client_id,branch_code) VALUES (@branch_name, @client_id, @branch_code)`;
  
    var result = await pool.request()
      .input('branch_name', sql.VarChar, branch_name)
      .input('client_id', sql.Int, client_id)
      .input('branch_code', sql.VarChar, branch_code)
      .query(query);
  
    console.log("Query result:", result);
  
    var response = {
      message: "Branch added successfully",
      Valid: true
    };
  
    // Close the connection pool
  await pool.close();
  
    res.status(200).json(response);
  
  } catch (err) {
    // Ensure that the pool variable is defined for proper error handling
    console.error("Error:", err);
  
    var response = {
      message: "Branch not added ",
      Valid: false
    };
  
    // Handle errors and close the connection pool
    await pool.close();
  
    res.status(200).json(response);
  }
});


module.exports = router;