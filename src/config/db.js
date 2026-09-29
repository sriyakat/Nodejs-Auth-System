
const sql = require("mssql");
require("dotenv").config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: Number(process.env.DB_PORT),
    options: {
        encrypt: false,
        trustServerCertificate: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Reusable connection pool
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log("SQL Server connected successsfully");
        return pool;
    })
    .catch(error => {
        console.error("Database connection failed");
        throw error;
    });

    
module.exports = { sql, poolPromise };