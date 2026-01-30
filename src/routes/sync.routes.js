const express = require('express');
const router = express.Router();
const syncController = require('../controllers/sync.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     SyncStatus:
 *       type: object
 *       properties:
 *         enabled:
 *           type: boolean
 *           description: Indica si la sincronización está habilitada
 *           example: true
 *         running:
 *           type: boolean
 *           description: Indica si el job está corriendo
 *           example: true
 *         stats:
 *           type: object
 *           properties:
 *             ultimaFecha:
 *               type: string
 *               format: date-time
 *               description: Última fecha procesada
 *             ultimoId:
 *               type: integer
 *               description: Último ID de pedido procesado
 *             totalProcesados:
 *               type: integer
 *               description: Total de pedidos procesados
 *             isRunning:
 *               type: boolean
 *               description: Indica si hay una sincronización en curso
 *             endpointUrl:
 *               type: string
 *               description: URL del endpoint de destino
 */

/**
 * @swagger
 * /api/sync/status:
 *   get:
 *     summary: Obtener estado de la sincronización de pedidos
 *     description: Retorna el estado actual del job de sincronización, incluyendo estadísticas y configuración
 *     tags: [Sincronización]
 *     responses:
 *       200:
 *         description: Estado obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SyncStatus'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/status', syncController.getStatus);

/**
 * @swagger
 * /api/sync/trigger:
 *   post:
 *     summary: Forzar sincronización manual de pedidos
 *     description: Dispara una sincronización inmediata sin esperar al próximo intervalo programado. Útil para testing o recuperación de errores.
 *     tags: [Sincronización]
 *     responses:
 *       200:
 *         description: Sincronización iniciada exitosamente
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
 *                   example: "Sincronización manual iniciada"
 *       500:
 *         description: Error interno del servidor
 */
router.post('/trigger', syncController.triggerSync);

module.exports = router;
