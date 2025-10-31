const express = require('express');
const router = express.Router();
const warehousesController = require('../controllers/warehouses.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Warehouse:
 *       type: object
 *       properties:
 *         f150_ts:
 *           type: string
 *           format: date-time
 *           description: Timestamp del registro
 *           example: "2019-01-09T11:50:24.270Z"
 *         f150_id_cia:
 *           type: integer
 *           description: ID de la compañía
 *           example: 1
 *         f150_rowid:
 *           type: integer
 *           description: ID único de la bodega
 *           example: 1
 *         f150_id:
 *           type: string
 *           description: Código de la bodega
 *           example: "50"
 *         f150_descripcion:
 *           type: string
 *           description: Descripción completa de la bodega
 *           example: "SYE - REGIONAL"
 *         f150_descripcion_corta:
 *           type: string
 *           description: Descripción corta de la bodega
 *           example: "SYE - REGIONAL"
 *         f150_id_co:
 *           type: string
 *           description: ID del centro de operación
 *           example: "001"
 *         f150_id_instalacion:
 *           type: string
 *           description: ID de la instalación
 *           example: "001"
 *         f150_rowid_contacto:
 *           type: integer
 *           nullable: true
 *           description: ID del contacto asociado
 *           example: 33
 *         f150_ind_estado:
 *           type: integer
 *           description: Indicador de estado (1=Activo, 0=Inactivo)
 *           example: 1
 *         f150_ind_cntrl_existencia:
 *           type: integer
 *           description: Indicador de control de existencia
 *           example: 2
 *         f150_ind_multi_ubicacion:
 *           type: integer
 *           description: Indicador de múltiples ubicaciones
 *           example: 0
 *         f150_ind_lotes:
 *           type: integer
 *           description: Indicador de manejo de lotes
 *           example: 0
 *         f150_ind_costos:
 *           type: integer
 *           description: Indicador de costos
 *           example: 1
 *         f150_ind_facturable:
 *           type: integer
 *           description: Indicador si es facturable
 *           example: 1
 *         f150_ind_considerable_mrp:
 *           type: integer
 *           description: Indicador si se considera en MRP
 *           example: 0
 *         f150_notas:
 *           type: string
 *           nullable: true
 *           description: Notas adicionales
 *         f150_ind_exclusivo_pdv:
 *           type: integer
 *           description: Indicador si es exclusivo PDV
 *           example: 0
 *         f150_ind_cntrl_disponibilidad:
 *           type: integer
 *           description: Indicador de control de disponibilidad
 *           example: 0
 *     WarehousesResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Warehouse'
 *           description: Lista de bodegas
 *     SalesByWarehouse:
 *       type: object
 *       properties:
 *         IdBodega:
 *           type: integer
 *           description: ID único de la bodega
 *           example: 1
 *         NombreBodega:
 *           type: string
 *           description: Nombre de la bodega
 *           example: "SYE - REGIONAL"
 *         VentasTotales:
 *           type: number
 *           format: double
 *           description: Suma total de ventas brutas
 *           example: 5000000.00
 *         DescuentosTotales:
 *           type: number
 *           format: double
 *           description: Suma total de descuentos aplicados
 *           example: 150000.00
 *         ImpuestosTotales:
 *           type: number
 *           format: double
 *           description: Suma total de impuestos
 *           example: 400000.00
 *         MargenBruto:
 *           type: number
 *           format: double
 *           description: Margen bruto total (ventas - costo)
 *           example: 1200000.00
 *         DiasFacturacion:
 *           type: integer
 *           description: Número de días distintos con facturación
 *           example: 25
 *         PromedioDiarioFacturacion:
 *           type: number
 *           format: double
 *           description: Promedio diario de facturación
 *           example: 200000.00
 *     SalesByWarehouseResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SalesByWarehouse'
 *           description: Lista de ventas por bodega
 */

/**
 * @swagger
 * /api/warehouses:
 *   get:
 *     summary: Obtener todas las bodegas
 *     description: Retorna la lista completa de bodegas desde la tabla t150_mc_bodegas.
 *     tags: [Bodegas]
 *     responses:
 *       200:
 *         description: Lista de bodegas obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WarehousesResponse'
 *             example:
 *               success: true
 *               data:
 *                 - f150_rowid: 1
 *                   f150_id: "50"
 *                   f150_descripcion: "SYE - REGIONAL"
 *                   f150_descripcion_corta: "SYE - REGIONAL"
 *                   f150_id_co: "001"
 *                   f150_ind_estado: 1
 */

/**
 * @swagger
 * /api/warehouses/sales-report:
 *   get:
 *     summary: Obtener reporte de ventas por bodega
 *     description: Retorna un reporte detallado de ventas por bodega (punto de venta) incluyendo ventas totales, descuentos, impuestos, margen bruto, días de facturación y promedio diario de facturación. Los resultados están ordenados por ventas totales en orden descendente.
 *     tags: [Bodegas]
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
 *         description: Reporte de ventas por bodega obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SalesByWarehouseResponse'
 *             example:
 *               success: true
 *               data:
 *                 - IdBodega: 1
 *                   NombreBodega: "SYE - REGIONAL"
 *                   VentasTotales: 5000000.00
 *                   DescuentosTotales: 150000.00
 *                   ImpuestosTotales: 400000.00
 *                   MargenBruto: 1200000.00
 *                   DiasFacturacion: 25
 *                   PromedioDiarioFacturacion: 200000.00
 *                 - IdBodega: 2
 *                   NombreBodega: "SYE - LOCAL"
 *                   VentasTotales: 3000000.00
 *                   DescuentosTotales: 90000.00
 *                   ImpuestosTotales: 240000.00
 *                   MargenBruto: 750000.00
 *                   DiasFacturacion: 22
 *                   PromedioDiarioFacturacion: 136363.64
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
 *                   example: "Error al obtener el reporte de ventas por bodega"
 */
router.get('/', warehousesController.getWarehouses);
router.get('/sales-report', warehousesController.getSalesByWarehouse);

module.exports = router;

