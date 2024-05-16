const express = require('express');
const router = express.Router();
const sql = require('mssql');
const config = require('../config/db');

router.get('/fetchuserrole', async (req, res) => {
    try {
      const pool = await sql.connect(config);
      const result = await pool.request().query('SELECT * FROM tb_roles');
  
      res.status(200).json({ userroles: result.recordset });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Error occurred while fetching roles.' });
    }
});

router.post('/fetchusernames', async (req, res) => {
    const { role_id } = req.body;
    try {
      const pool = await sql.connect(config);
      const result = await pool.request()
        .input('role_id', sql.Int, role_id)
        .query('SELECT * FROM tb_users WHERE role_id = @role_id');
      
      res.status(200).json({ usernames: result.recordset });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Error occurred while fetching usernames.' });
    }
});

router.get('/data', async (req, res) => {
    try {
      const pool = await sql.connect(config);
      const result = await pool.request().query('SELECT * FROM ProgramMaster'); // Replace 'your_table' with the actual table name
      const formattedData = await formatData(result.recordset); // Format the data into a tree structure
      res.status(200).json(formattedData);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Error occurred while fetching data.' });
    }
});

router.post('/fetchuserpermissions', async (req, res) => {
    const { userId } = req.body;
    try {
      const pool = await sql.connect(config);
      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query('SELECT ProgramID FROM UserProgramMaster WHERE UserId = @userId');
      
      const permissions = result.recordset.map(record => record.ProgramID);
      res.status(200).json({ permissions });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Error occurred while fetching user permissions.' });
    }
});

// Function to format data into a tree structure
const formatData = async (data) => {
    const map = new Map();
    const roots = [];
  
    data.forEach(item => {
      map.set(item.RecID, { ...item, children: [], checked: false });
    });
  
    data.forEach(item => {
      const parent = map.get(item.ParentID);
      if (parent) {
        parent.children.push(map.get(item.RecID));
      } else {
        roots.push(map.get(item.RecID));
      }
    });
  
    return roots;
};
router.post('/revokepermissions', async (req, res) => {
  const { userId, permissions } = req.body;
  try {
      // Create a new connection pool
      const pool = await sql.connect(config);

      // Construct the SQL query to delete permissions
      const query = `
          DELETE FROM UserProgramMaster
          WHERE UserId = @userId
          AND ProgramID IN (${permissions.join(',')})
      `;
      
      // Execute the SQL query with parameters
      const result = await pool.request()
          .input('userId', sql.Int, userId)
          .query(query);

      // Close the connection pool
      await pool.close();

      // Send success response
      res.status(200).json({ message: 'Permissions revoked successfully.' });
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Error occurred while revoking permissions.' });
  }
});
router.post('/grantpermissions', async (req, res) => {
  const { userId, permissions } = req.body;
  try {
      // Create a new connection pool
      const pool = await sql.connect(config);

      // Construct the SQL query to grant permissions
      const query = `
          INSERT INTO UserProgramMaster (UserId, ProgramID)
          VALUES ${permissions.map(programId => `(${userId}, ${programId})`).join(',')}
      `;
      
      // Execute the SQL query with parameters
      const result = await pool.request().query(query);

      // Close the connection pool
      await pool.close();

      // Send success response
      res.status(200).json({ message: 'Permissions granted successfully.' });
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Error occurred while granting permissions.' });
  }
});

module.exports = router;