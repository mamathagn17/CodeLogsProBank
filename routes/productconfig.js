const express = require("express");
const router = express.Router();
const sql = require("mssql");
const config = require("../config/db");

router.post("/ProductConfig", async (req, res) => {
    try {
        console.log("Received data:", req.body);
  
        // Connect to the database
        var pool = await sql.connect(config);
        console.log("Connected to SQL Server");
  
        var {product_name } = req.body;
        console.log(product_name);
  
        const checkname = `SELECT COUNT(product_id) as count FROM tb_productmaster WHERE product_name= @product_name `;
        const checknameResult = await pool.request()
          .input('product_name', sql.VarChar, product_name)
          .query(checkname);
     
  
    
        const existingnameCount = checknameResult.recordset[0].count;
          if(existingnameCount>0)
          {
          var response = {
            message: "User with the provided product Name already exists",
            Valid: false
          };
          return res.status(200).json(response);
        }
    
        var query = `INSERT INTO tb_productmaster (product_name) VALUES (@product_name)`;
  
        var result = await pool.request()
          
            .input('product_name', sql.VarChar, product_name)
            .query(query);
  
        console.log("Query result:", result);
  
        var response = {
            message: "Product added successfully",
            Valid: true
        };
  
        // Close the connection pool
        await pool.close();
  
        res.status(200).json(response);
      
    } catch (err) {
        // Ensure that the pool variable is defined for proper error handling
        console.error("Error:", err);
        
        var response = {
          message: "Product not added ",
          Valid: false
      };
  
        
  
        // Handle errors and close the connection pool
        if (pool) {
            await pool.close();
        }
  
        res.status(200).json(response);
    }
  
  });

  router.post("/fetchProductList", async (req, res) => {
    try {
      var pool = await sql.connect(config); // Connect to the database
      console.log(req.body);
      console.log("Connected to SQL Server");
  
     
      var {product_id,product_name ,status} = req.body;
  
      // Constructing the WHERE clause based on Vendor_ID, Vendor_Name, Vendor_Email, and Vendor_Phone
      let SQLWhereClause = "";
      var params = {};
  
     
      var query = `SELECT * FROM tb_productmaster ${SQLWhereClause}`;
  
      // Execute the query with input parameters
      var result = await pool
        .request()
        .input('product_id', sql.VarChar, params.product_id)
        .input('product_name', sql.VarChar, params.product_name)
        .input('status', sql.VarChar, params.status)
        .query(query);
  
      
      console.log("Query result:", result.recordset);
  
      // Construct the response message
      var response = {
        message: "product list fetched successfully",
        Valid: true,
        ResultSet: result.recordset
      };
  
      // Close the connection pool
      await pool.close();
  
      res.status(200).json([response]);
    } catch (err) {
      console.error("Error:", err);
      var response = {
        message: "product list not fetched",
        Valid: false,
      };
      res.status(500).json([response]); // Internal server error
    }
  });



module.exports = router;