module.exports = {
    user: "sa",
    password: "mccsu",
    server: "LAPTOP-CS4PS8GH", // You can use an IP address or 'localhost' if SQL Server is on the same machine
    database: "E_coreLicensing",
    options: {
      encrypt: false, // Use this if you're on Windows Azure
      trustServerCertificate: true, // Use this if you're on Windows Azure
    },
}