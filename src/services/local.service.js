const { getPool2 } = require('../db/db');

/**
 * Ejemplo de servicio que usa la segunda base de datos
 * Adapta este servicio según tus necesidades específicas
 */

/**
 * Lista los procedimientos almacenados disponibles que contengan un término de búsqueda
 * @param {string} searchTerm - Término de búsqueda (ej: 'LineDiscount', 'Discount')
 * @returns {Promise<Array>}
 */
async function listStoredProcedures(searchTerm = '') {
  // Verificar que estamos usando la BD2 correcta leyendo la configuración
  const { db2: db2Config } = require('../config/env');
  console.log('🔍 listStoredProcedures usando BD2:', {
    server: db2Config.host,
    database: db2Config.database,
    user: db2Config.user,
    port: db2Config.port
  });
  
  // Asegurar que se usa getPool2() para la BD2
  let pool;
  try {
    pool = await getPool2();
  } catch (connectionError) {
    console.error('❌ Error conectando a BD2 en listStoredProcedures:', connectionError);
    throw new Error(`No se pudo conectar a la base de datos BD2 (${db2Config.host}/${db2Config.database}): ${connectionError.message}`);
  }
  
  const request = pool.request();
  request.timeout = 30000;

  const query = `
    SELECT 
      ROUTINE_SCHEMA,
      ROUTINE_NAME,
      ROUTINE_TYPE
    FROM INFORMATION_SCHEMA.ROUTINES
    WHERE ROUTINE_TYPE = 'PROCEDURE'
      AND ROUTINE_NAME LIKE @searchTerm
    ORDER BY ROUTINE_NAME
  `;

  request.input('searchTerm', require('mssql').VarChar, `%${searchTerm}%`);

  try {
    // Verificar explícitamente la base de datos actual antes de ejecutar la consulta
    const dbCheckQuery = `SELECT DB_NAME() AS CurrentDatabase`;
    const dbCheckResult = await pool.request().query(dbCheckQuery);
    const currentDb = dbCheckResult.recordset[0]?.CurrentDatabase;
    console.log(`🔍 Base de datos actual para listStoredProcedures: ${currentDb} (debería ser: ${db2Config.database})`);
    
    if (currentDb !== db2Config.database) {
      console.error(`❌ ERROR: La consulta se está ejecutando en la BD incorrecta!`);
      console.error(`   Esperada: ${db2Config.database}`);
      console.error(`   Actual: ${currentDb}`);
      throw new Error(`La conexión está apuntando a la base de datos incorrecta. Esperada: ${db2Config.database}, Actual: ${currentDb}`);
    }
    
    const result = await request.query(query);
    console.log(`✅ listStoredProcedures encontró ${result.recordset.length} procedimiento(s) en BD2 (${currentDb})`);
    return result.recordset;
  } catch (err) {
    console.error('❌ Error listando procedimientos almacenados en BD2:', err);
    // Propagar el error en lugar de devolver un array vacío
    throw err;
  }
}

/**
 * Función auxiliar para ejecutar un procedimiento almacenado con manejo de errores mejorado
 * @param {object} request - Request object de mssql
 * @param {string} procedureName - Nombre del procedimiento almacenado
 * @returns {Promise<object>}
 */
async function executeStoredProcedure(request, procedureName) {
  // Intentar diferentes variaciones del nombre del procedimiento
  // El procedimiento se llama getAllLineDiscount
  const variations = [
    `${procedureName}`,  // Con corchetes y schema dbo (formato SQL Server) - PRIMER INTENTO
    `${procedureName}`,      // Con schema dbo sin corchetes
    procedureName,                // Sin schema
  ];

  let lastError = null;
  for (const variation of variations) {
    try {
      const result = await request.execute(variation);
      return result;
    } catch (err) {
      lastError = err;
      // Si no es el último intento, continuar con la siguiente variación
      if (variation !== variations[variations.length - 1]) {
        continue;
      }
    }
  }

  // Si todos los intentos fallaron, listar procedimientos disponibles similares
  const availableProcedures = await listStoredProcedures('Discount');
  const procedureNames = availableProcedures.map(p => `${p.ROUTINE_SCHEMA}.${p.ROUTINE_NAME}`).join(', ');
  
  const errorMessage = `No se pudo ejecutar el procedimiento almacenado '${procedureName}'. ` +
    `Intentado: ${variations.join(', ')}. ` +
    (procedureNames ? `Procedimientos disponibles similares: ${procedureNames}` : 'No se encontraron procedimientos similares.') +
    ` Error: ${lastError?.message || 'Unknown error'}`;
  
  throw new Error(errorMessage);
}

/**
 * Obtiene datos ejecutando el procedimiento almacenado getAllLineDiscount o una consulta directa como fallback
 * @param {number} limit - Límite de registros
 * @param {number} offset - Offset para paginación
 * @returns {Promise<Array>}
 */
