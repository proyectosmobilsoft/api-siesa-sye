const clientsService = require('../services/clients.service');

exports.getAllClients = async (req, res, next) => {
  try {
    const clients = await clientsService.getAllClients();
    res.json(clients);
  } catch (error) {
    next(error);
  }
};

exports.getClientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const client = await clientsService.getClientById(id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    res.json(client);
  } catch (error) {
    next(error);
  }
};

