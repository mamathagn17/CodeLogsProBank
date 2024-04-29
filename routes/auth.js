const express = require("express");
const router = express.Router();
const sql = require("mssql");
const config = require("../config/db"); // Assuming you have a separate file for database configuration
const fs = require('fs');

router.post('/Login', async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password)

  try {
    const pool = await sql.connect(config);
    const query = `
      SELECT user_id, user_name, role_id, password
      FROM tb_users
      WHERE user_name = @username`;

    const result = await pool.request()
      .input('username', sql.VarChar, username)
      .query(query);

    if (result.recordset.length > 0) {
      const storedPassword = result.recordset[0].password; 

     
      if (password === storedPassword) {
       
     
        const loginSuccessMessage = "Login Successful";
        
      
        const loginDateTime = new Date(); // Current datetime
       
        const insertQuery = `
          INSERT INTO tb_loginlogs (user_id, user_name, login_datetime, Description)
          VALUES (@user_id, @user_name, GETDATE(), @description)`;
        await pool.request()
          .input('user_id', sql.Int, result.recordset[0].user_id)
          .input('user_name', sql.VarChar, result.recordset[0].user_name)
          .input('login_datetime', sql.DateTime, loginDateTime)
          .input('description', sql.VarChar, loginSuccessMessage)
          .query(insertQuery);

        res.json({ Valid: true, user_id: result.recordset[0].user_id,user_name: result.recordset[0].user_name , description: loginSuccessMessage });
      } else {
        console.log("Incorrect password");
        const loginFailedMessage = "Invalid Password";

        const loginDateTime = new Date();
        const insertFailedQuery = `
          INSERT INTO tb_loginlogs (user_id, user_name, login_datetime, Description)
          VALUES (@user_id, @user_name, GETDATE(), @description)`;

        await pool.request()
          .input('user_id', sql.Int, result.recordset[0].user_id)
          .input('user_name', sql.VarChar, username)
          .input('login_datetime', sql.DateTime,loginDateTime)
          .input('description', sql.VarChar, loginFailedMessage)
          .query(insertFailedQuery);

        res.json({ Valid: false, user_id: result.recordset[0].user_id, description: loginFailedMessage });
      }
    } else {
      console.log("User not found");
      
      const userNotFoundMessage = "Invalid Username";

      const loginDateTime = new Date();
      const insertNotFoundQuery = `
        INSERT INTO tb_loginlogs (user_name, login_datetime, Description)
        VALUES (@user_name, GETDATE(), @description)`;

      await pool.request()
        .input('user_name', sql.VarChar, username)
        .input('login_datetime', sql.DateTime, loginDateTime)
        .input('description', sql.VarChar, userNotFoundMessage)
        .query(insertNotFoundQuery);

      res.json({ Valid: false, user_id: null, description: userNotFoundMessage });
    }

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    await sql.close();
  }
});



router.post('/ResetPassword', async (req, res) => {
  const { user_id, newPassword, confirmPassword,user_name } = req.body; // Retrieve user_id from the request body

  try {
      // Fetch the existing password from the database
      const pool = await sql.connect(config);
      const fetchPasswordQuery = `
        SELECT password,user_name
        FROM tb_users
        WHERE user_id = @user_id   `;
  
      const fetchPasswordResult = await pool.request()
        .input('user_id', sql.Int, user_id)
      
        .query(fetchPasswordQuery);
  
      const existingPassword = fetchPasswordResult.recordset[0].password;
      const username = fetchPasswordResult.recordset[0].user_name;
      // Update the user's password in the database
      const updateQuery = `
        UPDATE tb_users
        SET password = @newPassword
        WHERE user_id = @user_id `;
  
      await pool.request()
        .input('newPassword', sql.VarChar, newPassword)
        .input('user_id', sql.Int, user_id) // Pass user_id as parameter
        .query(updateQuery);
        const resetDateTime = new Date();
        const resetPasswordLogQuery = `
            INSERT INTO tb_resetpasswordlogs (user_id, user_name, reset_datetime)
            VALUES (@user_id, @user_name, GETDATE())`;
        
        await pool.request()
            .input('user_id', sql.Int, user_id)
            .input('user_name', sql.VarChar, username)
            .input('reset_datetime', sql.DateTime,resetDateTime)
            .query(resetPasswordLogQuery);
  
      res.json({ Valid: true, message: 'Password reset successful.' });
  } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
  } finally {
      await sql.close();
  }
});


