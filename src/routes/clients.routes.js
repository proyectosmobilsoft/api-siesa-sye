const express = require('express');
const router = express.Router();
const clientsController = require('../controllers/clients.controller');

router.get('/', clientsController.getClients);

module.exports = router;

