const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidos.controller');
const pedidosManualController = require('../controllers/pedidos-manual.controller');

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

/**
 * @swagger
 * /api/pedidos/preview:
 *   post:
 *     summary: Generar preview del JSON transformado sin enviarlo
 *     description: Recibe un f_rowid, ejecuta los 3 SPs para obtener datos completos, transforma al formato JSON requerido y retorna el resultado sin enviarlo al endpoint externo. Útil para ver el JSON antes de enviarlo.
 *     tags: [Pedidos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - f_rowid
 *             properties:
 *               f_rowid:
 *                 type: integer
 *                 description: ID del pedido (f_rowid)
 *                 example: 257792
 *     responses:
 *       200:
 *         description: Preview generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     pedidoOriginal:
 *                       type: object
 *                       description: Datos originales del pedido desde la BD
 *                     pedidoTransformado:
 *                       type: object
 *                       description: JSON transformado listo para enviar
 *                     validacion:
 *                       type: object
 *                       properties:
 *                         isValid:
 *                           type: boolean
 *                         errors:
 *                           type: array
 *                           items:
 *                             type: string
 *       400:
 *         description: f_rowid no proporcionado
 *       404:
 *         description: Pedido no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/preview', pedidosManualController.previewPedido);

/**
 * @swagger
 * /api/pedidos/send:
 *   post:
 *     summary: Enviar pedido al endpoint externo
 *     description: Recibe un f_rowid, obtiene los datos completos, transforma al formato JSON y lo envía al endpoint configurado en SYNC_ENDPOINT_URL
 *     tags: [Pedidos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - f_rowid
 *             properties:
 *               f_rowid:
 *                 type: integer
 *                 description: ID del pedido (f_rowid)
 *                 example: 257792
 *     responses:
 *       200:
 *         description: Pedido enviado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Pedido enviado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     pedido:
 *                       type: object
 *                       description: JSON enviado
 *                     response:
 *                       type: object
 *                       description: Respuesta del endpoint externo
 *       400:
 *         description: f_rowid no proporcionado o pedido inválido
 *       404:
 *         description: Pedido no encontrado
 *       500:
 *         description: Error interno del servidor o SYNC_ENDPOINT_URL no configurado
 */
router.post('/send', pedidosManualController.sendPedido);

module.exports = router;
