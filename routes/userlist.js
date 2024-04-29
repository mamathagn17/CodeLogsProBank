const express = require("express");
const router = express.Router();
const sql = require("mssql");
const config = require("../config/db");
router.post("/GetUser", async (req, res) => {
    try {
      var pool = await sql.connect(config); // Connect to the database
      console.log(req.body);
      console.log("Connected to SQL Server");
  
      // Get the data sent from the client. req.body will have the data in JSON format
      var { currentPage, perPage } = req.body;
  
      // Constructing the SQL query without any WHERE clause
      const totalCountQuery = `SELECT COUNT(*) AS TotalCount FROM tb_users`;
      console.log("Total Count Query:", totalCountQuery);
      const resultTotalCount = await pool.request().query(totalCountQuery);
      const totalCount = resultTotalCount.recordset[0].TotalCount;
      console.log("Total Count:", totalCount);
  
      const query = `SELECT *
      FROM (
          SELECT *, ROW_NUMBER() OVER (ORDER BY role_id) AS RowNum
          FROM tb_users
      ) AS UserWithRowNum
      WHERE RowNum BETWEEN ${(currentPage - 1) * perPage + 1} AND ${currentPage * perPage}
      ORDER BY role_id;
      `;
  
      console.log("Query:", query);
  
      const result = await pool.request().query(query);
      const resultSet = result.recordset;
      console.log("Result Set:", resultSet);
  
      const response = {
        message: "License request list fetched successfully",
        Valid: true,
        TotalCount: totalCount,
        ResultSet: resultSet
      };
  
      res.status(200).json(response);
    } catch (err) {
      console.error("Error:", err);
      const response = {
        message: "License request list not fetched",
        Valid: false,
      };
      res.status(500).json(response);
    }
  });
  router.post('/DeleteUsers', async (req, res) => {
    try {
      const { ids } = req.body;
  
      // Ensure that IDs are provided in the request
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ Valid: false, message: 'No user IDs provided for deletion' });
      }
  
      const pool = await sql.connect(config);
      const deleteQuery = `
        DELETE FROM TB_licence_holders
        WHERE id IN (${ids.map((id, index) =>` @id${index}`).join(',')})
      `;
  
      const request = pool.request();
      ids.forEach((id, index) => {
        request.input(`id${index}`, sql.Int, id);
      });
  
      
      const result = await request.query(deleteQuery);
  
     
      if (result.rowsAffected && result.rowsAffected[0] > 0) {
        return res.status(200).json({ Valid: true, message: 'Users deleted successfully' });
      } else {
        return res.status(404).json({ Valid: false, message: 'No users found or no changes made' });
      }
    } catch (error) {
      console.error('Error deleting users:', error);
      return res.status(500).json({ Valid: false, message: 'Failed to delete users' });
    }
  });
  router.post('/User_Details', async (req, res) => {
    try {
      const { id } = req.body;
      const pool = await sql.connect(config);
      const query =` SELECT * FROM tb_users WHERE user_id = @id`;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(query);
  
      if (result.recordset.length > 0) {
        const userData = result.recordset[0];
        res.status(200).json({ Valid: true, data: userData });
      } else {
        res.status(404).json({ Valid: false, message: 'User not found' });
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      res.status(500).json({ Valid: false, message: 'Failed to fetch user details' });
    }
  });
  router.post('/User_update', async (req, res) => {
    try {
        const { user_id, user_name,role_id, password } = req.body;
        console.log(user_id, user_name,role_id, password)
        const pool = await sql.connect(config);
        const updateQuery = `
            UPDATE tb_users 
            SET user_name = @user_name, role_id = @role_id, 
            password = @password
            WHERE user_id = @user_id`;
  
        const result = await pool.request()
            .input('user_name', sql.NVarChar, user_name)
            .input('role_id', sql.Int, role_id)
            .input('password', sql.NVarChar, password)
            .input('user_id', sql.Int, user_id)
            .query(updateQuery);
  
        // Check if any rows were affected by the update
        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            res.status(200).json({ Valid: true, message: 'User information updated successfully' });
        } else {
            res.status(404).json({ Valid: false, message: 'User not found or no changes made' });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ Valid: false, message: 'Failed to update user information' });
    }
  });

  module.exports = router;
