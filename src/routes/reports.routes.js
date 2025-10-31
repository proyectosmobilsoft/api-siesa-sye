const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     DailyOrder:
 *       type: object
 *       properties:
 *         rowid:
 *           type: integer
 *           description: ID único del registro
 *           example: 247758
 *         "Fecha docto":
 *           type: string
 *           format: date-time
 *           description: Fecha del documento
 *           example: "2025-09-06T00:00:00.000Z"
 *         "Hora creacion":
 *           type: string
 *           description: Hora de creación en formato legible
 *           example: "11 AM"
 *         "ID. CO":
 *           type: string
 *           description: ID de la compañía
 *           example: "001"
 *         Estado:
 *           type: string
 *           description: Estado del pedido
 *           example: "Cumplido"
 *         "Desc. CO":
 *           type: string
 *           description: Descripción de la compañía
 *           example: "PRINCIPAL DISTRIBUCIONES SYE"
 *         "Hora creacion dt":
 *           type: string
 *           format: date-time
 *           description: Hora de creación como datetime
 *           example: "2025-09-06T11:39:39.730Z"
 *     DailyOrdersResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DailyOrder'
 *           description: Lista de pedidos diarios
 *     SalesSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID del registro
 *           example: 1
 *     SalesSummaryResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SalesSummary'
 *           description: Lista de resúmenes de venta TPV
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Vendor:
 *       type: object
 *       properties:
 *         "Codigo vendedor":
 *           type: string
 *           example: "0072"
 *         "Nombre vendedor":
 *           type: string
 *           example: "RIVERA FLOREZ DUNIA SOFIA"
 *         "Tipo de entrega":
 *           type: string
 *           example: "Sin tipo de entrega"
 *         "Valor subtotal":
 *           type: string
 *           description: Valor con separador de miles según vista
 *           example: "76844,00"
 *         "Valor neto":
 *           type: string
 *           description: Valor con separador de miles según vista
 *           example: "78600,00"
 *         compania:
 *           type: integer
 *           example: 1
 *         "centro de op":
 *           type: string
 *           example: "002"
 *     VendorsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Vendor'
 */

/**
 * @swagger
 * /api/reports/daily-orders:
 *   get:
 *     summary: Obtener pedidos diarios
 *     description: Retorna la lista de pedidos diarios desde la vista v430_pedidos_diarios.
 *     tags: [Reportes]
 *     responses:
 *       200:
 *         description: Lista de pedidos diarios obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DailyOrdersResponse'
 *             example:
 *               success: true
 *               data:
 *                 - rowid: 247758
 *                   "Fecha docto": "2025-09-06T00:00:00.000Z"
 *                   "Hora creacion": "11 AM"
 *                   "ID. CO": "001"
 *                   Estado: "Cumplido"
 *                   "Desc. CO": "PRINCIPAL DISTRIBUCIONES SYE"
 *                   "Hora creacion dt": "2025-09-06T11:39:39.730Z"
 */
/**
 * @swagger
 * /api/reports/sales-summary:
 *   get:
 *     summary: Obtener resumen de ventas TPV
 *     description: Retorna el resumen de ventas desde la vista v9820_db_vta_resumen_tpv.
 *     tags: [Reportes]
 *     responses:
 *       200:
 *         description: Resumen de ventas obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SalesSummaryResponse'
 */
router.get('/daily-orders', reportsController.getDailyOrders);
router.get('/sales-summary', reportsController.getSalesSummary);

/**
 * @swagger
 * /api/reports/vendors:
 *   get:
 *     summary: Obtener vendedores
 *     description: Retorna la lista de vendedores desde la vista v9820_vendedores.
 *     tags: [Reportes]
 *     responses:
 *       200:
 *         description: Lista de vendedores obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorsResponse'
 *             example:
 *               success: true
 *               data:
 *                 - "Codigo vendedor": "0072"
 *                   "Nombre vendedor": "RIVERA FLOREZ DUNIA SOFIA"
 *                   "Tipo de entrega": "Sin tipo de entrega"
 *                   "Valor subtotal": "76844,00"
 *                   "Valor neto": "78600,00"
 *                   compania: 1
 *                   "centro de op": "002"
 */
router.get('/vendors', reportsController.getVendors);

module.exports = router;
