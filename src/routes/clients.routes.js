const express = require('express');
const router = express.Router();
const clientsController = require('../controllers/clients.controller');

/**
 * @swagger
 * /api/clients:
 *   get:
 *     summary: Obtener todos los clientes
 *     description: Retorna la lista de clientes activos desde la base de datos SQL Server.
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Lista de clientes obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       f9740_id:
 *                         type: integer
 *                         example: 101
 *                       f9740_nit:
 *                         type: string
 *                         example: "901123456"
 *                       f9740_razon_social:
 *                         type: string
 *                         example: "Distribuidora S.A.S"
 *                       f9740_email:
 *                         type: string
 *                         example: "info@empresa.com"
 */
router.get('/', clientsController.getClients);

module.exports = router;

