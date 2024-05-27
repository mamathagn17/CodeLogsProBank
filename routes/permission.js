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


// router.post('/dynamicRoutes', async (req, res) => {
//   var responseData = {isValid:true, responceText:""};
//   try{
//       const userID = req.body.userID;
//       var finalScreens = [];

//       var getLevelZero = "SELECT fontIcon, caption, recID FROM programmaster where levelNumber = 0 and userID = " + userID; 
//       //executeQUery

//       const resultSet = [{
//         fontIcon:"fontIcon",
//         title:"caption",
//         recID:"recID"
//       }];

//       resultSet.forEach(element => {
//         var curScreen = {};
//         var getScreens = "SELECT caption,URL from programmaster WHERE parentID = "+element.recID+" and recID in (SELECT recID FROM userprogrammaster WHERE userID = "+ userID +")";
//         // executr query
//         var queryResult = [{caption:"Shops Arround You", URL:"/ShowShops"},{caption:"Activities near you", URL:"/Activities"}];
//         queryResult.forEach(element => {finalScreens.add(element)})

//       });
//       return finalScreens;
//     }
//     catch(err){
      
//     console.log('login err')
//     console.log(err)
//     res.status(500).json(responseData);
//   }

// });



router.post('/dynamicRoutes', async (req, res) => {
  const { userInfo } = req.body;
  const { user_id } = userInfo;
  const responseData = { isValid: true, responseText: "" };

  try {
    const pool = await sql.connect(config);
    const userID = user_id;
    const finalScreens = [];

    // Query for level 0 screens the user has access to
    const getLevelZeroQuery = `
      SELECT caption, recID
      FROM ProgramMaster 
      WHERE levelNumber = 0 AND recID IN (
        SELECT ProgramID FROM UserProgramMaster WHERE UserId = @userID
      )
    `;
    const levelZeroResults = await pool.request()
      .input('userID', sql.Int, userID)
      .query(getLevelZeroQuery);
      console.log(levelZeroResults);

    for (const element of levelZeroResults.recordset) {
      const curScreen = {
        icon: element.fontIcon,
        title: element.caption,
        children: []
      };

      // Query for child screens the user has access to
      const getScreensQuery = `
        SELECT caption, FormName 
        FROM ProgramMaster 
        WHERE ParentID = @parentID AND RecID IN (
          SELECT ProgramID FROM UserProgramMaster WHERE UserId = @userID
        )
      `;
      const queryResult = await pool.request()
        .input('parentID', sql.Int, element.recID)
        .input('userID', sql.Int, userID)
        .query(getScreensQuery);
        console.log(queryResult);

      queryResult.recordset.forEach(child => {
        curScreen.children.push({
          title: child.caption,
          link: child.FormName
        });
      });

      // Only add the screen if it has children or is a top-level screen
      if (curScreen.children.length > 0 || element.levelNumber === 0) {
        finalScreens.push(curScreen);
      }
    }

    responseData.routes = finalScreens;
    res.status(200).json(responseData);
  } catch (err) {
    console.log('Error fetching dynamic routes:', err);
    responseData.isValid = false;
    responseData.responseText = "An error occurred while fetching routes.";
    res.status(500).json(responseData);
  }
});



module.exports = router;