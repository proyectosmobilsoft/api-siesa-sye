const reciboCajaService = require('../services/recibo-caja.service');

async function procesarReciboCaja(req, res, next) {
  try {
    console.log("req.body", req.body);
    
    const result = await reciboCajaService.procesarReciboCaja(req.body);
    res.json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (err) {
    next(err);
  }
}

async function getProximoConsecutivoRC(req, res, next) {
  try {
    const {
      id_cia = 1,
      id_tipo_docto = 'RCC',
      id_co = '001',
      p_bloquear = 0,
      p_leer_mandato_tipo = 0
    } = req.query;
    const result = await reciboCajaService.leerProximoConsecutivoRC({
      id_cia: Number(id_cia),
      id_tipo_docto: String(id_tipo_docto),
      id_co: String(id_co),
      p_bloquear: Number(p_bloquear),
      p_leer_mandato_tipo: Number(p_leer_mandato_tipo)
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  procesarReciboCaja,
  getProximoConsecutivoRC
};
