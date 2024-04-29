const express = require("express");
const router = express.Router();
const sql = require("mssql");
const config = require("../config/db");

router.post("/ClientCategory", async (req, res) => {
    try {
        console.log("Received data:", req.body);
  
        // Connect to the database
        var pool = await sql.connect(config);
        console.log("Connected to SQL Server");
  
        var {category_name } = req.body;
        console.log(category_name);
  
        const checkname = `SELECT COUNT(category_id) as count FROM tb_clientcategorymaster WHERE category_name= @category_name `;
        const checknameResult = await pool.request()
          .input('category_name', sql.VarChar, category_name)
          .query(checkname);
     
  
    
        const existingnameCount = checknameResult.recordset[0].count;
          if(existingnameCount>0)
          {
          var response = {
            message: "User with the provided Category Name already exists",
            Valid: false
          };
          return res.status(200).json(response);
        }
    
        var query = `INSERT INTO tb_clientcategorymaster (category_name) VALUES (@category_name)`;
  
        var result = await pool.request()
          
            .input('category_name', sql.VarChar, category_name)
            .query(query);
  
        console.log("Query result:", result);
  
        var response = {
            message: "Category added successfully",
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

  router.post("/fetchCategoryList", async (req, res) => {
    try {
      var pool = await sql.connect(config); // Connect to the database
      console.log(req.body);
      console.log("Connected to SQL Server");
  
      // Get the data sent from the client. req.body will have the data in JSON format
      var {category_id,category_name } = req.body;
  
      // Constructing the WHERE clause based on Vendor_ID, Vendor_Name, Vendor_Email, and Vendor_Phone
      let SQLWhereClause = "";
      var params = {};
  
     
      var query = `SELECT * FROM tb_clientcategorymaster ${SQLWhereClause}`;
  
      // Execute the query with input parameters
      var result = await pool
        .request()
        .input('category_id', sql.VarChar, params.category_id)
        .input('category_name', sql.VarChar, params.category_name)
        .query(query);
  
      
      console.log("Query result:", result.recordset);
  
      // Construct the response message
      var response = {
        message: "Category list fetched successfully",
        Valid: true,
        ResultSet: result.recordset
      };
  
      // Close the connection pool
      await pool.close();
  
      res.status(200).json([response]);
    } catch (err) {
      console.error("Error:", err);
      var response = {
        message: "Category list not fetched",
        Valid: false,
      };
      res.status(500).json([response]); // Internal server error
    }
  });



module.exports = router;