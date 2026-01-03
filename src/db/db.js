const sql = require('mssql');
const { db: dbConfig, db2: db2Config } = require('../config/env');
const q = require('q');

// Pool para la base de datos principal
let pool;

function getPool2() {
  const deferred = q.defer();
  const config = {
    user: db2Config.user,
    password: db2Config.password,
    server: db2Config.host,
    database: db2Config.database,
    port: db2Config.port,
    pool: {
      max: 100,
      min: 0,
      idleTimeoutMillis: 30000
    },
    connectionTimeout: 30000,
    requestTimeout: 120000,
    options: {
      encrypt: false,
      requestTimeout: 120000
    }
  };

  const pool = new sql.ConnectionPool(config, errorConnect => {
    if (errorConnect) {
      deferred.reject({
        message: 'Error al conectar con la base de datos secundaria',
        description: 'Error al establecer conexion con la base de datos secundaria',
        error: errorConnect
      });
    } else {
      deferred.resolve(pool);
    }
  });

  return deferred.promise;
}

/**
 * Obtiene el pool de conexión de la base de datos principal
 * @returns {Promise<sql.ConnectionPool>}
 */
async function getPool() {
  if (pool && pool.connected) return pool;

  try {
    // Crear un ConnectionPool explícito para asegurar que es independiente
    pool = new sql.ConnectionPool({
      user: dbConfig.user,
      password: dbConfig.password,
      server: dbConfig.host,
      database: dbConfig.database,
      port: dbConfig.port ? Number(dbConfig.port) : 1433,
      options: {
        encrypt: dbConfig.encrypt !== undefined ? dbConfig.encrypt : false,
        trustServerCertificate: dbConfig.trustServerCertificate !== undefined ? dbConfig.trustServerCertificate : true,
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

    // Conectar el pool explícitamente
    await pool.connect();
    console.log('✅ SQL Server pool created (Primary DB)');
    return pool;
  } catch (err) {
    console.error('❌ Error connecting to SQL Server (Primary DB):', {
      message: err.message,
      code: err.code,
      originalError: err.originalError,
      stack: err.stack
    });
    throw err;
  }
}

module.exports = { getPool, getPool2 };
