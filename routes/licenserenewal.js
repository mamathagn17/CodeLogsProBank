// Backend code (Node.js - Express)

const express = require("express");
const router = express.Router();
const sql = require("mssql");
const config = require("../config/db");

router.get('/fetchbranches', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM tb_branch');
        res.status(200).json({ branches: result.recordset });
    } catch (error) {
        console.error('Error fetching branches:', error);
        res.status(500).json({ message: 'Error occurred while fetching branches.' });
    }
});

// Fetch clients endpoint
router.get('/fetchclients', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM tb_clientmaster');
        res.status(200).json({ clients: result.recordset });
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ message: 'Error occurred while fetching clients.' });
    }
});

// Get license request list endpoint
// Get license request list endpoint
// router.post("/GetLicenseRequestList", async (req, res) => {
//     try {
//         var pool = await sql.connect(config); // Connect to the database
//       console.log(req.body);
//       console.log("Connected to SQL Server");
//         const { currentPage,perPage, branchname, clientname,filename,uuid,invoicenumber,utr_number,activationdate } = req.body;

//         let SQLwhereClause = "";
//         var params = {};
        
//         if (branchname) {
//             SQLwhereClause = `WHERE Branchname = '${branchname}'`;
//         }

//         if (clientname) {
//             if (SQLwhereClause !== "") {
//                 SQLwhereClause += ` AND Clientname = '${clientname}'`;
//             } else {
//                 SQLwhereClause = `WHERE Clientname = '${clientname}'`;
//             }
//             params.clientname = clientname;
//         }
//         if (filename) {
//             if (SQLwhereClause !== "") {
//                 SQLwhereClause += ` AND Filename = '${filename}'`;
//             } else {
//                 SQLwhereClause = `WHERE Filename = '${filename}'`;
//             }
//             params.filename = filename;
//         }
//         if(uuid) {
//             if (SQLwhereClause !== "") {
//                 SQLwhereClause += ` AND uuid = '${uuid}'`;
//             } else {
//                 SQLwhereClause = `WHERE uuid = '${uuid}'`;
//             }
//             params.uuid = uuid;
//         }
//         if(invoicenumber) {
//             if (SQLwhereClause !== "") {
//                 SQLwhereClause += ` AND invoicenumber = '${invoicenumber}'`;
//             } else {
//                 SQLwhereClause = `WHERE invoicenumber = '${invoicenumber}'`;
//             }
//             params.invoicenumber = invoicenumber;
//         }
//         if(utr_number) {
//             if (SQLwhereClause !== "") {
//                 SQLwhereClause += ` AND utr_number = '${utr_number}'`;
//             } else {
//                 SQLwhereClause = `WHERE utr_number = '${utr_number}'`;
//             }
//             params.utr_number = utr_number;
//         }
//         if(activationdate) {
//             if (SQLwhereClause !== "") {
//                 SQLwhereClause += ` AND activationdate = '${activationdate}'`;
//             } else {
//                 SQLwhereClause = `WHERE activationdate = '${activationdate}'`;
//             }
//             params.activationdate = activationdate;
//         }
//         const totalCountQuery =` SELECT COUNT(*) AS TotalCount FROM tb_license_requests LR ${SQLwhereClause}`;
//         console.log("Total Count Query:", totalCountQuery);
//         const resultTotalCount = await pool.request().query(totalCountQuery);
//         const totalCount = resultTotalCount.recordset[0].TotalCount;
//         console.log("Total Count:", totalCount);
    
//         const query = `
//           SELECT LR.*, LM.license_name, LH.name, PM.product_name
//           FROM (
//             SELECT *, ROW_NUMBER() OVER (ORDER BY recid) AS RowNum FROM tb_license_requests
//             ${SQLwhereClause} 
//           ) AS LR
//           LEFT JOIN tb_licensemaster AS LM ON LR.license_typeid = LM.license_typeid
//           LEFT JOIN tb_licenseholder AS LH ON LR.license_holderid = LH.license_holderid
//           LEFT JOIN tb_productmaster AS PM ON LR.product_id = PM.product_id
//           WHERE RowNum > ${(currentPage - 1) * perPage} AND RowNum <= ${(currentPage - 1) * perPage + perPage}`;
    
//         console.log("Query:", query);
    
//         const result = await pool.request().query(query);
//         const resultSet = result.recordset;
//         console.log("Result Set:", resultSet);
    
        


//     //     var query = `SELECT DISTINCT lr.*, lm.*, lh.*, pm.*
//     //     FROM tb_licenserequest lr
//     //     LEFT JOIN tb_licensemaster lm ON lr.license_typeid = lm.license_typeid
//     //     LEFT JOIN tb_licenseholder lh ON lr.license_holderid = lh.license_holderid 
//     //     LEFT JOIN tb_productmaster pm ON lr.product_id = pm.product_id 
//     //     ${SQLwhereClause}`;

        

//     //   var result = await pool
//     //     .request()
//     //     .input('branchname', sql.VarChar, params.branchname)
//     //     .input('clientname', sql.VarChar, params.clientname)
       
//     //     .query(query);
  
//     //   // result.recordset will have the result retrieved from the table
//     //   console.log("Query result:", result.recordset);

      
  
//       // Construct the response message
//       var response = {
//         message: "License Request fetched successfully",
//         Valid: true,
//         ResultSet: result.recordset
//       };
  
//       // Close the connection pool
//       await pool.close();
  
