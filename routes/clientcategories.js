const express = require('express');
const router = express.Router();
const sql = require('mssql');
const config = require('../config/db');

router.get('/clientCategories', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM tb_clientcategorymaster');
        await pool.close();

        res.status(200).json({ categories: result.recordset });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error occurred while fetching categories.' });
    }
});
router.post("/addclient", async (req, res) => {
    try {
        console.log("Received data:", req.body);
  
        // Connect to the database
        var pool = await sql.connect(config);
        console.log("Connected to SQL Server");
  
        var { client_name, category_id,email, phone ,client_code} = req.body;
        console.log(client_name, category_id,email, phone,client_code );
  
        const checkEmail = `SELECT COUNT(client_id) as count FROM tb_clientmaster WHERE email = @email `;
        const checkPhone = `SELECT COUNT(client_id) as count FROM tb_clientmaster WHERE phone = @phone`;
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
        var query =` INSERT INTO tb_clientmaster (client_name,category_id, email, phone,client_code) VALUES (@client_name, @category_id,@email, @phone,@client_code)`;
  
        var result = await pool.request()
            .input('client_name', sql.VarChar, client_name)
            .input('category_id',sql.Int,category_id)
            .input('email', sql.VarChar, email)
            .input('phone', sql.VarChar, phone)
            .input('client_code', sql.VarChar, client_code)
            
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
  router.post("/GetClientList", async (req, res) => {
    try {
        var pool = await sql.connect(config); // Connect to the database
        console.log(req.body);
        console.log("Connected to SQL Server");

        // Get the data sent from the client. req.body will have the data in JSON format
        var { client_id, client_name, category_id, email, phone, status, client_code } = req.body;

        // Constructing the WHERE clause based on Vendor_ID, Vendor_Name, Vendor_Email, and Vendor_Phone
        let SQLWhereClause = "";
        var params = { client_id, client_name, category_id, email, phone, status, client_code };

        // Constructing the SQL query with the WHERE clause
        var query = `SELECT 
                        cm.*, 
                        cc.category_name 
                    FROM 
                        tb_clientmaster cm
                    JOIN 
                        tb_clientcategorymaster cc ON cm.category_id = cc.category_id`;

        // Execute the query with input parameters
        var result = await pool
            .request()
            .input('client_id', sql.VarChar, params.client_id)
            .input('client_name', sql.VarChar, params.client_name)
            .input('category_id', sql.Int, params.category_id)
            .input('email', sql.VarChar, params.email)
            .input('phone', sql.VarChar, params.phone)
            // .input('status', sql.Int, params.status)
            .input('client_code', sql.VarChar, params.client_code)
            .query(query);

        // result.recordset will have the result retrieved from the table
        console.log("Query result:", result.recordset);

        // Construct the response message
        var response = {
            message: "Client list fetched successfully",
            Valid: true,
            ResultSet: result.recordset
        };

        // Close the connection pool
        await pool.close();

        res.status(200).json([response]);
    } catch (err) {
        console.error("Error:", err);
        var response = {
            message: "Client list not fetched",
            Valid: false,
        };
        res.status(500).json([response]); // Internal server error
    }
});
router.post('/getclientdetails', async (req, res) => {
    try {
      const { client_id } = req.body;
      const pool = await sql.connect(config);
      const query =` SELECT * FROM tb_clientmaster WHERE client_id = @client_id`;
      const result = await pool.request()
        .input('client_id', sql.Int,client_id)
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

  router.post('/clientupdate', async (req, res) => {
    try {
        const { client_id, client_name, email, phone,category_id,status,client_code} = req.body;
        const pool = await sql.connect(config);
        const updateQuery = `
            UPDATE tb_clientmaster
            SET client_name = @client_name,  category_id = @category_id,email = @email, 
            phone = @phone, status= @status,
            client_code = @client_code
            WHERE client_id = @client_id`;
  
        const result = await pool.request()
            .input('client_name', sql.NVarChar, client_name)
            .input('category_id', sql.Int, category_id)
            .input('email', sql.NVarChar, email)
            .input('phone', sql.NVarChar, phone)
            .input('status', sql.Int,status)
            .input('client_code', sql.NVarChar, client_code)
            .input('client_id', sql.Int, client_id)
            .query(updateQuery);
  
        // Check if any rows were affected by the update
        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            res.status(200).json({ Valid: true, message: 'Client information updated successfully' });
        } else {
            res.status(404).json({ Valid: false, message: 'Client not found or no changes made' });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(200).json({ Valid: false, message: 'Failed to update Client information' });
    }
  });


  router.post('/clientdelete', async (req, res) => {
    try {
      const { ids } = req.body;
  
      // Ensure that IDs are provided in the request
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ Valid: false, message: 'No Client IDs provided for deletion' });
      }
  
      const pool = await sql.connect(config);
      const deleteQuery = `
        DELETE FROM tb_clientmaster
        WHERE client_id IN (${ids.map((client_id, index) =>` @client_id${index}`).join(',')})
      `;
  
      const request = pool.request();
      ids.forEach((client_id, index) => {
        request.input(`client_id${index}`, sql.Int, client_id);
      });
  
      
      const result = await request.query(deleteQuery);
  
     
      if (result.rowsAffected && result.rowsAffected[0] > 0) {
        return res.status(200).json({ Valid: true, message: 'Clients deleted successfully' });
      } else {
        return res.status(404).json({ Valid: false, message: 'No Clients found or no changes made' });
      }
    } catch (error) {
      console.error('Error deleting users:', error);
      return res.status(500).json({ Valid: false, message: 'Failed to delete users' });
    }
  });

module.exports = router;