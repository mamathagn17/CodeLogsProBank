const express = require('express');
const router = express.Router();
const sql = require('mssql');
const config = require('../config/db');

router.post("/fetchlicense", async (req, res) => {
  try {
    const { currentPage, perPage } = req.body;

    // Connect to the database
    const pool = await new sql.ConnectionPool(config).connect();
  
    const totalCountQuery = `SELECT COUNT(*) AS TotalCount FROM tb_licensemaster`;
    const resultTotalCount = await pool.request().query(totalCountQuery);
    const totalCount = resultTotalCount.recordset[0].TotalCount;

    const query = `
      SELECT l.license_typeid, l.license_name, c.product_name, l.license_description, l.license_cost
      FROM (
        SELECT *, ROW_NUMBER() OVER (ORDER BY license_typeid) AS RowNum
        FROM tb_licensemaster
      ) AS l
      INNER JOIN tb_productmaster AS c ON l.product_id = c.product_id
      WHERE RowNum > ${(currentPage - 1) * perPage}
      AND RowNum <= ${(currentPage - 1) * perPage + perPage}
    `;

    const result = await pool.request().query(query);
    const resultSet = result.recordset;

    const response = {
      message: "License list fetched successfully",
      Valid: true,
      TotalCount: totalCount,
      ResultSet: resultSet
    };

    res.status(200).json(response);

    // Close the connection pool
    await pool.close();
  } catch (err) {
    console.error("Error:", err);
    const response = {
      message: "License list not fetched",
      Valid: false,
    };
    res.status(500).json(response);
  }
});

router.get('/fetchproducts', async (req, res) => {
  try {
    // Connect to the database
    const pool = await new sql.ConnectionPool(config).connect();
  
    const result = await pool.request().query('SELECT * FROM tb_productmaster');
    const products = result.recordset;

    // Close the connection pool
    await pool.close();

    res.status(200).json({ products });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error occurred while fetching products.' });
  }
});

router.post("/addlicensetype", async (req, res) => {
  try {
    console.log("Received data:", req.body);

    // Connect to the database
    const pool = await new sql.ConnectionPool(config).connect();
    console.log("Connected to SQL Server");

    const { license_name, product_id, license_description, license_cost } = req.body;

    const checklicense = `SELECT COUNT(license_typeid) as count FROM tb_licensemaster WHERE license_name = @license_name `;
    const checklicenseResult = await pool.request()
      .input('license_name', sql.VarChar, license_name)
      .query(checklicense);

    const existinglicenseCount = checklicenseResult.recordset[0].count;

    if (existinglicenseCount > 0) {
      const response = {
        message: "License with the provided License Name already exists",
        Valid: false
      };
      return res.status(200).json(response);
    }

    const query = `INSERT INTO tb_licensemaster (license_name, product_id, license_description, license_cost) VALUES (@license_name, @product_id, @license_description, @license_cost)`;

    const result = await pool.request()
      .input('license_name', sql.VarChar, license_name)
      .input('product_id', sql.Int, product_id)
      .input('license_description', sql.VarChar, license_description)
      .input('license_cost', sql.VarChar, license_cost)
      .query(query);

    console.log("Query result:", result);

    const response = {
      message: "License Type added successfully",
      Valid: true
    };

    res.status(200).json(response);

    // Close the connection pool
    await pool.close();
  } catch (err) {
    console.error("Error:", err);
    const response = {
      message: "License Type not added ",
      Valid: false
    };
    res.status(500).json(response);
  }
});

module.exports = router;
