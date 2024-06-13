const express = require("express");
const router = express.Router();
const sql = require("mssql");
const config = require("../config/db");

router.post("/GetUserList", async (req, res) => {
    try {
      var pool = await sql.connect(config); // Connect to the database
      console.log(req.body);
      console.log("Connected to SQL Server");
  
      // Get the data sent from the client. req.body will have the data in JSON format
      var {license_holderid, name, email, phone } = req.body;
  
      // Constructing the WHERE clause based on Vendor_ID, Vendor_Name, Vendor_Email, and Vendor_Phone
      let SQLWhereClause = "";
      var params = {};
  
      // This is a dynamic WHERE clause based on the user input
      if (license_holderid !== "") {
        SQLWhereClause = "WHERE license_holderid= @license_holderid";
        params.license_holderid= license_holderid;
      }
  
      if (name !== "") {
        if (SQLWhereClause !== "") {
          SQLWhereClause += " AND name LIKE '%' + @name + '%'";
        } else {
          SQLWhereClause = " WHERE name LIKE '%' + @name + '%'";
        }
        params.name = name;
      }
  
      if (email !== "") {
        if (SQLWhereClause !== "") {
          SQLWhereClause += " AND email LIKE '%' + @email + '%'";
        } else {
          SQLWhereClause = " WHERE email LIKE '%' + @email + '%'";
        }
        params.email = email;
      }
  
      if (phone !== "") {
        if (SQLWhereClause !== "") {
          SQLWhereClause += " AND phone LIKE '%' + @phone+ '%'";
        } else {
          SQLWhereClause = " WHERE phone LIKE '%' + @phone + '%'";
        }
        params.phone = phone;
      }
  
      // Constructing the SQL query with the WHERE clause
      var query = `SELECT * FROM tb_licenseholder ${SQLWhereClause}`;
  
      // Execute the query with input parameters
      var result = await pool
        .request()
        .input('license_holderid', sql.VarChar, params.license_holderid)
        .input('name', sql.VarChar, params.name)
        .input('email', sql.VarChar, params.email)
        .input('phone', sql.VarChar, params.phone)
        .query(query);
  
      // result.recordset will have the result retrieved from the table
      console.log("Query result:", result.recordset);
  
      // Construct the response message
      var response = {
        message: "User list fetched successfully",
        Valid: true,
        ResultSet: result.recordset
      };
  
      // Close the connection pool
      await pool.close();
  
      res.status(200).json([response]);
    } catch (err) {
      console.error("Error:", err);
      var response = {
        message: "User list not fetched",
        Valid: false,
      };
      res.status(500).json([response]); // Internal server error
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
        DELETE FROM  tb_licenseholder
        WHERE license_holderid IN (${ids.map((license_holderid, index) =>` @license_holderid${index}`).join(',')})
      `;
  
      const request = pool.request();
      ids.forEach((license_holderid, index) => {
        request.input(`license_holderid${index}`, sql.Int, license_holderid);
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
  router.post('/Vendor_Details', async (req, res) => {
    try {
      const {license_holderid} = req.body;
      const pool = await sql.connect(config);
      const query =` SELECT * FROM  tb_licenseholder WHERE license_holderid= @license_holderid`;
      const result = await pool.request()
        .input('license_holderid', sql.Int, license_holderid)
        .query(query);
  
      if (result.recordset.length > 0) {
        const userData = result.recordset[0];
        res.status(200).json({ Valid: true, data: userData });
      } else {
        res.status(404).json({ Valid: false, message: 'User not found' });
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      res.status(200).json({ Valid: false, message: 'Failed to fetch user details..' });
    }
  });
  router.post('/updateUser', async (req, res) => {
    try {
        const { license_holderid, name, email, phone, user_name, password } = req.body;
        const pool = await sql.connect(config);
        const updateQuery = `
            UPDATE tb_licenseholder
            SET name = @name, email = @email, 
            phone = @phone, user_name = @user_name, 
            password = @password
            WHERE license_holderid= @license_holderid`;
  
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('email', sql.NVarChar, email)
            .input('phone', sql.NVarChar, phone)
            .input('user_name', sql.NVarChar, user_name)
            .input('password', sql.NVarChar, password)
            .input('license_holderid', sql.Int,license_holderid)
            .query(updateQuery);
  
        // Check if any rows were affected by the update
        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            res.status(200).json({ Valid: true, message: 'User information updated successfully' });
        } else {
            res.status(404).json({ Valid: false, message: 'User not found or no changes made' });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(200).json({ Valid: false, message: 'Failed to update user information' });
    }
  });
  router.post('/DeleteUser', async (req, res) => {
    try {
      const {license_holderid} = req.body;
      const pool = await sql.connect(config);
      const deleteQuery = `
        DELETE FROM  tb_licenseholder
        WHERE license_holderid= @license_holderid
      `;
      const result = await pool.request()
        .input('license_holderid', sql.Int, license_holderid)
        .query(deleteQuery);
  
      // Check if any rows were affected by the deletion
      if (result.rowsAffected && result.rowsAffected[0] > 0) {
        res.status(200).json({ Valid: true, message: 'User deleted successfully' });
      } else {
        res.status(404).json({ Valid: false, message: 'User not found or no changes made' });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ Valid: false, message: 'Failed to delete user' });
    }
  });

  const fs = require('fs');
  router.get('/downloadvendordetails', async (req, res) => {
    try {
      const pool = await sql.connect(config);
      const path = require('path');
  
      const result = await pool.request().query('SELECT * FROM tb_licenseholder');
      const loginLogs = result.recordset;
      const csvData = loginLogs.map(log => Object.values(log).join(','));
      const tempDir = path.join(__dirname, '..', 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }
      const tempFilePath = path.join(tempDir, 'VendorDetails_logs.csv');
      fs.writeFileSync(tempFilePath, csvData.join('\n'));
  
      res.download(tempFilePath, 'vendordetails.csv', () => {
        fs.unlinkSync(tempFilePath);
      });
    } catch (error) {
      console.error('Error fetching Vendor Details:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    } finally {
      await sql.close();
    }
  });
  


  module.exports = router;