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
        requestTimeout: 120000, // Timeout de 120 segundos para consultas complejas
        enableArithAbort: true, // Mejora el rendimiento
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
        acquireTimeoutMillis: 60000, // Timeout para adquirir conexión
      },
      connectionTimeout: 30000 // Timeout de conexión inicial
    });
    console.log('✅ SQL Server pool created');
    return pool;
  } catch (err) {
    console.error('❌ Error connecting to SQL Server:', {
      message: err.message,
      code: err.code,
      originalError: err.originalError,
      stack: err.stack
    });
    throw err;
  }
}

module.exports = { getPool };