async function getDataFromSecondaryDB(limit = 100, offset = 0) {
  const pool = await getPool2();
  const request = pool.request();
  request.timeout = 120000;
  // Nota: No agregamos parámetros limit/offset aquí porque el procedimiento almacenado
  // puede no aceptarlos. Si el procedimiento los requiere, se agregarán después.

  // Primero verificar si el procedimiento existe
  let procedureExists = false;
  let availableProcedures = [];
  
  try {
    // Listar procedimientos que contengan "LineDiscount" o "Discount"
    availableProcedures = await listStoredProcedures('LineDiscount');
    if (availableProcedures.length === 0) {
      availableProcedures = await listStoredProcedures('Discount');
    }
    
    // Verificar si existe getAllLineDiscount
    procedureExists = availableProcedures.some(
      p => p.ROUTINE_NAME.toLowerCase() === 'getalllinediscount' || 
           p.ROUTINE_NAME === 'getAllLineDiscount'
    );
  } catch (listErr) {
    console.warn('No se pudo listar procedimientos:', listErr.message);
  }

  // Intentar ejecutar el procedimiento
  try {
    // Intentar primero con dbo.getAllLineDiscount (schema explícito)
    console.log('🔍 Intentando ejecutar dbo.getAllLineDiscount...');
    const result = await request.execute('dbo.getAllLineDiscount');
    const allRecords = result.recordset || [];
    console.log(`✅ Procedimiento ejecutado exitosamente. Registros retornados: ${allRecords.length}`);
    
    // Aplicar paginación en memoria si se proporcionaron limit y offset
    if (limit > 0 || offset > 0) {
      const paginatedRecords = allRecords.slice(offset, offset + limit);
      console.log(`📄 Paginación aplicada: ${paginatedRecords.length} de ${allRecords.length} registros (offset: ${offset}, limit: ${limit})`);
      return paginatedRecords;
    }
    
    return allRecords;
  } catch (err) {
    console.error('❌ Error ejecutando dbo.getAllLineDiscount:', {
      message: err.message,
      code: err.code,
      number: err.number
    });
    
    // Si falla con schema, intentar sin schema
    try {
      console.log('🔍 Intentando ejecutar getAllLineDiscount (sin schema)...');
      const result = await request.execute('getAllLineDiscount');
      const allRecords = result.recordset || [];
      console.log(`✅ Procedimiento ejecutado exitosamente. Registros retornados: ${allRecords.length}`);
      
      // Aplicar paginación en memoria si se proporcionaron limit y offset
      if (limit > 0 || offset > 0) {
        const paginatedRecords = allRecords.slice(offset, offset + limit);
        console.log(`📄 Paginación aplicada: ${paginatedRecords.length} de ${allRecords.length} registros (offset: ${offset}, limit: ${limit})`);
        return paginatedRecords;
      }
      
      return allRecords;
    } catch (err2) {
      console.error('❌ Error ejecutando getAllLineDiscount (sin schema):', {
        message: err2.message,
        code: err2.code,
        number: err2.number
      });
      
      // Si el procedimiento existe pero falla la ejecución, mostrar el error real
      if (procedureExists) {
        throw new Error(
          `El procedimiento almacenado 'dbo.getAllLineDiscount' existe pero no se pudo ejecutar. ` +
          `Error: ${err2.message || err.message}. ` +
          `Verifica que el procedimiento no requiera parámetros o que tengas los permisos necesarios.`
        );
      }
      
      // Si el procedimiento no existe, proporcionar información útil
      if (availableProcedures.length > 0) {
        const procNames = availableProcedures.map(p => `${p.ROUTINE_SCHEMA}.${p.ROUTINE_NAME}`).join(', ');
        throw new Error(
          `El procedimiento almacenado 'getAllLineDiscount' no existe en la base de datos sye-siesa. ` +
          `Procedimientos similares encontrados: ${procNames}. ` +
          `Usa GET /api/local/procedures para ver todos los procedimientos disponibles. ` +
          `Error original: ${err2.message}`
        );
      } else {
        throw new Error(
          `El procedimiento almacenado 'getAllLineDiscount' no existe en la base de datos sye-siesa. ` +
          `No se encontraron procedimientos similares. ` +
          `Verifica que el procedimiento [dbo].[getAllLineDiscount] exista o usa GET /api/local/procedures para listar los procedimientos disponibles. ` +
          `Error: ${err2.message}`
        );
      }
    }
  }
}

/**
 * Obtiene el total de registros ejecutando getAllLineDiscount y contando los resultados
 * @returns {Promise<number>}
 */
async function getDataCountFromSecondaryDB() {
  const pool = await getPool2();

  const request = pool.request();
  request.timeout = 60000;

  try {
    // Ejecutar el procedimiento almacenado y contar los resultados
    const result = await request.execute('dbo.getAllLineDiscount');
    return result.recordset ? result.recordset.length : 0;
  } catch (err) {
    // Si falla con schema, intentar sin schema
    try {
      const result = await request.execute('getAllLineDiscount');
      return result.recordset ? result.recordset.length : 0;
    } catch (err2) {
      console.error('Error ejecutando getAllLineDiscount para contar:', err2);
      throw err2;
    }
  }
}

/**
 * Obtiene un registro específico filtrando los resultados de getAllLineDiscount por ID
 * @param {number} id - ID del registro
 * @returns {Promise<Object>}
 */
async function getDataByIdFromSecondaryDB(id) {
  const pool = await getPool2();

  const request = pool.request();
  request.timeout = 60000;

  try {
    // Ejecutar el procedimiento almacenado y filtrar por ID
    let result;
    try {
      result = await request.execute('dbo.getAllLineDiscount');
    } catch (err) {
      // Si falla con schema, intentar sin schema
      result = await request.execute('getAllLineDiscount');
    }
    
    // Buscar el registro con el ID especificado
    // Nota: Ajusta el nombre de la columna 'id' según la estructura real de tu procedimiento
    const record = result.recordset.find(item => item.id === id || item.Id === id || item.ID === id);
    return record || null;
  } catch (err) {
    console.error('Error ejecutando getAllLineDiscount para obtener por ID:', err);
    throw err;
  }
}

/**
 * Lista los procedimientos almacenados disponibles (útil para debugging)
 * @param {string} searchTerm - Término de búsqueda opcional
 * @returns {Promise<Array>}
 */
async function getAvailableStoredProcedures(searchTerm = '') {
  return await listStoredProcedures(searchTerm);
}

module.exports = {
  getDataFromSecondaryDB,
  getDataCountFromSecondaryDB,
  getDataByIdFromSecondaryDB,
  getAvailableStoredProcedures
};

