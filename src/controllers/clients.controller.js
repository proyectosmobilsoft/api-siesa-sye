const clientsService = require('../services/clients.service');

async function getClients(req, res, next) {
  try {
    const clients = await clientsService.getAllClients();
    res.json({ success: true, data: clients });
  } catch (err) {
    next(err);
  }
}

async function getSalesByClient(req, res, next) {
  try {
    const { yearMonth, companyId } = req.query;
    const sales = await clientsService.getSalesByClient(
      yearMonth ? parseInt(yearMonth) : null,
      companyId ? parseInt(companyId) : 1
    );
    res.json({ success: true, data: sales });
  } catch (err) {
    next(err);
  }
}

async function getTop10Clients(req, res, next) {
  try {
    const { yearMonth, companyId } = req.query;
    const topClients = await clientsService.getTop10Clients(
      yearMonth ? parseInt(yearMonth) : null,
      companyId ? parseInt(companyId) : 1
    );
    res.json({ success: true, data: topClients });
  } catch (err) {
    next(err);
  }
}

async function getNewVsRecurrentClients(req, res, next) {
  try {
    const { currentMonth, previousMonth, companyId } = req.query;
    
    if (!currentMonth) {
      return res.status(400).json({
        success: false,
        error: 'El parámetro currentMonth es requerido (formato YYYYMM)'
      });
    }

    const result = await clientsService.getNewVsRecurrentClients(
      parseInt(currentMonth),
      previousMonth ? parseInt(previousMonth) : null,
      companyId ? parseInt(companyId) : 1
    );
    
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = { getClients, getSalesByClient, getTop10Clients, getNewVsRecurrentClients };

