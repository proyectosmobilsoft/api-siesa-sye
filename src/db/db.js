const sql = require('mssql');
const { db: dbConfig, db2: db2Config } = require('../config/env');

// Pool para la base de datos principal
let pool;

// Pool para la segunda base de datos
let pool2;

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

/**
 * Obtiene el pool de conexión de la segunda base de datos
 * @returns {Promise<sql.ConnectionPool>}
 */
async function getPool2() {
  if (pool2 && pool2.connected) {
    console.log('🔍 getPool2: Reutilizando pool existente de BD2');
    return pool2;
  }

  // Verificar el formato del host (debería ser SERVERHP\CLIENTES después de leer el JSON)
  const hostValue = db2Config.host;
  console.log('🔍 getPool2: Creando nuevo pool para BD2 con configuración:', {
    server: hostValue,
    serverType: typeof hostValue,
    serverLength: hostValue ? hostValue.length : 0,
    hasBackslash: hostValue ? hostValue.includes('\\') : false,
    database: db2Config.database,
    user: db2Config.user,
    port: db2Config.port,
    encrypt: db2Config.encrypt,
    trustServerCertificate: db2Config.trustServerCertificate
  });

  try {
    // Crear un ConnectionPool explícito para asegurar que es independiente
    // Si el host contiene '\', es una instancia nombrada y no debemos especificar el puerto
    const isNamedInstance = hostValue && hostValue.includes('\\');
    console.log(`🔍 Instancia nombrada detectada: ${isNamedInstance}`);
    
    const connectionConfig = {
      user: db2Config.user,
      password: db2Config.password,
      server: hostValue, // Usar el valor tal como viene del config
      database: db2Config.database,
      options: {
        encrypt: db2Config.encrypt !== undefined ? db2Config.encrypt : false,
        trustServerCertificate: db2Config.trustServerCertificate !== undefined ? db2Config.trustServerCertificate : true,
        requestTimeout: 120000, // Timeout de 120 segundos para consultas complejas
        enableArithAbort: true, // Mejora el rendimiento
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
        acquireTimeoutMillis: 60000, // Timeout para adquirir conexión
      },
      connectionTimeout: 60000 // Aumentar timeout para instancias nombradas
    };
    
    // Para instancias nombradas, SQL Server necesita el Browser Service para encontrar el puerto
    // Si el Browser Service no está disponible, podemos intentar con el puerto explícito
    if (isNamedInstance) {
      console.log(`🔍 Instancia nombrada detectada: ${hostValue}`);
      console.log(`🔍 Intentando conexión sin puerto (requiere SQL Server Browser Service)`);
      // Para instancias nombradas, no especificamos puerto - SQL Server lo encuentra automáticamente
      // Si esto falla, el usuario puede usar formato IP:PUERTO o IP\INSTANCIA
    } else if (db2Config.port) {
      connectionConfig.port = Number(db2Config.port);
      console.log(`🔍 Usando puerto explícito: ${connectionConfig.port}`);
    }
    
    pool2 = new sql.ConnectionPool(connectionConfig);

    // Conectar el pool explícitamente
    await pool2.connect();
    
    // Verificar la base de datos conectada
    const dbCheckResult = await pool2.request().query('SELECT DB_NAME() AS CurrentDatabase');
    const currentDb = dbCheckResult.recordset[0]?.CurrentDatabase;
    
    console.log('✅ SQL Server pool created (Secondary DB):', {
      server: db2Config.host,
      database: db2Config.database,
      connectedTo: currentDb,
      expected: db2Config.database
    });
    
    if (currentDb !== db2Config.database) {
      console.error('❌ ADVERTENCIA: El pool se conectó a una BD diferente!');
      console.error(`   Esperada: ${db2Config.database}`);
      console.error(`   Actual: ${currentDb}`);
    }
    
    return pool2;
  } catch (err) {
    console.error('❌ Error connecting to SQL Server (Secondary DB):', {
      message: err.message,
      code: err.code,
      originalError: err.originalError,
      stack: err.stack
    });
    
    // Mensaje más descriptivo para instancias nombradas
    if (hostValue && hostValue.includes('\\')) {
      console.error('\n💡 SOLUCIÓN SUGERIDA para instancias nombradas:');
      console.error('   Las instancias nombradas requieren el SQL Server Browser Service (puerto UDP 1434)');
      console.error('   Si el Browser Service no está disponible, intenta:');
      console.error('   1. Usar la IP del servidor: "IP\\CLIENTES" (ej: "192.168.1.100\\CLIENTES")');
      console.error('   2. Usar IP con puerto explícito: "IP:PUERTO" (ej: "192.168.1.100:1433")');
      console.error('   3. Verificar que el SQL Server Browser Service esté corriendo en el servidor');
    }
    
    throw err;
  }
}

module.exports = { getPool, getPool2 };

