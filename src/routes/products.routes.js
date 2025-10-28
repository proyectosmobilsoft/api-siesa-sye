const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products.controller');

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Obtener todos los productos
 *     description: Retorna la lista de productos desde la base de datos SQL Server.
 *     tags: [Productos]
 *     responses:
 *       200:
 *         description: Lista de productos obtenida exitosamente.
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
 *                       f120_id:
 *                         type: integer
 *                         example: 1
 *                       f120_referencia:
 *                         type: string
 *                         example: "PROD001"
 *                       f120_descripcion:
 *                         type: string
 *                         example: "Producto de ejemplo"
 *                       f120_descripcion_corta:
 *                         type: string
 *                         example: "Prod Ejemplo"
 *                       f120_id_cia:
 *                         type: integer
 *                         example: 1
 *                       f120_ind_tipo_item:
 *                         type: integer
 *                         example: 1
 *                       f120_ind_compra:
 *                         type: integer
 *                         example: 1
 *                       f120_ind_venta:
 *                         type: integer
 *                         example: 1
 *                       f120_ind_manufactura:
 *                         type: integer
 *                         example: 0
 *                       f120_ind_lote:
 *                         type: integer
 *                         example: 1
 *                       f120_vida_util:
 *                         type: integer
 *                         example: 365
 *                       f120_notas:
 *                         type: string
 *                         example: "Producto principal del catálogo"
 *                       f120_usuario_creacion:
 *                         type: string
 *                         example: "admin"
 *                       f120_fecha_creacion:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-01T00:00:00.000Z"
 *                       f120_ind_serial:
 *                         type: integer
 *                         example: 0
 *                       f120_ind_paquete:
 *                         type: integer
 *                         example: 0
 *                       f120_ind_exento:
 *                         type: integer
 *                         example: 0
 *                       f120_ind_controlado:
 *                         type: integer
 *                         example: 1
 */
router.get('/', productsController.getProducts);

module.exports = router;