router.post("/loginlogs", async (req, res) => {
  try {
    var pool = await sql.connect(config); // Connect to the database
    console.log(req.body);
    console.log("Connected to SQL Server");

    
    var { currentPage, perPage } = req.body;

   
    const totalCountQuery =`SELECT COUNT(*) AS TotalCount FROM tb_loginlogs`;
    console.log("Total Count Query:", totalCountQuery);
    const resultTotalCount = await pool.request().query(totalCountQuery);
    const totalCount = resultTotalCount.recordset[0].TotalCount;
    console.log("Total Count:", totalCount);

    const query = `SELECT *
    FROM (
        SELECT *, ROW_NUMBER() OVER (ORDER BY user_id) AS RowNum
        FROM tb_loginlogs
    ) AS UserWithRowNum
    WHERE RowNum BETWEEN ${(currentPage - 1) * perPage + 1} AND ${currentPage * perPage}
    ORDER BY user_id;
    `;

    console.log("Query:", query);

    const result = await pool.request().query(query);
    const resultSet = result.recordset;
    console.log("Result Set:", resultSet);

    const response = {
      message: "Login logs list fetched successfully",
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

router.post("/resetlogs", async (req, res) => {
  try {
    var pool = await sql.connect(config); // Connect to the database
    console.log(req.body);
    console.log("Connected to SQL Server");

    
    var { currentPage, perPage } = req.body;

   
    const totalCountQuery =`SELECT COUNT(*) AS TotalCount FROM tb_resetpasswordlogs`;
    console.log("Total Count Query:", totalCountQuery);
    const resultTotalCount = await pool.request().query(totalCountQuery);
    const totalCount = resultTotalCount.recordset[0].TotalCount;
    console.log("Total Count:", totalCount);

    const query = `SELECT *
    FROM (
        SELECT *, ROW_NUMBER() OVER (ORDER BY user_id) AS RowNum
        FROM tb_resetpasswordlogs
    ) AS UserWithRowNum
    WHERE RowNum BETWEEN ${(currentPage - 1) * perPage + 1} AND ${currentPage * perPage}
    ORDER BY user_id;
    `;

    console.log("Query:", query);

    const result = await pool.request().query(query);
    const resultSet = result.recordset;
    console.log("Result Set:", resultSet);

    const response = {
      message: "Reset Password logs list fetched successfully",
      Valid: true,
      TotalCount: totalCount,
      ResultSet: resultSet
    };

    res.status(200).json(response);
  } catch (err) {
    console.error("Error:", err);
    const response = {
      message: " Reset Password list not fetched",
      Valid: false,
    };
    res.status(500).json(response);
  }
});
router.post('/ForgetPassword', async (req, res) => {
  const { user_name, newPassword, confirmPassword } = req.body; // Retrieve user_name from the request body

  try {
  
    const pool = await sql.connect(config);
    
    const fetchUserIdQuery = `
      SELECT user_id
      FROM tb_users
      WHERE user_name = @user_name`;

    const fetchUserIdResult = await pool.request()
      .input('user_name', sql.VarChar, user_name)
      .query(fetchUserIdQuery);

    const user_id = fetchUserIdResult.recordset[0].user_id;

    // Update the user's password in the database
    const updateQuery = `
      UPDATE tb_users
      SET password = @newPassword
      WHERE user_name = @user_name`;

    await pool.request()
      .input('newPassword', sql.VarChar, newPassword)
      .input('user_name', sql.VarChar, user_name)
      .query(updateQuery);
      
    // Insert the password reset log into tb_resetpasswordlogs
    const resetDateTime = new Date(); 
    const resetPasswordLogQuery = `
      INSERT INTO tb_resetpasswordlogs (user_id, user_name, reset_datetime)
      VALUES (@user_id, @user_name, GETDATE())`;
    
    await pool.request()
      .input('user_id', sql.Int, user_id)
      .input('user_name', sql.VarChar, user_name)
      .input('reset_datetime', sql.DateTime, resetDateTime)
      .query(resetPasswordLogQuery);

    res.json({ Valid: true, message: 'Password reset successful.' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    await sql.close();
  }
});



router.get('/downloadLoginLogs', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const path = require('path');

    const result = await pool.request().query('SELECT * FROM tb_loginlogs');
    const loginLogs = result.recordset;

    // Convert the data to CSV format
    const csvData = loginLogs.map(log => Object.values(log).join(','));

    // Define the directory path for temporary files
    const tempDir = path.join(__dirname, '..', 'temp');
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    // Write CSV data to a temporary file
    const tempFilePath = path.join(tempDir, 'login_logs.csv');
    fs.writeFileSync(tempFilePath, csvData.join('\n'));

    // Send the file as a response
    res.download(tempFilePath, 'login_logs.csv', () => {
      // Cleanup: delete the temporary file after download
      fs.unlinkSync(tempFilePath);
    });
  } catch (error) {
    console.error('Error fetching login logs:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  } finally {
    await sql.close();
  }
});


module.exports = router;