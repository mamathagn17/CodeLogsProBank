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
  
        // const checkname = `SELECT COUNT(role_id) as count FROM tb_clientcategorymaster WHERE category_name= @category_name `;
        // const checknameResult = await pool.request()
        //   .input('category_name', sql.VarChar, category_name)
        //   .query(checkname);
     
  
    
        // const existingnameCount = checknameResult.recordset[0].count;
        //   if(existingnameCount>0)
        //   {
        //   var response = {
        //     message: "User with the provided Category Name already exists",
        //     Valid: false
        //   };
        //   return res.status(200).json(response);
        // }
    
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



module.exports = router;