const clientsService = require('../services/clients.service');

async function getClients(req, res, next) {
  try {
    const clients = await clientsService.getAllClients();
    res.json({ success: true, data: clients });
  } catch (err) {
    next(err);
  }
}

module.exports = { getClients };

