const express = require("express");
const sql = require("mssql");
const authRoute = require("./routes/auth");
const vendorRoute = require("./routes/vendor");
const addvendorRoute=require("./routes/addvendor");
const termmsgRoute=require("./routes/termination");
const licensereqRoute=require("./routes/Licenserequest");
const licenserenewalRoute=require("./routes/licenserenewal");
const userlistRoute=require("./routes/userlist");
const clientcategoryRoute =require("./routes/clientcategoryconfiguration");
const clientcategoriesRoute=require("./routes/clientcategories");
const productconfigRoute=require("./routes/productconfig");
const licensemasterRoute =require("./routes/licensemaster");
const branchRoute =require("./routes/branch");
const messageRoute=require("./routes/message");
const roleRoute=require("./routes/rolecreation");
const monthlyRoute=require("./routes/monthlyreconciliation");
const adduserRoute=require("./routes/adduser")
const annualRoute=require("./routes/annualreconciliation");
const permissionRoute=require("./routes/permission");

const cors = require("cors");


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const config = {
  user: "sa",
  password: "mccsu",
  server: "LAPTOP-CS4PS8GH",
  database: "E_coreLicensing",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

app.get("/", (req, res) => {
  res.send("Server connected");
});

sql
  .connect(config)
  .then(() => console.log("Database connected!"))
  .catch((err) => console.log("Database connection error:", err));

app.use("/api/auth", authRoute);
app.use("/api/vendor", vendorRoute); 
app.use("/api/addvendor",addvendorRoute);
app.use("/api/termination",termmsgRoute);
app.use("/api/Licenserequest",licensereqRoute);
app.use("/api/userlist",userlistRoute);
app.use("/api/clientcategoryconfiguration",clientcategoryRoute);
app.use("/api/clienCategories",clientcategoriesRoute);
app.use("/api/productconfig",productconfigRoute);
app.use("/api/licensemaster",licensemasterRoute);
app.use("/api/branch",branchRoute);
app.use("/api/message",messageRoute);
app.use("/api/rolecreation",roleRoute);
app.use("/api/licenserenewal",licenserenewalRoute);
app.use("/api/monthlyreconciliation",monthlyRoute);
app.use("/api/annualreconciliation",annualRoute);
app.use("/api/adduser",adduserRoute);
app.use("/api/permission",permissionRoute);

const PORT = process.env.PORT ||3000;

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
