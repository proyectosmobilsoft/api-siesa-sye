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

module.exports = { getClients, getSalesByClient };

