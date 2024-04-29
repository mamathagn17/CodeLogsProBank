const express = require("express");
const router = express.Router();
const sql = require("mssql");
const config = require("../config/db");

router.post("/MonthlyList", async (req, res) => {
    try {
        const { currentPage, perPage, month, branch_id, client_id } = req.body;
        //console.log(currentPage, perPage, month, branch_id, client_id )

        let SQLwhereClause = `WHERE 1=1`;
        const params = {};

        if (month) {
            SQLwhereClause += ` AND [month] = @month`;
            params.month = month;
        }

        if (branch_id) {
            SQLwhereClause += ` AND branch_id = @branch_id`;
            params.branch_id = branch_id;
        }
        if (client_id) {
            SQLwhereClause += ` AND client_id = @client_id`;
            params.client_id = client_id;
        }
        
        const query = `
            SELECT Temp.*,
                C.client_name,
                B.branch_name,
                U.user_name
            FROM (
                SELECT 
                    *, 
                    ROW_NUMBER() OVER (ORDER BY client_id) AS RowNum
                FROM tb_monthlyreconciliation
                ${SQLwhereClause}
            ) AS Temp
            LEFT JOIN tb_clientmaster C ON Temp.client_id = C.client_id
            LEFT JOIN tb_branch B ON Temp.branch_id = B.branch_id
            LEFT JOIN tb_users U ON Temp.actionedby = U.user_id
            WHERE RowNum > ${(currentPage - 1) * perPage} AND RowNum <= ${currentPage * perPage}
            ORDER BY client_id`;

        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('month', sql.VarChar, params.month)
            .input('branch_id', sql.VarChar, params.branch_id)
            .input('client_id',sql.VarChar,params.client_id)
            .query(query);

        const resultSet = result.recordset;

        const response = {
            message: "Monthly reconciliation fetched successfully",
            Valid: true,
            ResultSet: resultSet
        };

        res.status(200).json(response);
    } catch (err) {
        console.error("Error:", err);
        const response = {
            message: "Monthly reconciliation not fetched",
            Valid: false,
        };
        res.status(500).json(response); // Internal server error
    }
});

router.post("/GetPendingList", async (req, res) => {
    try {
        const { currentPage, perPage, month, branch_id, client_id,year } = req.body;
      //  console.log(currentPage, perPage, month, branch_id, client_id,year )

        let SQLwhereClause = `WHERE 1=1 AND pending_status = 1`; // Added condition for pending_status
        const params = {};

        if (month) {
            SQLwhereClause += ` AND [month] = @month`;
            params.month = month;
        }

        if (branch_id) {
            SQLwhereClause += ` AND branch_id = @branch_id`;
            params.branch_id = branch_id;
        }
        if (client_id) {
            SQLwhereClause += ` AND client_id = @client_id`;
            params.client_id = client_id;
        }
        if (year) {
            SQLwhereClause += ` AND year = @year`;
            params.year = year;
        }
        
        const query = `
            SELECT Temp.*,
                C.client_name,
                B.branch_name,
                U.user_name
            FROM (
                SELECT 
                    *, 
                    ROW_NUMBER() OVER (ORDER BY client_id) AS RowNum
                FROM tb_monthlyreconciliation
                ${SQLwhereClause}
            ) AS Temp
            LEFT JOIN tb_clientmaster C ON Temp.client_id = C.client_id
            LEFT JOIN tb_branch B ON Temp.branch_id = B.branch_id
            LEFT JOIN tb_users U ON Temp.actionedby = U.user_id
            WHERE RowNum > ${(currentPage - 1) * perPage} AND RowNum <= ${currentPage * perPage}
            ORDER BY client_id`;

        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('month', sql.VarChar, params.month)
            .input('branch_id', sql.VarChar, params.branch_id)
            .input('client_id',sql.VarChar,params.client_id)
            .input('year',sql.VarChar,params.year)
            .query(query);

        const resultSet = result.recordset;

        const response = {
            message: "Monthly reconciliation fetched successfully",
            Valid: true,
            ResultSet: resultSet
        };

        res.status(200).json(response);
    } catch (err) {
        console.error("Error:", err);
        const response = {
            message: "Monthly reconciliation not fetched",
            Valid: false,
        };
        res.status(500).json(response); // Internal server error
    }
});





