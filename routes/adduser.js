const express = require('express');
const router = express.Router();
const sql = require('mssql');
const config = require('../config/db');

router.get('/fetchRoles', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM tb_roles');
        await pool.close();

        res.status(200).json({roles: result.recordset });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error occurred while fetching roles .' });
    }
});


router.post("/adduser", async (req, res) => {
  try {
      console.log("Received data:", req.body);

      // Connect to the database
      var pool = await sql.connect(config);
      console.log("Connected to SQL Server");

      var { user_name, role_id, userInfo } = req.body;
      console.log(user_name, role_id, userInfo);
      const { user_id, user_name: adminUserName } = userInfo; // Rename user_name to adminUserName to avoid conflict
      const date_time = new Date();

      const checkuser = `SELECT COUNT(user_id) as count FROM tb_users WHERE user_name = @user_name `;
      const checkuserResult = await pool
          .request()
          .input("user_name", sql.VarChar, user_name)
          .query(checkuser);

      const existinguserCount = checkuserResult.recordset[0].count;

      if (existinguserCount > 0) {
          var response = {
              message: "User with the provided user Name already exists",
              Valid: false,
          };
          return res.status(200).json(response);
      }

      var query = `INSERT INTO tb_users (user_name,role_id) VALUES (@user_name,@role_id)`;

      var result = await pool
          .request()
          .input("user_name", sql.VarChar, user_name)
          .input("role_id", sql.Int, role_id)
          .query(query);

      console.log("Query result:", result);

      // Fetch role_name based on role_id
      const fetchRoleQuery = `SELECT role_name FROM tb_roles WHERE role_id = @role_id`;
      const roleResult = await pool
          .request()
          .input("role_id", sql.Int, role_id)
          .query(fetchRoleQuery);

      const role_name = roleResult.recordset[0].role_name;

      
      const logQuery = `INSERT INTO tb_useraddlogs (user_id, user_name, role_id, role_name, action, date_time) VALUES (@user_id, @user_name, @role_id, @role_name, @action, @date_time)`;
      await pool
          .request()
          .input("user_id", sql.Int, user_id)
          .input("user_name", sql.VarChar, adminUserName)
          .input("role_id", sql.Int, role_id)
          .input("role_name", sql.VarChar, role_name)
          .input("action", sql.VarChar, "User added successfully")
          .input("date_time", sql.DateTime, date_time)
          .query(logQuery);

      var response = {
          message: "User added successfully",
          Valid: true,
      };

      // Close the connection pool
      await pool.close();

      res.status(200).json(response);
  } catch (err) {
      // Ensure that the pool variable is defined for proper error handling
      console.error("Error:", err);

      var response = {
          message: "Failed to add user",
          Valid: false,
      };

      // Handle errors and close the connection pool
      if (pool) {
          await pool.close();
      }

      res.status(200).json(response);
  }
});


  router.post("/userlogs", async (req, res) => {
    try {
      var pool = await sql.connect(config); // Connect to the database
      console.log(req.body);
      console.log("Connected to SQL Server");
  
      
      var { currentPage, perPage } = req.body;
  
     
      const totalCountQuery =`SELECT COUNT(*) AS TotalCount FROM tb_useraddlogs`;
      console.log("Total Count Query:", totalCountQuery);
      const resultTotalCount = await pool.request().query(totalCountQuery);
      const totalCount = resultTotalCount.recordset[0].TotalCount;
      console.log("Total Count:", totalCount);
  
      const query = `SELECT *
      FROM (
          SELECT *, ROW_NUMBER() OVER (ORDER BY user_id) AS RowNum
          FROM tb_useraddlogs
      ) AS UserWithRowNum
      WHERE RowNum BETWEEN ${(currentPage - 1) * perPage + 1} AND ${currentPage * perPage}
      ORDER BY user_id;
      `;
  
     
  
      const result = await pool.request().query(query);
      const resultSet = result.recordset;
      console.log("Result Set:", resultSet);
  
      const response = {
        message: "user Logs list fetched successfully",
        Valid: true,
        TotalCount: totalCount,
        ResultSet: resultSet
      };
  
      res.status(200).json(response);
    } catch (err) {
      console.error("Error:", err);
      const response = {
        message: " request list not fetched",
        Valid: false,
      };
      res.status(500).json(response);
    }
  });
  

module.exports = router;