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

      var { name, email, phone, user_name, password } = req.body;
      console.log(name, email, phone, user_name, password);

      const checkEmail = `SELECT COUNT(license_holderid) as count FROM tb_licenseholder WHERE email = @email `;
      const checkPhone =` SELECT COUNT(license_holderid) as count FROM tb_licenseholder WHERE phone = @phone`;
      const checkEmailResult = await pool.request()
        .input('email', sql.VarChar, email)
        .query(checkEmail);
      const checkPhoneResult=await pool.request()
        .input('phone', sql.VarChar, phone)
        .query(checkPhone);

      const existingEmailCount = checkEmailResult.recordset[0].count;
      const existingPhoneCount = checkPhoneResult.recordset[0].count;
  
      // User with the given email or phone already exists
      if (existingEmailCount > 0) {
          var response = {
              message: "User with the provided email already exists",
              Valid: false
          };
          return res.status(200).json(response);
      } else if (existingPhoneCount > 0) {
          var response = {
              message: "User with the provided phone number already exists",
              Valid: false
          };
          return res.status(200).json(response);
      }

      // Constructing the SQL query for INSERT with today's date
      var query = `INSERT INTO tb_licenseholder (name, email, phone, user_name, password) 
                   OUTPUT INSERTED.license_holderid
                   VALUES (@name, @email, @phone, @user_name, @password)`;

      var result = await pool.request()
          .input('name', sql.VarChar, name)
          .input('email', sql.VarChar, email)
          .input('phone', sql.VarChar, phone)
          .input('user_name', sql.VarChar, user_name)
          .input('password', sql.VarChar, password)
          .query(query);

      if (result.recordset && result.recordset.length > 0 && result.recordset[0].license_holderid) {
          const license_holderid = result.recordset[0].license_holderid;
          console.log("License holder ID:", license_holderid);

          var response = {
              message: "User added successfully",
              Valid: true,
              license_holderid: license_holderid
          };
      } else {
          var response = {
              message: "User not added",
              Valid: false
          };
      }

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



  router.post('/Holdercreationlogssave', async (req, res) => {
    
    const { userInfo, license_holderid,name} = req.body;
  
    console.log(userInfo);

  
  const { user_id, user_name } = userInfo;
  const date_time = new Date();
  
    try {
     
      const pool = await sql.connect(config);
  
     
       
        const query = `
            INSERT INTO tb_holderlogs (user_id, user_name,license_holderid, name,date_time)
            VALUES (@user_id, @user_name, @license_holderid,@name ,GETDATE())
        `;

        await pool.request()
            .input('user_id', sql.Int, user_id)
            .input('user_name', sql.VarChar, user_name)
            .input('license_holderid', sql.Int, license_holderid)
            .input('name', sql.VarChar, name)
            .input('date_time', sql.DateTime,date_time)
           
            .query(query);
    
  
     
      res.json({ success: true, message: 'Holder Creation logs inserted.' });
    } catch (error) {
      
      console.error('Error:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    } finally {
     
      await sql.close();
    }
  });


  router.post("/addvendorlogs", async (req, res) => {
    try {
      var pool = await sql.connect(config); // Connect to the database
      console.log(req.body);
      console.log("Connected to SQL Server");
  
      
      var { currentPage, perPage } = req.body;
  
     
      const totalCountQuery =`SELECT COUNT(*) AS TotalCount FROM tb_holderlogs`;
      console.log("Total Count Query:", totalCountQuery);
      const resultTotalCount = await pool.request().query(totalCountQuery);
      const totalCount = resultTotalCount.recordset[0].TotalCount;
      console.log("Total Count:", totalCount);
  
      const query = `SELECT *
      FROM (
          SELECT *, ROW_NUMBER() OVER (ORDER BY date_time DESC) AS RowNum
          FROM tb_holderlogs
      ) AS UserWithRowNum
      WHERE RowNum BETWEEN ${(currentPage - 1) * perPage + 1} AND ${currentPage * perPage}
      ORDER BY date_time DESC;
      `;
  
     
  
      const result = await pool.request().query(query);
      const resultSet = result.recordset;
      console.log("Result Set:", resultSet);
  
      const response = {
        message: "Holder Logs list fetched successfully",
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
  
  const fs = require('fs');
  router.get('/downloadHolderLogs', async (req, res) => {
    try {
      const pool = await sql.connect(config);
      const path = require('path');
  
      const result = await pool.request().query('SELECT * FROM tb_holderlogs');
      const holderLogs = result.recordset;
      const csvData = holderLogs.map(log => Object.values(log).join(','));
      const tempDir = path.join(__dirname, '..', 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }
      const tempFilePath = path.join(tempDir, 'Holder_logs.csv');
      fs.writeFileSync(tempFilePath, csvData.join('\n'));
  
      res.download(tempFilePath, 'holder.csv', () => {
        fs.unlinkSync(tempFilePath);
      });
    } catch (error) {
      console.error('Error fetching Holder logs:', error);
      res.status(200).json({ success: false, message: 'Internal Server Error' });
    } finally {
      await sql.close();
    }
  });




module.exports = router;