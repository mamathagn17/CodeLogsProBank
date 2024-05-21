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
        res.status(200).json({ message: 'Error occurred while fetching clients.' });
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
//             SQLwhereClause = WHERE Branchname = '${branchname}';
//         }

//         if (clientname) {
//             if (SQLwhereClause !== "") {
//                 SQLwhereClause += ` AND Clientname = '${clientname}'`;
//             } else {
//                 SQLwhereClause = WHERE Clientname = '${clientname}';
//             }
//             params.clientname = clientname;
//         }
//         if (filename) {
//             if (SQLwhereClause !== "") {
//                 SQLwhereClause += ` AND Filename = '${filename}'`;
//             } else {
//                 SQLwhereClause = WHERE Filename = '${filename}';
//             }
//             params.filename = filename;
//         }
//         if(uuid) {
//             if (SQLwhereClause !== "") {
//                 SQLwhereClause += ` AND uuid = '${uuid}'`;
//             } else {
//                 SQLwhereClause = WHERE uuid = '${uuid}';
//             }
//             params.uuid = uuid;
//         }
//         if(invoicenumber) {
//             if (SQLwhereClause !== "") {
//                 SQLwhereClause += ` AND invoicenumber = '${invoicenumber}'`;
//             } else {
//                 SQLwhereClause = WHERE invoicenumber = '${invoicenumber}';
//             }
//             params.invoicenumber = invoicenumber;
//         }
//         if(utr_number) {
//             if (SQLwhereClause !== "") {
//                 SQLwhereClause += ` AND utr_number = '${utr_number}'`;
//             } else {
//                 SQLwhereClause = WHERE utr_number = '${utr_number}';
//             }
//             params.utr_number = utr_number;
//         }
//         if(activationdate) {
//             if (SQLwhereClause !== "") {
//                 SQLwhereClause += ` AND activationdate = '${activationdate}'`;
//             } else {
//                 SQLwhereClause = WHERE activationdate = '${activationdate}';
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
    
        


//     //     var query = `SELECT DISTINCT lr., lm., lh., pm.
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

// //         const totalCountQuery = SELECT COUNT(*) AS TotalCount FROM tb_licenserequest ${whereClause};
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

        
        const whereClause = selectedIds.length > 0 ? `WHERE ld.requestid IN (${selectedIds.join(',')}) `: '';

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
        res.status(200).json({ success: false, message: 'Internal server error' });
    }
});
  // Get license request list endpoint
router.post("/GetLicenseRequestList", async (req, res) => {
    try {
        const { searchQuery, currentPage, perPage, branchname, clientname, filename, uuid, invoicenumber, utr_number, activationdate,fromDate, toDate,status } = req.body;

        
        let SQLwhereClause = `WHERE 1=1`; 
        const params = {}; 
        
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
            params.status = status;
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
                FROM tb_license_requests
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
            message: "License Request fetched successfully",
            Valid: true,
            ResultSet: resultSet
        };

        res.status(200).json([response]);
    } catch (err) {
        console.error("Error:", err);
        var response = {
            message: "License Requestlist not fetched",
            Valid: false,
        };
        res.status(200).json([response]); // Internal server error
    }
});