router.post("/UpdateField", async (req, res) => {
    try {
        const { requestId, fieldName, updatedValue } = req.body;

        let query;
        switch (fieldName) {
            case 'amount':
            case 'actionedby':
                query = `UPDATE tb_monthlyreconciliation SET ${fieldName} = @updatedValue WHERE client_id = @requestId`;
                break;
            case 'remarks':
                query = `UPDATE tb_monthlyreconciliation SET remarks = @updatedValue WHERE client_id = @requestId`;
                break;
            default:
                return res.status(400).json({ message: "Invalid field name" });
        }

        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('requestId', sql.Int, requestId)
            .input('updatedValue', sql.VarChar, updatedValue)
            .query(query);

        res.status(200).json({ Success: true });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ message: "Error updating field" });
    }
});
router.post("/MarkAsPending", async (req, res) => {
    try {
        const { clientIds } = req.body;

        // Construct a comma-separated string of client IDs
        const clientIdsString = clientIds.join(',');

        // Update the pending_status of the selected records to 1 (pending)
        const query = `UPDATE tb_monthlyreconciliation SET pending_status = 1 WHERE client_id IN (${clientIdsString})`;

        const pool = await sql.connect(config);
        await pool.request().query(query);

        res.status(200).json({ Success: true });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ message: "Error marking records as pending" });
    }
});
router.post("/MarkAsCompleted", async (req, res) => {
    try {
        const { clientIds } = req.body;

       
        const clientIdsString = clientIds.join(',');

        // Update the pending_status of the selected records to 1 (pending)
        const query = `UPDATE tb_monthlyreconciliation SET pending_status = 2 WHERE client_id IN (${clientIdsString})`;

        const pool = await sql.connect(config);
        await pool.request().query(query);

        res.status(200).json({ Success: true });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ message: "Error marking records as pending" });
    }
});


router.post('/LogMonthlyAction', async (req, res) => {
    
    const { userInfo, recIds, action } = req.body;
  
    console.log(userInfo);

  
  const { user_id, user_name } = userInfo;
  const date_time = new Date();
  
    try {
     
      const pool = await sql.connect(config);
  
      for (const recId of recIds) {
       
        const query = `
            INSERT INTO tb_monthlyreconciliationlogs (user_id, user_name, recid, date_time, action)
            VALUES (@user_id, @user_name, @recid, GETDATE(), @action)
        `;

        await pool.request()
            .input('user_id', sql.Int, user_id)
            .input('user_name', sql.VarChar, user_name)
            .input('recid', sql.Int, recId)
            .input('date_time', sql.DateTime,date_time)
            .input('action', sql.VarChar, action)
            .query(query);
    }
  
     
      res.json({ success: true, message: 'Monthly Reconciliation Action Pending Successfull.' });
    } catch (error) {
      
      console.error('Error:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    } finally {
     
      await sql.close();
    }
  });



  


router.post("/monthlyreconciliationlogs", async (req, res) => {
    try {
      var pool = await sql.connect(config); // Connect to the database
      console.log(req.body);
      console.log("Connected to SQL Server");
  
      
      var { currentPage, perPage } = req.body;
  
     
      const totalCountQuery =`SELECT COUNT(*) AS TotalCount FROM tb_monthlyreconciliationlogs`;
      console.log("Total Count Query:", totalCountQuery);
      const resultTotalCount = await pool.request().query(totalCountQuery);
      const totalCount = resultTotalCount.recordset[0].TotalCount;
      console.log("Total Count:", totalCount);
  
      const query = `SELECT *
      FROM (
          SELECT *, ROW_NUMBER() OVER (ORDER BY date_time) AS RowNum
          FROM tb_monthlyreconciliationlogs
      ) AS UserWithRowNum
      WHERE RowNum BETWEEN ${(currentPage - 1) * perPage + 1} AND ${currentPage * perPage}
      ORDER BY user_id;
      `;
  
     
  
      const result = await pool.request().query(query);
      const resultSet = result.recordset;
      console.log("Result Set:", resultSet);
  
      const response = {
        message: "Monthly Reconciliation logs list fetched successfully",
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
  




module.exports = router;