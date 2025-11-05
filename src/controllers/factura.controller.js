const facturaService = require('../services/factura.service');

async function getEstadosFinancieros(req, res, next) {
  try {
    const { periodoInicial, periodoFinal } = req.query;
    const estadosFinancieros = await facturaService.getEstadosFinancieros(
      periodoInicial ? parseInt(periodoInicial) : undefined,
      periodoFinal ? parseInt(periodoFinal) : undefined
    );
    res.json({ success: true, data: estadosFinancieros });
  } catch (err) {
    next(err);
  }
}

async function getFacturas(req, res, next) {
  try {
    const { periodoInicial, periodoFinal, page, pageSize } = req.query;
    
    // Paginación: por defecto 1000 registros, máximo 5000
    const limit = Math.min(pageSize ? parseInt(pageSize) : 1000, 5000);
    const pageNumber = page ? Math.max(1, parseInt(page)) : 1;
    const offset = (pageNumber - 1) * limit;

    // Obtener facturas y total en paralelo
    const [facturas, total] = await Promise.all([
      facturaService.getFacturas(
        periodoInicial ? parseInt(periodoInicial) : undefined,
        periodoFinal ? parseInt(periodoFinal) : undefined,
        limit,
        offset
      ),
      facturaService.getFacturasCount(
        periodoInicial ? parseInt(periodoInicial) : undefined,
        periodoFinal ? parseInt(periodoFinal) : undefined
      )
    ]);

    res.json({ 
      success: true, 
      data: facturas,
      pagination: {
        page: pageNumber,
        pageSize: limit,
        total: total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
}

async function getEstadoResultados(req, res, next) {
  try {
    const { periodoInicial, periodoFinal } = req.query;
    const estadoResultados = await facturaService.getEstadoResultados(
      periodoInicial ? parseInt(periodoInicial) : undefined,
      periodoFinal ? parseInt(periodoFinal) : undefined
    );
    res.json({ success: true, data: estadoResultados });
  } catch (err) {
    next(err);
  }
}

async function getTendenciaMensual(req, res, next) {
  try {
    const { periodoInicial, periodoFinal } = req.query;
    const tendencia = await facturaService.getTendenciaMensual(
      periodoInicial ? parseInt(periodoInicial) : undefined,
      periodoFinal ? parseInt(periodoFinal) : undefined
    );
    res.json({ success: true, data: tendencia });
  } catch (err) {
    next(err);
  }
}

module.exports = { getEstadosFinancieros, getFacturas, getEstadoResultados, getTendenciaMensual };

