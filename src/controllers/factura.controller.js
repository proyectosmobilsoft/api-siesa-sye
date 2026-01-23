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
    const { page, pageSize, id_tercero, id_co } = req.query;
    
    // Paginación: por defecto 100 registros cuando se proporciona page, máximo 5000
    const pageNumber = page ? Math.max(1, parseInt(page)) : null;
    const limit = pageSize ? Math.min(parseInt(pageSize), 5000) : (pageNumber ? 100 : 1000);
    const offset = pageNumber ? (pageNumber - 1) * limit : 0;

    // Convertir id_tercero a integer si se proporciona
    const idTercero = id_tercero ? parseInt(id_tercero) : null;
    
    // Obtener id_co del query, por defecto '001'
    const idCo = id_co || '001';

    // Obtener facturas y total en paralelo
    const [facturas, total] = await Promise.all([
      facturaService.getFacturas(
        limit,
        offset,
        idTercero,
        idCo
      ),
      facturaService.getFacturasCount(
        idTercero
      )
    ]);

    const response = {
      success: true, 
      data: facturas,
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

