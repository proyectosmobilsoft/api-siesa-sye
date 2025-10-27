const mysql = require('mysql2/promise');
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = require('../config/env');

let pool;

async function connectDB() {
  try {
    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Test connection
    const connection = await pool.getConnection();
    console.log('🔌 Database connection pool created');
    connection.release();

    return pool;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    throw error;
  }
}

function getPool() {
  return pool;
}

module.exports = {
  connectDB,
  getPool,
};

