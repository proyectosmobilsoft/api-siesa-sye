const clientsService = require('../services/clients.service');

exports.getAllClients = async (req, res, next) => {
  try {
    const clients = await clientsService.getAllClients();
    res.json(clients);
  } catch (error) {
    next(error);
  }
};