router.post("/GetLicenseRenewalList", async (req, res) => {
    try {
        const { searchQuery, currentPage, perPage, branchname, clientname, filename, uuid, invoicenumber, utr_number, activationdate,fromDate, toDate,status } = req.body;


        let SQLwhereClause =` WHERE 1=1 AND renewal_status = 2`; // Added condition for pending_status
        const params = {};
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
            params.status = status;
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
            FROM tb_license_requests
            ${SQLwhereClause}
        ) AS LR
        LEFT JOIN tb_licensemaster AS LM ON LR.license_typeid = LM.license_typeid
        LEFT JOIN tb_licenseholder AS LH ON LR.license_holderid = LH.license_holderid
        LEFT JOIN tb_productmaster AS PM ON LR.product_id = PM.product_id
        WHERE RowNum > ${(currentPage - 1) * perPage} AND RowNum <= ${(currentPage - 1) * perPage + perPage}`;

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
        res.status(200).json([response]); // Internal server error
    }
});


router.post("/MarkAsApprove", async (req, res) => {
    try {
        const { recIds } = req.body;

       
        const recidsString = recIds.join(',');

        // Update the pending_status of the selected records to 1 (pending)
        const query =` UPDATE tb_license_requests SET status = 0 WHERE recid IN (${recidsString})`;

        const pool = await sql.connect(config);
        await pool.request().query(query);

        res.status(200).json({ Success: true });
    } catch (err) {
        console.error("Error:", err);
        res.status(200).json({ message: "Error marking records as Approval" });
    }
});

  



router.post("/MarkAsApproveRenewal", async (req, res) => {
    try {
        const { recIds } = req.body;

       
        const recidsString = recIds.join(',');

        // Update the pending_status of the selected records to 1 (pending)
        const query =` UPDATE tb_license_requests SET renewal_status = 0 WHERE recid IN (${recidsString})`;

        const pool = await sql.connect(config);
        await pool.request().query(query);

        res.status(200).json({ Success: true });
    } catch (err) {
        console.error("Error:", err);
        res.status(200).json({ message: "Error marking records as Approval" });
    }
});
router.post("/MarkAsReject", async (req, res) => {
    try {
        const { recIds } = req.body;

       
        const recidsString = recIds.join(',');

       
        const query =` UPDATE tb_license_requests SET status = 2 WHERE recid IN (${recidsString})`;

        const pool = await sql.connect(config);
        await pool.request().query(query);

        res.status(200).json({ Success: true });
    } catch (err) {
        console.error("Error:", err);
        res.status(200).json({ message: "Error marking records as Reject" });
    }
});

router.post("/MarkAsPendingRenewal", async (req, res) => {
    try {
        const { recIds } = req.body;

       
        const recidsString = recIds.join(',');

       
        const query = `UPDATE tb_license_requests SET renewal_status = 2 WHERE recid IN (${recidsString})`;

        const pool = await sql.connect(config);
        await pool.request().query(query);

        res.status(200).json({ Success: true });
    } catch (err) {
        console.error("Error:", err);
        res.status(200).json({ message: "Error marking records as Reject" });
    }
});



router.post('/LogLicenseRequestAction', async (req, res) => {
    
    const { userInfo, recIds, action } = req.body;
  
    console.log(userInfo);

  
  const { user_id, user_name } = userInfo;
  const request_datetime = new Date();
  
    try {
     
      const pool = await sql.connect(config);
  
      for (const recId of recIds) {
       
        const query = `
            INSERT INTO tb_licenserequestlogs (user_id, user_name, recid, request_datetime, action)
            VALUES (@user_id, @user_name, @recid, GETDATE(), @action)
        `;

        await pool.request()
            .input('user_id', sql.Int, user_id)
            .input('user_name', sql.VarChar, user_name)
            .input('recid', sql.Int, recId)
            .input('request_datetime', sql.DateTime,request_datetime)
            .input('action', sql.VarChar, action)
            .query(query);
    }
  
     
      res.json({ success: true, message: 'License request action logged successfully.' });
    } catch (error) {
      
      console.error('Error:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    } finally {
     
      await sql.close();
    }
  });



  


router.post("/licenserequestloginlogs", async (req, res) => {
    try {
      var pool = await sql.connect(config); // Connect to the database
      console.log(req.body);
      console.log("Connected to SQL Server");
  
      
      var { currentPage, perPage } = req.body;
  
     
      const totalCountQuery =`SELECT COUNT(*) AS TotalCount FROM tb_licenserequestlogs`;
      console.log("Total Count Query:", totalCountQuery);
      const resultTotalCount = await pool.request().query(totalCountQuery);
      const totalCount = resultTotalCount.recordset[0].TotalCount;
      console.log("Total Count:", totalCount);
  
      const query = `SELECT *
      FROM (
          SELECT *, ROW_NUMBER() OVER (ORDER BY user_id) AS RowNum
          FROM tb_licenserequestlogs
      ) AS UserWithRowNum
      WHERE RowNum BETWEEN ${(currentPage - 1) * perPage + 1} AND ${currentPage * perPage}
      ORDER BY user_id;
      `;
  
     
  
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


  router.post("/UpdateField", async (req, res) => {
    try {
        const { requestId, fieldName, updatedValue } = req.body;

        let query;
        switch (fieldName) {
      
        
            case 'remarks':
                query = `UPDATE tb_license_requests SET remarks = @updatedValue WHERE recid = @recid`;
                break;
            default:
                return res.status(400).json({ message: "Invalid field name" });
        }

        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('recid', sql.Int, requestId)
            .input('updatedValue', sql.VarChar, updatedValue)
            .query(query);

        res.status(200).json({ Success: true });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ message: "Error updating field" });
    }
});
  

const crypto = require('crypto');
const fs = require('fs');
//const { parseISO, addMonths, differenceInMonths, getMonth, getYear } = require('date-fns');
router.post("/GenerateFile", async (req, res) => {
    try {
        const RecID = req.body.recIds[0];

                const pool = await sql.connect(config);
                const result = await pool.request()
                .input('recid', sql.Int, RecID)
                .query(`select clientname, branchname, license_typeid, uuid, convert(varchar, activationdate, 105) as activationdate,
                convert(varchar, expirydate, 105) as expirydate,CONVERT(varchar,activationdate,20) as active,CONVERT(varchar,expirydate,20) as expiry, entrydate, userid, license_holderid, invoicenumber, utr_number,
                client_id, branch_id, remarks, product_id, renewal_status, additionalModule from tb_license_requests where RecID = @recid`);
        
                const record = result.recordset[0];

        if (record) {
            clientname = record.clientname;
            branchname = record.branchname;
            license_typeid = record.license_typeid;
            uuid = record.uuid;
            activationdate = record.activationdate;
            TerminalDate = record.expirydate;
            entrydate = record.entrydate;
            userid = record.userid;
            license_holderid = record.license_holderid;
            invoicenumber = record.invoicenumber;
            utr_number = record.utr_number;
            client_id = record.client_id;
            branch_id = record.branch_id;
            remarks = record.remarks;
            product_id = record.product_id;
            renewal_status = record.renewal_status;
            additionalModule = record.additionalModule;
            expiry=record.expiry;
            active=record.active;

        //    const param2Value='';
        //    const csResult = await pool.request()
      //  .input('requestID', sql.Int, RecID)
       // .input('SqlString', sql.VarChar, param2Value)
      //  .execute('DynamicJsonForTreeMenu_LICENSE');

           // const s = csResult.output;

            const request = pool.request()
            .input('requestID', sql.Int, RecID)
            .output('SqlString', sql.VarChar(sql.MAX)); // Adjust the data type if necessary

        // Execute the stored procedure
        const result = await request.execute('DynamicJsonForTreeMenu_LICENSE');

        // Get the output parameter value
        const s = result.output.SqlString;
    
            const jsonObject = {
                clientname: clientname,
                BranchName: branchname,
                ActivationDate: activationdate,
                MACID: uuid,
                LicenceType: license_typeid,
                TerminalDate:TerminalDate,
                RecID: RecID,
                GracePeriod: 45,
                WarningMessage: "Your License has expired, Request you to renew the same to avoid deactivation.",
                TerminationMessage: "Your software will be discontinued soon. Kindly request for a renewal to avoid termination.",
                TerminationPeriod: 15,
                userid,
                license_holderid:license_holderid,
                invoicenumber,
                utr_number,
                client_id,
                branch_id,
                remarks,
                product_id,
                entrydate,
                renewal_status,
                additionalModule
            };
    
            // Constructing Menu JSONArray
            jsonObject.Menu = JSON.parse(s);

            const IV = "20f92fa82d3305b2";
            const AES_Key = "e36581506fde7939670430d04d8d7242";
            const encrypted_file_Content = encryptAES256AndBase64(AES_Key, IV, '['+JSON.stringify(jsonObject)+']');
            const branch_code = clientname;
            const client_code = branchname;
            const FileName = `${RecID}_${branch_code}${client_code}.txt`;
            const filePath = `D:\\Code\\${FileName}`;
            fs.writeFileSync(filePath, encrypted_file_Content);

            const currentTime = new Date();
            const time = currentTime.getTime();

            // INSERTION INTO MONTHLY RECONCILIATION
            if (license_typeid === 2) {
                const startDate = parseISO(active);
                const endDate = parseISO(expiry);
                const totalMonths = differenceInMonths(endDate, startDate)+1;

                for (let i = 0; i < totalMonths; i++) {
                    const nextMonthDate = addMonths(startDate, i);
            const month = getMonth(nextMonthDate) + 1; // getMonth returns 0-based month, so add 1
            const year = getYear(nextMonthDate);
                   // const nextMonthDate = startDate.plusMonths(i);
                    //const month = nextMonthDate.monthValue();
                   // const year = nextMonthDate.year();

                    const s1 = `select rec_id from TB_monthlyReconciliation where client_id = ${client_id} and branch_id = ${branch_id} and year = ${year} and month = ${month} and License_id= ${RecID}`;
                    const rs1 = await pool.request().query(s1);
                    const IsEmpty = rs1.recordset.length === 0;

                    if (IsEmpty) {
                        const Insert_into_Monthly = `INSERT INTO tb_monthlyreconciliation(client_id, branch_id, license_id, year, month) 
                            VALUES (${client_id}, ${branch_id}, ${RecID}, ${year}, ${month})`;
                        await pool.request().query(Insert_into_Monthly);
                    }
                }

                const cumulative_Year = `${getYear(startDate)}-${getYear(endDate)}`;
                const s1 = `select recid from tb_annualreconciliation where client_id = ${client_id} and branch_id = ${branch_id} and License_id=${RecID}`;
                const rs1 = await pool.request().query(s1);
                const IsEmpty = rs1.recordset.length === 0;

                if (IsEmpty) {
                    const Insert_into_Monthly = `INSERT INTO tb_annualreconciliation(client_id, branch_id, license_id, year) 
                        VALUES (${client_id}, ${branch_id}, ${RecID}, '${cumulative_Year}')`;
                    await pool.request().query(Insert_into_Monthly);
                } else {
                    const sqlVARRLupdate = `UPDATE tb_annualreconciliation SET year = '${cumulative_Year}' WHERE client_id = ${client_id} and branch_id = ${branch_id}`;
                    await pool.request().query(sqlVARRLupdate);
                }
            }

            const sqlVARRLupdate = `UPDATE tb_license_requests SET filename = @FileName, filegenerateddate = @time, status = 1 WHERE RecId = @recid`;
            await pool.request()
                .input('FileName', sql.NVarChar, FileName)
                .input('time', sql.DateTime, new Date(time))
                .input('recid', sql.Int, RecID)
                .query(sqlVARRLupdate);

            await pool.close();
            
        } else {
           
        }
                res.status(200).json({ Success: true });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ message: "Error updating field" });
    }
});

function encryptAES256AndBase64(encryptionKey, iv, jsonBody) {
    try {
        // Create a Cipher instance using AES-256-CBC with PKCS5 padding
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'utf-8'), Buffer.from(iv, 'utf-8'));

        // Encrypt the jsonBody
        let encrypted = cipher.update(jsonBody, 'utf-8', 'base64');
        encrypted += cipher.final('base64');

        return encrypted;
    } catch (err) {
        throw new Error(err.message);
    }
}

module.exports = router;