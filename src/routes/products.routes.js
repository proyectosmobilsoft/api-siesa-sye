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
 *     SalesByProduct:
 *       type: object
 *       properties:
 *         CodigoProducto:
 *           type: string
 *           description: Código único del producto
 *           example: "PROD001"
 *         NombreProducto:
 *           type: string
 *           description: Nombre completo del producto
 *           example: "Producto de Ejemplo"
 *         CantidadVendida:
 *           type: number
 *           format: double
 *           description: Cantidad total vendida del producto
 *           example: 150.5
 *         VentasTotales:
 *           type: number
 *           format: double
 *           description: Suma total de ventas brutas del producto
 *           example: 1500000.00
 *         DescuentosTotales:
 *           type: number
 *           format: double
 *           description: Suma total de descuentos aplicados
 *           example: 50000.00
 *         ImpuestosTotales:
 *           type: number
 *           format: double
 *           description: Suma total de impuestos
 *           example: 100000.00
 *         MargenBruto:
 *           type: number
 *           format: double
 *           description: Margen bruto total (ventas - costo)
 *           example: 300000.00
 *         MargenUnitario:
 *           type: number
 *           format: double
 *           description: Margen bruto por unidad vendida
 *           example: 2000.00
 *     SalesByProductResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SalesByProduct'
 *           description: Lista de ventas por producto
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
/**
 * @swagger
 * /api/products/sales-report:
 *   get:
 *     summary: Obtener reporte de ventas por producto
 *     description: Retorna un reporte detallado de ventas por producto incluyendo cantidad vendida, ventas totales, descuentos, impuestos, margen bruto y margen unitario. Los resultados están ordenados por ventas totales en orden descendente.
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: yearMonth
 *         required: false
 *         schema:
 *           type: integer
 *         example: 202501
 *         description: Año y mes en formato YYYYMM. Ejemplo 202501 para enero 2025. Si no se proporciona, se obtienen todos los meses disponibles.
 *       - in: query
 *         name: companyId
 *         required: false
 *         schema:
 *           type: integer
 *         default: 1
 *         description: ID de la compañía. Por defecto es 1.
 *     responses:
 *       200:
 *         description: Reporte de ventas por producto obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SalesByProductResponse'
 *             example:
 *               success: true
 *               data:
 *                 - CodigoProducto: "PROD001"
 *                   NombreProducto: "Producto de Ejemplo"
 *                   CantidadVendida: 150.5
 *                   VentasTotales: 1500000.00
 *                   DescuentosTotales: 50000.00
 *                   ImpuestosTotales: 100000.00
 *                   MargenBruto: 300000.00
 *                   MargenUnitario: 2000.00
 *                 - CodigoProducto: "PROD002"
 *                   NombreProducto: "Otro Producto"
 *                   CantidadVendida: 200.0
 *                   VentasTotales: 1200000.00
 *                   DescuentosTotales: 30000.00
 *                   ImpuestosTotales: 80000.00
 *                   MargenBruto: 250000.00
 *                   MargenUnitario: 1250.00
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
 *                   example: "Error al obtener el reporte de ventas por producto"
 */
/**
 * @swagger
 * /api/products/top-10-best-selling:
 *   get:
 *     summary: Obtener top 10 productos más vendidos
 *     description: Retorna los 10 productos con mayores ventas totales, ordenados de forma descendente. Incluye todas las métricas de venta como cantidad vendida, descuentos, impuestos, margen bruto y margen unitario.
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: yearMonth
 *         required: false
 *         schema:
 *           type: integer
 *         example: 202501
 *         description: Año y mes en formato YYYYMM. Ejemplo 202501 para enero 2025. Si no se proporciona, se obtienen todos los meses disponibles.
 *       - in: query
 *         name: companyId
 *         required: false
 *         schema:
 *           type: integer
 *         default: 1
 *         description: ID de la compañía. Por defecto es 1.
 *     responses:
 *       200:
 *         description: Top 10 productos más vendidos obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SalesByProductResponse'
 *             example:
 *               success: true
 *               data:
 *                 - CodigoProducto: "PROD001"
 *                   NombreProducto: "Producto más vendido"
 *                   CantidadVendida: 500.0
 *                   VentasTotales: 5000000.00
 *                   DescuentosTotales: 100000.00
 *                   ImpuestosTotales: 400000.00
 *                   MargenBruto: 1500000.00
 *                   MargenUnitario: 3000.00
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
 *                   example: "Error al obtener el top 10 de productos más vendidos"
 */

/**
 * @swagger
 * /api/products/top-10-least-selling:
 *   get:
 *     summary: Obtener top 10 productos menos vendidos
 *     description: Retorna los 10 productos con menores ventas totales, ordenados de forma ascendente. Útil para identificar productos con bajo rendimiento. Incluye todas las métricas de venta como cantidad vendida, descuentos, impuestos, margen bruto y margen unitario.
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: yearMonth
 *         required: false
 *         schema:
 *           type: integer
 *         example: 202501
 *         description: Año y mes en formato YYYYMM. Ejemplo 202501 para enero 2025. Si no se proporciona, se obtienen todos los meses disponibles.
 *       - in: query
 *         name: companyId
 *         required: false
 *         schema:
 *           type: integer
 *         default: 1
 *         description: ID de la compañía. Por defecto es 1.
 *     responses:
 *       200:
 *         description: Top 10 productos menos vendidos obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SalesByProductResponse'
 *             example:
 *               success: true
 *               data:
 *                 - CodigoProducto: "PROD999"
 *                   NombreProducto: "Producto menos vendido"
 *                   CantidadVendida: 5.0
 *                   VentasTotales: 50000.00
 *                   DescuentosTotales: 1000.00
 *                   ImpuestosTotales: 4000.00
 *                   MargenBruto: 10000.00
 *                   MargenUnitario: 2000.00
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
 *                   example: "Error al obtener el top 10 de productos menos vendidos"
 */
router.get('/', productsController.getProducts);
router.get('/sales-report', productsController.getSalesByProduct);
router.get('/top-10-best-selling', productsController.getTop10BestSellingProducts);
router.get('/top-10-least-selling', productsController.getTop10LeastSellingProducts);

module.exports = router;
