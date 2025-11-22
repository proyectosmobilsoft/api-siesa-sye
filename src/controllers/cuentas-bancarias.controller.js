const cuentasBancariasService = require('../services/cuentas-bancarias.service');

async function getCuentasBancarias(req, res, next) {
  try {
    const cuentasBancarias = await cuentasBancariasService.getAllCuentasBancarias();
    res.json({ success: true, data: cuentasBancarias });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCuentasBancarias };

