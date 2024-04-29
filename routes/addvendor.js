const express = require("express");
const router = express.Router();
const sql = require("mssql");
const config = require("../config/db");

router.post("/AddUser", async (req, res) => {
    try {
        console.log("Received data:", req.body);
  
        // Connect to the database
        var pool = await sql.connect(config);
        console.log("Connected to SQL Server");
  
        var { name, email, phone, username, password } = req.body;
        console.log(name, email, phone, username, password);
  
        const checkEmail = `SELECT COUNT(license_holderid) as count FROM tb_licenseholder WHERE email = @email `;
        const checkPhone = `SELECT COUNT(license_holderid) as count FROM tb_licenseholder WHERE phone = @phone`;
        const checkEmailResult = await pool.request()
          .input('email', sql.VarChar, email)
          .query(checkEmail);
        const checkPhoneResult=await pool.request()
          .input('phone', sql.VarChar, phone)
          .query(checkPhone);
  
    
        const existingEmailCount = checkEmailResult.recordset[0].count;
        const existingPhoneCount = checkPhoneResult.recordset[0].count;
        //console.log(existingUserCount)
    
    
          // User with the given email or phone already exists
          if(existingEmailCount>0)
          {
          var response = {
            message: "User with the provided email already exists",
            Valid: false
          };
          return res.status(200).json(response);
        }
        else if(existingPhoneCount>0)
        {
          var response = {
            message: "User with the provided phone number already exists",
            Valid: false
          };
          return res.status(200).json(response);
  
        }
          
        
  
        // Constructing the SQL query for INSERT with today's date
        var query = `INSERT INTO tb_licenseholder (name, email, phone, user_name, password) VALUES (@name, @email, @phone, @username, @password)`;
  
        var result = await pool.request()
            .input('name', sql.VarChar, name)
            .input('email', sql.VarChar, email)
            .input('phone', sql.VarChar, phone)
            .input('username', sql.VarChar, username)
            .input('password', sql.VarChar, password)
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