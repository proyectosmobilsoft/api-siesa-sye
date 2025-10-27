const express = require('express');
const router = express.Router();
const { getAllClients, getClientById } = require('../controllers/clients.controller');

// GET /api/clients
router.get('/', getAllClients);

// GET /api/clients/:id
router.get('/:id', getClientById);

module.exports = router;

