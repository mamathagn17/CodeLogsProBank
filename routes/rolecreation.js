const express = require("express");
const router = express.Router();
const sql = require("mssql");
const config = require("../config/db");

router.post("/addrole", async (req, res) => {
    try {
        console.log("Received data:", req.body);
  
        // Connect to the database
        var pool = await sql.connect(config);
        console.log("Connected to SQL Server");
  
        var {role_name } = req.body;
        console.log(role_name);
  
        const checkrole = `SELECT COUNT(role_id) as count FROM tb_roles WHERE role_name = @role_name `;
      const checkroleResult = await pool
          .request()
          .input("role_name", sql.VarChar, role_name)
          .query(checkrole);

      const existingroleCount = checkroleResult.recordset[0].count;

      if (existingroleCount > 0) {
          var response = {
              message: "Role with the provided Role Name already exists",
              Valid: false,
          };
          return res.status(200).json(response);
      }

    
        var query = `INSERT INTO tb_roles (role_name) VALUES (@role_name)`;
  
        var result = await pool.request()
          
            .input('role_name', sql.VarChar, role_name)
            .query(query);
  
        console.log("Query result:", result);
  
        var response = {
            message: "Role added successfully",
            Valid: true
        };
  
        // Close the connection pool
        await pool.close();
  
        res.status(200).json(response);
      
    } catch (err) {
        // Ensure that the pool variable is defined for proper error handling
        console.error("Error:", err);
        
        var response = {
          message: "Category not added ",
          Valid: false
      };
  
        
  
        // Handle errors and close the connection pool
        if (pool) {
            await pool.close();
        }
  
        res.status(200).json(response);
    }
  
  });
  router.post("/fetchRoleList", async (req, res) => {
    try {
      var pool = await sql.connect(config); 
      console.log(req.body);
      console.log("Connected to SQL Server");
  
     
      var {role_id,role_name } = req.body;
  
     
      let SQLWhereClause = "";
      var params = {};
  
     
      var query = `SELECT * FROM tb_roles ${SQLWhereClause}`;
  
      // Execute the query with input parameters
      var result = await pool
        .request()
        .input('role_id', sql.VarChar, params.role_id)
        .input('role_name', sql.VarChar, params.role_name)
        .query(query);
  
      
      console.log("Query result:", result.recordset);
  
      
      var response = {
        message: "Role list fetched successfully",
        Valid: true,
        ResultSet: result.recordset
      };
  
      
      await pool.close();
  
      res.status(200).json([response]);
    } catch (err) {
      console.error("Error:", err);
      var response = {
        message: "Role list not fetched",
        Valid: false,
      };
      res.status(500).json([response]); 
    }
  });


module.exports = router;