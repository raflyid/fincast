import mysql from "mysql2/promise";

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }, // wajib untuk Railway/PlanetScale
    waitForConnections: true,
    connectionLimit: 5, // rendah karena serverless
    connectTimeout: 10000,
});

export default pool;
