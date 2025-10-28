const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         f120_id:
 *           type: integer
 *           description: ID único del producto
 *           example: 1
 *         f120_referencia:
 *           type: string
 *           description: Código de referencia del producto
 *           example: "PROD001"
 *         f120_descripcion:
 *           type: string
 *           description: Descripción completa del producto
 *           example: "Producto de ejemplo"
 *         f120_descripcion_corta:
 *           type: string
 *           description: Descripción corta del producto
 *           example: "Prod Ejemplo"
 *         f120_id_cia:
 *           type: integer
 *           description: ID de la compañía
 *           example: 1
 *         f120_ind_tipo_item:
 *           type: integer
 *           description: Tipo de item (1=Producto, 2=Servicio, etc.)
 *           example: 1
 *         f120_ind_compra:
 *           type: integer
 *           description: Indicador si se puede comprar (1=Sí, 0=No)
 *           example: 1
 *         f120_ind_venta:
 *           type: integer
 *           description: Indicador si se puede vender (1=Sí, 0=No)
 *           example: 1
 *         f120_ind_manufactura:
 *           type: integer
 *           description: Indicador si es manufacturado (1=Sí, 0=No)
 *           example: 0
 *         f120_ind_lote:
 *           type: integer
 *           description: Indicador si maneja lotes (1=Sí, 0=No)
 *           example: 1
 *         f120_vida_util:
 *           type: integer
 *           description: Vida útil en días
 *           example: 365
 *         f120_notas:
 *           type: string
 *           description: Notas adicionales del producto
 *           example: "Producto principal del catálogo"
 *         f120_usuario_creacion:
 *           type: string
 *           description: Usuario que creó el producto
 *           example: "admin"
 *         f120_fecha_creacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del producto
 *           example: "2024-01-01T00:00:00.000Z"
 *         f120_ind_serial:
 *           type: integer
 *           description: Indicador si maneja seriales (1=Sí, 0=No)
 *           example: 0
 *         f120_ind_paquete:
 *           type: integer
 *           description: Indicador si es paquete (1=Sí, 0=No)
 *           example: 0
 *         f120_ind_exento:
 *           type: integer
 *           description: Indicador si está exento de impuestos (1=Sí, 0=No)
 *           example: 0
 *         f120_ind_controlado:
 *           type: integer
 *           description: Indicador si es controlado (1=Sí, 0=No)
 *           example: 1
 *     ProductsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Product'
 *           description: Lista de productos
 */

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
 *               $ref: '#/components/schemas/ProductsResponse'
 */
router.get('/', productsController.getProducts);

module.exports = router;
