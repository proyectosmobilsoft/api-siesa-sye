const express = require('express');
const router = express.Router();
const { getAllClients } = require('../controllers/clients.controller');

// GET /api/clients
router.get('/', getAllClients);

module.exports = router;