//       res.status(200).json([response]);
//     } catch (err) {
//       console.error("Error:", err);
//       var response = {
//         message: "License Requestlist not fetched",
//         Valid: false,
//       };
//       res.status(500).json([response]); // Internal server error
//     }
//   });

// //         const pool = await sql.connect(config);

// //         const totalCountQuery = `SELECT COUNT(*) AS TotalCount FROM tb_licenserequest ${whereClause}`;
// //         const resultTotalCount = await pool.request().query(totalCountQuery);
// //         const totalCount = resultTotalCount.recordset[0].TotalCount;

// //         const query = `
// //             SELECT * FROM (
// //                 SELECT *, ROW_NUMBER() OVER (ORDER BY recid) AS RowNum FROM tb_licenserequest
// //                 ${whereClause} 
// //             ) AS RowConstrainedResult
// //             WHERE RowNum > ${(currentPage - 1) * perPage} AND RowNum <= ${(currentPage - 1) * perPage + perPage}`;

// //         const result = await pool.request().query(query);
// //         const resultSet = result.recordset;

// //         const response = {
// //             message: "License request list fetched successfully",
// //             Valid: true,
// //             TotalCount: totalCount,
// //             ResultSet: resultSet
// //         };

// //         res.status(200).json(response);

// //     } catch (err) {
// //         console.error("Error fetching license requests:", err);
// //         res.status(500).json({ message: 'Error occurred while fetching license requests.' });
// //     }
// // });

// // Import necessary libraries and dependencies

// // Route to fetch modules
router.get('/getmodules', async (req, res) => {
    try {
        const pool = await sql.connect(config); // Connect to the database

        const selectedIds = req.query.ids; // Get selected user IDs from the request query params

        
        const whereClause = selectedIds.length > 0 ? `WHERE ld.requestid IN (${selectedIds.join(',')})` : '';

        const query = `
            SELECT m.ModuleName
            FROM tb_additional_modules m
            INNER JOIN tb_license_details ld ON m.ModuleID = ld.moduleid
            ${whereClause};
        `;

        // Execute the query
        const result = await pool.request().query(query);

        // Send modules as response
        res.status(200).json({ success: true, modules: result.recordset });

        // Close the connection pool
        await pool.close();
    } catch (error) {
        // Handle error
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
  // Get license request list endpoint
router.post("/GetLicenseRenewalList", async (req, res) => {
    try {
        const { searchQuery, currentPage, perPage, branchname, clientname, filename, uuid, invoicenumber, utr_number, activationdate,fromDate, toDate,status } = req.body;

        // Construct SQL WHERE clause to search across multiple fields
        let SQLwhereClause = `WHERE 1=1`; // Start with a true condition
        const params = {}; // Object to store parameters for SQL query
        
        // Add conditions for each field if it exists in the search query
        if (searchQuery) {
            SQLwhereClause += ` AND (
                filename LIKE '%${searchQuery}%' OR
                uuid LIKE '%${searchQuery}%' OR
                invoicenumber LIKE '%${searchQuery}%' OR
                utr_number LIKE '%${searchQuery}%' 
            )`;
        }

        // Add conditions for other filters if they exist
        if (branchname) {
            SQLwhereClause += ` AND branchname = @branchname`;
            params.branchname = branchname;
        }


        if (clientname) {
            SQLwhereClause += ` AND clientname = @clientname`;
            params.clientname = clientname;
        }
        if (status) {
            SQLwhereClause += ` AND status = @status`;
            params.status= status;
        }

        if (fromDate && toDate) {
            const fromDateSQL = fromDate.split('-').reverse().join('-');
            const toDateSQL = toDate.split('-').reverse().join('-');

            SQLwhereClause += SQLwhereClause ? ` AND activationdate >= CONVERT(DATETIME, '${fromDateSQL}', 103) AND activationdate <= CONVERT(DATETIME, '${toDateSQL}', 103)` :
                ` WHERE activationdate >= CONVERT(DATETIME, '${fromDateSQL}', 103) AND activationdate <= CONVERT(DATETIME, '${toDateSQL}', 103)`;

            params.fromDate = fromDate;
            params.toDate = toDate;
        }
        const query = `
            SELECT LR.*, LM.license_name, LH.name, PM.product_name
            FROM (
                SELECT *, ROW_NUMBER() OVER (ORDER BY recid) AS RowNum 
                FROM tb_license_renewal
                ${SQLwhereClause}
            ) AS LR
            LEFT JOIN tb_licensemaster AS LM ON LR.license_typeid = LM.license_typeid
            LEFT JOIN tb_licenseholder AS LH ON LR.license_holderid = LH.license_holderid
            LEFT JOIN tb_productmaster AS PM ON LR.product_id = PM.product_id
            WHERE RowNum > ${(currentPage - 1) * perPage} AND RowNum <= ${(currentPage - 1) * perPage + perPage}`;

        // Execute the query with parameters
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('clientname', sql.VarChar, params.clientname)
            .input('branchname', sql.VarChar, params.branchname)
            
          
            .input('status', sql.VarChar, params.status)
            // Add inputs for other parameters similarly
            .query(query);

        // Process the result and send response
        const resultSet = result.recordset;

        const response = {
            message: "License Renewal fetched successfully",
            Valid: true,
            ResultSet: resultSet
        };

        res.status(200).json([response]);
    } catch (err) {
        console.error("Error:", err);
        var response = {
            message: "License Renewallist not fetched",
            Valid: false,
        };
        res.status(500).json([response]); // Internal server error
    }
});

module.exports = router;
