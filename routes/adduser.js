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
  
        var { user_name,role_id,password} = req.body;
        console.log(user_name,role_id);
  
        const checkuser = `SELECT COUNT(user_id) as count FROM tb_users WHERE user_name = @user_name `;
        const checkuserResult = await pool.request()
          .input('user_name', sql.VarChar, user_name)
          .query(checkuser);
       
    
        const existinguserCount = checkuserResult.recordset[0].count;
      
    
          // User with the given email or phone already exists
          if(existinguserCount>0)
          {
          var response = {
            message: "User with the provided user Name already exists",
            Valid: false
          };
          return res.status(200).json(response);
        }
    
        var query =` INSERT INTO tb_users (user_name,role_id) VALUES (@user_name,@role_id,)`;
  
        var result = await pool.request()
            .input('user_name', sql.VarChar, user_name)
          
            .input('role_id',sql.Int,role_id)
            // .input('password', sql.VarChar, password)
            .query(query);
  
        console.log("Query result:", result);
  
        var response = {
            message: "User added successfully",
            Valid: true
        };
  
        // Close the connection pool
        await pool.close();
  
        res.status(200).json(response);
      
    } catch (err) {
        // Ensure that the pool variable is defined for proper error handling
        console.error("Error:", err);
        
        var response = {
          message: "User not added ",
          Valid: false
      };
  
        
  
        // Handle errors and close the connection pool
        if (pool) {
            await pool.close();
        }
  
        res.status(200).json(response);
    }
  
  });


module.exports = router;