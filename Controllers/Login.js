const express = require("express");
const router = express.Router();
const sql = require("mssql");
const config = require("../config/db"); 

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const pool = await sql.connect(config);
        const query = `
            SELECT user_id, user_name, role_id, password
            FROM tb_users
            WHERE user_name = @username AND password = @password
        `;

        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .input('password', sql.VarChar, password)
            .query(query);
      
        if (result.recordset.length > 0) {
            console.log("Login successful");
            res.json({ success: true, message: 'Login successful', user: result.recordset[0] });
        } else {
            console.log("Invalid username or password");
            res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    } finally {
        await sql.close();
    }
});

router.post('/reset-password', async (req, res) => {
    const { username, newPassword, confirmPassword } = req.body;

    try {
        // Check if newPassword and confirmPassword match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match' });
        }

        const pool = await sql.connect(config);
        const fetchPasswordQuery = `
            SELECT password
            FROM tb_users
            WHERE user_name = @username
        `;

        const fetchPasswordResult = await pool.request()
            .input('username', sql.VarChar, username)
            .query(fetchPasswordQuery);

        const existingPassword = fetchPasswordResult.recordset[0].password;

        if (existingPassword === newPassword) {
            return res.status(400).json({ success: false, message: 'New password must be different from the existing password' });
        }

        const updateQuery = `
            UPDATE tb_users
            SET password = @newPassword
            WHERE user_name = @username
        `;

        await pool.request()
            .input('newPassword', sql.VarChar, newPassword)
            .input('username', sql.VarChar, username)
            .query(updateQuery);

        res.json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    } finally {
        await sql.close();
    }
});

module.exports = router;
