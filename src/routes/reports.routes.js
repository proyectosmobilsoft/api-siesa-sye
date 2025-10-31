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
 *     MonthlySalesTrend:
 *       type: object
 *       properties:
 *         Periodo:
 *           type: integer
 *           description: Año y mes en formato YYYYMM
 *           example: 202501
 *         VentasTotales:
 *           type: number
 *           format: double
 *           description: Suma total de ventas brutas del periodo
 *           example: 15000000.00
 *         DescuentosTotales:
 *           type: number
 *           format: double
 *           description: Suma total de descuentos aplicados
 *           example: 500000.00
 *         ImpuestosTotales:
 *           type: number
 *           format: double
 *           description: Suma total de impuestos
 *           example: 1200000.00
 *         MargenBruto:
 *           type: number
 *           format: double
 *           description: Margen bruto total (ventas - costo)
 *           example: 3000000.00
 *     MonthlySalesTrendResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MonthlySalesTrend'
 *           description: Lista de tendencia mensual de ventas
 *     YearOverYearComparison:
 *       type: object
 *       properties:
 *         Anio:
 *           type: string
 *           description: Año del periodo
 *           example: "2024"
 *         VentasTotales:
 *           type: number
 *           format: double
 *           description: Ventas totales del año
 *           example: 180000000.00
 *         VentasAnioAnterior:
 *           type: number
 *           format: double
 *           nullable: true
 *           description: Ventas del año anterior (NULL para el primer año)
 *           example: 150000000.00
 *         VariacionPorcentualYoY:
 *           type: number
 *           format: double
 *           description: Variación porcentual año contra año (0 para el primer año)
 *           example: 20.0
 *     YearOverYearComparisonResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/YearOverYearComparison'
 *           description: Lista de comparación año contra año
 *     MonthOverMonthComparison:
 *       type: object
 *       properties:
 *         Periodo:
 *           type: integer
 *           description: Periodo en formato YYYYMM
 *           example: 202401
 *         VentasTotales:
 *           type: number
 *           format: double
 *           description: Ventas totales del mes
 *           example: 12000000.00
 *         VentasMesAnterior:
 *           type: number
 *           format: double
 *           nullable: true
 *           description: Ventas del mes anterior (NULL para el primer mes)
 *           example: 11000000.00
 *         VariacionPorcentualMoM:
 *           type: number
 *           format: double
 *           description: Variación porcentual mes contra mes (0 para el primer mes)
 *           example: 9.09
 *     MonthOverMonthComparisonResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MonthOverMonthComparison'
 *           description: Lista de comparación mes contra mes
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
/**
 * @swagger
 * /api/reports/monthly-sales-trend:
 *   get:
 *     summary: Obtener tendencia mensual de ventas
 *     description: Retorna la tendencia mensual de ventas agrupada por periodo (año-mes), incluyendo ventas totales, descuentos, impuestos y margen bruto. Los resultados están ordenados cronológicamente.
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: companyId
 *         required: false
 *         schema:
 *           type: integer
 *         default: 1
 *         description: ID de la compañía. Por defecto es 1.
 *     responses:
 *       200:
 *         description: Tendencia mensual de ventas obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MonthlySalesTrendResponse'
 *             example:
 *               success: true
 *               data:
 *                 - Periodo: 202401
 *                   VentasTotales: 12000000.00
 *                   DescuentosTotales: 400000.00
 *                   ImpuestosTotales: 960000.00
 *                   MargenBruto: 2400000.00
 *                 - Periodo: 202402
 *                   VentasTotales: 13500000.00
 *                   DescuentosTotales: 450000.00
 *                   ImpuestosTotales: 1080000.00
 *                   MargenBruto: 2700000.00
 *                 - Periodo: 202403
 *                   VentasTotales: 15000000.00
 *                   DescuentosTotales: 500000.00
 *                   ImpuestosTotales: 1200000.00
 *                   MargenBruto: 3000000.00
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
 *                   example: "Error al obtener la tendencia mensual de ventas"
 */
/**
 * @swagger
 * /api/reports/year-over-year:
 *   get:
 *     summary: Obtener comparativo año contra año (YoY)
 *     description: Retorna un comparativo de ventas año contra año, mostrando las ventas totales por año, las ventas del año anterior y la variación porcentual. Utiliza funciones de ventana para comparar cada año con el año previo.
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: companyId
 *         required: false
 *         schema:
 *           type: integer
 *         default: 1
 *         description: ID de la compañía. Por defecto es 1.
 *     responses:
 *       200:
 *         description: Comparativo año contra año obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/YearOverYearComparisonResponse'
 *             example:
 *               success: true
 *               data:
 *                 - Anio: "2022"
 *                   VentasTotales: 120000000.00
 *                   VentasAnioAnterior: null
 *                   VariacionPorcentualYoY: 0.0
 *                 - Anio: "2023"
 *                   VentasTotales: 150000000.00
 *                   VentasAnioAnterior: 120000000.00
 *                   VariacionPorcentualYoY: 25.0
 *                 - Anio: "2024"
 *                   VentasTotales: 180000000.00
 *                   VentasAnioAnterior: 150000000.00
 *                   VariacionPorcentualYoY: 20.0
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
 *                   example: "Error al obtener el comparativo año contra año"
 */
/**
 * @swagger
 * /api/reports/month-over-month:
 *   get:
 *     summary: Obtener variación porcentual de ventas mensuales (MoM)
 *     description: Retorna un comparativo de ventas mes contra mes, mostrando las ventas totales por mes, las ventas del mes anterior y la variación porcentual. Utiliza funciones de ventana para comparar cada mes con el mes previo.
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: companyId
 *         required: false
 *         schema:
 *           type: integer
 *         default: 1
 *         description: ID de la compañía. Por defecto es 1.
 *     responses:
 *       200:
 *         description: Comparativo mes contra mes obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MonthOverMonthComparisonResponse'
 *             example:
 *               success: true
 *               data:
 *                 - Periodo: 202401
 *                   VentasTotales: 11000000.00
 *                   VentasMesAnterior: null
 *                   VariacionPorcentualMoM: 0.0
 *                 - Periodo: 202402
 *                   VentasTotales: 12000000.00
 *                   VentasMesAnterior: 11000000.00
 *                   VariacionPorcentualMoM: 9.09
 *                 - Periodo: 202403
 *                   VentasTotales: 13500000.00
 *                   VentasMesAnterior: 12000000.00
 *                   VariacionPorcentualMoM: 12.5
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
 *                   example: "Error al obtener el comparativo mes contra mes"
 */
router.get('/vendors', reportsController.getVendors);
router.get('/monthly-sales-trend', reportsController.getMonthlySalesTrend);
router.get('/year-over-year', reportsController.getYearOverYearComparison);
router.get('/month-over-month', reportsController.getMonthOverMonthComparison);

module.exports = router;
