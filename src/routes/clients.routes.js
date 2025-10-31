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
 *     SalesByClient:
 *       type: object
 *       properties:
 *         ID Cliente:
 *           type: integer
 *           description: ID único del cliente
 *           example: 12345
 *         Ventas Netas:
 *           type: number
 *           format: double
 *           description: Suma de ventas netas (bruto - descuentos + impuestos)
 *           example: 1500000.50
 *         Ventas Brutas:
 *           type: number
 *           format: double
 *           description: Suma de ventas brutas
 *           example: 1600000.00
 *         Descuentos:
 *           type: number
 *           format: double
 *           description: Suma total de descuentos aplicados
 *           example: 50000.00
 *         Impuestos:
 *           type: number
 *           format: double
 *           description: Suma total de impuestos
 *           example: 100000.50
 *         Periodos Activos:
 *           type: integer
 *           description: Número de periodos distintos con actividad
 *           example: 5
 *         Ticket Promedio:
 *           type: number
 *           format: double
 *           description: Ticket promedio por cliente
 *           example: 300000.10
 *     SalesByClientResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SalesByClient'
 *           description: Lista de ventas por cliente
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
 *             example:
 *               success: true
 *               data:
 *                 - f9740_id: 101
 *                   f9740_nit: "901123456"
 *                   f9740_razon_social: "Distribuidora S.A.S"
 *                   f9740_nombre: "Distribuidora Principal"
 *                   f9740_email: "info@empresa.com"
 *                   f9740_celular: "3001234567"
 *                   f9740_direccion1: "Calle 123 #45-67"
 */

/**
 * @swagger
 * /api/clients/sales-report:
 *   get:
 *     summary: Obtener reporte de ventas por cliente
 *     description: Retorna un reporte agregado de ventas por cliente con métricas de ventas netas, brutas, descuentos, impuestos, periodos activos y ticket promedio. Los resultados están ordenados por ventas netas en orden descendente.
 *     tags: [Clientes]
 *     parameters:
 *       - in: query
 *         name: yearMonth
 *         required: false
 *         schema:
 *           type: integer
 *         example: 202510
 *         description: Año y mes en formato YYYYMM. Ejemplo 202510 para octubre 2025. Si no se proporciona, se obtienen todos los meses disponibles.
 *       - in: query
 *         name: companyId
 *         required: false
 *         schema:
 *           type: integer
 *         default: 1
 *         description: ID de la compañía. Por defecto es 1.
 *     responses:
 *       200:
 *         description: Reporte de ventas por cliente obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SalesByClientResponse'
 *             example:
 *               success: true
 *               data:
 *                 - ID Cliente: 12345
 *                   Ventas Netas: 1500000.50
 *                   Ventas Brutas: 1600000.00
 *                   Descuentos: 50000.00
 *                   Impuestos: 100000.50
 *                   Periodos Activos: 5
 *                   Ticket Promedio: 300000.10
 *                 - ID Cliente: 67890
 *                   Ventas Netas: 850000.25
 *                   Ventas Brutas: 900000.00
 *                   Descuentos: 25000.00
 *                   Impuestos: 75000.25
 *                   Periodos Activos: 3
 *                   Ticket Promedio: 283333.42
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Error al obtener el reporte de ventas"
 */
router.get('/', clientsController.getClients);
router.get('/sales-report', clientsController.getSalesByClient);

module.exports = router;

