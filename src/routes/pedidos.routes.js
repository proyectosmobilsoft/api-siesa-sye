const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidos.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Pedido:
 *       type: object
 *       description: Estructura de un pedido retornado por el stored procedure sp_pv_cons_pedido
 *     PedidosResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Pedido'
 *           description: Lista de pedidos filtrados por rango de fechas
 */

/**
 * @swagger
 * /api/pedidos:
 *   get:
 *     summary: Obtener pedidos por rango de fechas
 *     description: Ejecuta el stored procedure sp_pv_cons_pedido para consultar pedidos filtrados por rango de fechas. Los parámetros fechaInicial y fechaFinal son obligatorios.
 *     tags: [Pedidos]
 *     parameters:
 *       - in: query
 *         name: fechaInicial
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha inicial del rango de búsqueda en formato ISO 8601 (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss)
 *         example: "2026-01-01"
 *       - in: query
 *         name: fechaFinal
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha final del rango de búsqueda en formato ISO 8601 (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss)
 *         example: "2026-01-28"
 *     responses:
 *       200:
 *         description: Pedidos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PedidosResponse'
 *             example:
 *               success: true
 *               data: []
 *       400:
 *         description: Parámetros inválidos o faltantes
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
 *                   example: "Se requieren los parámetros fechaInicial y fechaFinal"
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
 *                   example: "Error al obtener los pedidos"
 */
router.get('/', pedidosController.getPedidos);

module.exports = router;
