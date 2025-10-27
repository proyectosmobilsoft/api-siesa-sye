const sql = require('mssql');
const { db: dbConfig } = require('../config/env');

let pool;

async function getPool() {
  if (pool) return pool;

  try {
    pool = await sql.connect({
      user: dbConfig.user,
      password: dbConfig.password,
      server: dbConfig.host,
      database: dbConfig.database,
      port: dbConfig.port ? Number(dbConfig.port) : 1433,
      options: {
        encrypt: false, // usa true si el servidor requiere SSL
        trustServerCertificate: true, // para entornos locales
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
    });
    console.log('✅ SQL Server pool created');
    return pool;
  } catch (err) {
    console.error('❌ Error connecting to SQL Server:', err);
    throw err;
  }
}

module.exports = { getPool };

