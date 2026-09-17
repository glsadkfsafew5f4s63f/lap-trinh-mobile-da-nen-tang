const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'AppBanQuanAo',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  charset: 'utf8mb4',
});

async function checkDatabase() {
  const connection = await pool.getConnection();
  try {
    await connection.query('SELECT 1 AS ok');
  } finally {
    connection.release();
  }
}

module.exports = { pool, checkDatabase };
