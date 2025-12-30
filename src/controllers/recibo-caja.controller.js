const reciboCajaService = require('../services/recibo-caja.service');

/**
 * Controlador para procesar recibos de caja
 */

/**
 * Procesa un recibo de caja ejecutando la secuencia de stored procedures
 */
async function procesarReciboCaja(req, res, next) {
  try {
    console.log('📋 Procesando recibo de caja...');
    console.log('📋 Parámetros recibidos:', JSON.stringify(req.body, null, 2));
    
    const result = await reciboCajaService.procesarReciboCaja(req.body);
    
    res.json({
      success: true,
      message: result.message,
      data: result.results
    });
  } catch (err) {
    console.error('❌ Error en procesarReciboCaja:', err);
    next(err);
  }
}

module.exports = {
  procesarReciboCaja
};

