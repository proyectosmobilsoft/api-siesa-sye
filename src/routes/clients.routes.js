const express = require('express');
const router = express.Router();
const clientsController = require('../controllers/clients.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Client:
 *       type: object
 *       properties:
 *         f9740_id:
 *           type: integer
 *           description: ID único del cliente
 *           example: 101
 *         f9740_nit:
 *           type: string
 *           description: Número de identificación tributaria
 *           example: "901123456"
 *         f9740_razon_social:
 *           type: string
 *           description: Razón social del cliente
 *           example: "Distribuidora S.A.S"
 *         f9740_nombre:
 *           type: string
 *           description: Nombre comercial del cliente
 *           example: "Distribuidora Principal"
 *         f9740_email:
 *           type: string
 *           description: Correo electrónico del cliente
 *           example: "info@empresa.com"
 *         f9740_celular:
 *           type: string
 *           description: Número de celular del cliente
 *           example: "3001234567"
 *         f9740_direccion1:
 *           type: string
 *           description: Dirección principal del cliente
 *           example: "Calle 123 #45-67"
 *     ClientsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Client'
 *           description: Lista de clientes
 */

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
 *               $ref: '#/components/schemas/ClientsResponse'
 */
router.get('/', clientsController.getClients);

module.exports = router;

