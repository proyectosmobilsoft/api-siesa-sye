const secondaryDbService = require('../services/local.service');

/**
 * Controlador para endpoints que usan la segunda base de datos
 */

/**
 * Obtiene datos de la segunda base de datos
 */
async function getData(req, res, next) {
  try {
    const { page, pageSize } = req.query;
    
    // Paginación: por defecto 100 registros cuando se proporciona page
    const pageNumber = page ? Math.max(1, parseInt(page)) : null;
    const limit = pageSize ? Math.min(parseInt(pageSize), 1000) : (pageNumber ? 100 : 100);
    const offset = pageNumber ? (pageNumber - 1) * limit : 0;

    // Obtener datos y total en paralelo
    const [data, total] = await Promise.all([
      secondaryDbService.getDataFromSecondaryDB(limit, offset),
      secondaryDbService.getDataCountFromSecondaryDB()
    ]);

    const response = {
      success: true,
      data: data,
      total: total
    };

    // Si hay paginación, agregar información de paginación
    if (pageNumber) {
      response.pagination = {
        page: pageNumber,
        pageSize: limit,
        total: total,
        totalPages: Math.ceil(total / limit)
      };
    }

    res.json(response);
  } catch (err) {
    next(err);
  }
}

/**
 * Obtiene un registro específico por ID de la segunda base de datos
 */
async function getDataById(req, res, next) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'El parámetro id es requerido'
      });
    }

    const data = await secondaryDbService.getDataByIdFromSecondaryDB(parseInt(id));
    
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Registro no encontrado'
      });
    }

    res.json({
      success: true,
      data: data
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Lista los procedimientos almacenados disponibles en la BD2
 */
async function getAvailableProcedures(req, res, next) {
  try {
    const { search } = req.query;
    console.log(`📋 getAvailableProcedures llamado con search: "${search || ''}"`);
    
    const procedures = await secondaryDbService.getAvailableStoredProcedures(search || '');
    
    console.log(`✅ getAvailableProcedures retornando ${procedures.length} procedimiento(s)`);
    
    res.json({
      success: true,
      data: procedures,
      total: procedures.length,
      message: procedures.length > 0 
        ? `Se encontraron ${procedures.length} procedimiento(s) almacenado(s)`
        : 'No se encontraron procedimientos almacenados'
    });
  } catch (err) {
    console.error('❌ Error en getAvailableProcedures:', err);
    // Asegurar que el error se propaga correctamente
    next(err);
  }
}

module.exports = {
  getData,
  getDataById,
  getAvailableProcedures
};

