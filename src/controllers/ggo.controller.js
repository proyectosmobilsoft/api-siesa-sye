const ggoService = require('../services/ggo.service');

/**
 * Obtiene los tipos de empaque disponibles
 */
async function getPackageUnits(req, res, next) {
  try {
    const result = await ggoService.getPackageUnits();
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Crea un envío, recogida o visita en el servicio GGO
 */
async function createShipping(req, res, next) {
  try {
    // Validar datos
    const validation = ggoService.validateShippingData(req.body);
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: validation.errors
      });
    }

    // Obtener el token del request (ya validado por el middleware)
    const token = req.token;

    // Enviar datos al servicio externo
    const result = await ggoService.sendShippingToGGO(req.body, token);

    if (!result.success) {
      const statusCode = result.status || 500;
      return res.status(statusCode).json({
        success: false,
        message: result.message,
        error: result.error,
        data: result.data
      });
    }

    res.json({
      success: true,
      message: 'Envío creado exitosamente',
      data: result.data
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPackageUnits,
  createShipping
};
