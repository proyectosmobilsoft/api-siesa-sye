const express = require('express');
const router = express.Router();
const facturaController = require('../controllers/factura.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     EstadoFinanciero:
 *       type: object
 *       properties:
 *         Compañía:
 *           type: integer
 *           description: ID de la compañía
 *           example: 1
 *         Código Cuenta:
 *           type: string
 *           description: Código de la cuenta auxiliar
 *           example: "110505"
 *         Nombre de la Cuenta:
 *           type: string
 *           description: Descripción o nombre de la cuenta
 *           example: "Caja General"
 *         Total Cuenta:
 *           type: number
 *           format: double
 *           description: Suma total del valor neto de la cuenta
 *           example: 15000000.50
 *         Tipo de Saldo:
 *           type: string
 *           description: Tipo de saldo según el valor total
 *           enum: [Deudor, Acreedor, Saldo Cero]
 *           example: "Deudor"
 *     EstadosFinancierosResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EstadoFinanciero'
 *           description: Lista de estados financieros agrupados por cuenta auxiliar con información de compañía
 */

/**
 * @swagger
 * /api/factura/estados-financieros:
 *   get:
 *     summary: Obtener estados financieros
 *     description: Retorna el reporte de estados financieros agrupado por cuenta auxiliar, sumando los valores netos del periodo especificado, ordenados por el total de cuenta de forma descendente.
 *     tags: [Factura]
 *     parameters:
 *       - in: query
 *         name: periodoInicial
 *         required: false
 *         schema:
 *           type: integer
 *           format: YYYYMM
 *         default: 202401
 *         description: Periodo inicial en formato YYYYMM (año-mes). Por defecto es 202401.
 *         example: 202401
 *       - in: query
 *         name: periodoFinal
 *         required: false
 *         schema:
 *           type: integer
 *           format: YYYYMM
 *         default: 202412
 *         description: Periodo final en formato YYYYMM (año-mes). Por defecto es 202412.
 *         example: 202412
 *     responses:
 *       200:
 *         description: Estados financieros obtenidos exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EstadosFinancierosResponse'
 *             example:
 *               success: true
 *               data:
 *                 - Compañía: 1
 *                   "Código Cuenta": "110505"
 *                   "Nombre de la Cuenta": "Caja General"
 *                   "Total Cuenta": 15000000.50
 *                   "Tipo de Saldo": "Deudor"
 *                 - Compañía: 1
 *                   "Código Cuenta": "210505"
 *                   "Nombre de la Cuenta": "Proveedores Nacionales"
 *                   "Total Cuenta": -12000000.25
 *                   "Tipo de Saldo": "Acreedor"
 *                 - Compañía: 1
 *                   "Código Cuenta": "411505"
 *                   "Nombre de la Cuenta": "Ingresos por Ventas"
 *                   "Total Cuenta": 9500000.75
 *                   "Tipo de Saldo": "Deudor"
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
 *                   example: "Error al obtener los estados financieros"
 */
router.get('/estados-financieros', facturaController.getEstadosFinancieros);

/**
 * @swagger
 * components:
 *   schemas:
 *     Factura:
 *       type: object
 *       properties:
 *         IdCompania:
 *           type: integer
 *           description: ID de la compañía
 *           example: 1
 *         NumeroFactura:
 *           type: string
 *           description: Número de la factura
 *           example: "FV-2024-001234"
 *         FechaFactura:
 *           type: string
 *           format: date-time
 *           description: Fecha de la factura
 *           example: "2024-03-15T00:00:00.000Z"
 *         IdTercero:
 *           type: string
 *           description: ID del tercero/cliente
 *           example: "12345"
 *         NombreCliente:
 *           type: string
 *           description: Razón social del cliente
 *           example: "EMPRESA COMERCIAL S.A.S"
 *         TipoDocumento:
 *           type: string
 *           description: Tipo de documento
 *           example: "Factura de Venta"
 *         CodigoCuenta:
 *           type: string
 *           description: Código de la cuenta contable
 *           example: "411505"
 *         NombreCuenta:
 *           type: string
 *           description: Nombre de la cuenta contable
 *           example: "Ingresos por Ventas"
 *         ValorDebito:
 *           type: number
 *           format: double
 *           description: Valor débito de la factura
 *           example: 1000000.00
 *         ValorCredito:
 *           type: number
 *           format: double
 *           description: Valor crédito de la factura
 *           example: 0.00
 *         ValorNeto:
 *           type: number
 *           format: double
 *           description: Valor neto de la factura
 *           example: 1000000.00
 *         PeriodoContable:
 *           type: integer
 *           description: Periodo contable en formato YYYYMM
 *           example: 202403
 *     FacturasResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Factura'
 *           description: Lista de facturas filtradas por periodo
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *               description: Página actual
 *               example: 1
 *             pageSize:
 *               type: integer
 *               description: Tamaño de página
 *               example: 1000
 *             total:
 *               type: integer
 *               description: Total de registros
 *               example: 5000
 *             totalPages:
 *               type: integer
 *               description: Total de páginas
 *               example: 5
 */

/**
 * @swagger
 * /api/factura/facturas:
 *   get:
 *     summary: Obtener listado de facturas
 *     description: Retorna el listado de facturas filtradas por periodo contable, ordenadas por fecha de factura de forma descendente. Solo incluye documentos tipo factura. Incluye paginación para optimizar el rendimiento. Por defecto retorna 1000 registros por página.
 *     tags: [Factura]
 *     parameters:
 *       - in: query
 *         name: periodoInicial
 *         required: false
 *         schema:
 *           type: integer
 *           format: YYYYMM
 *         default: 202401
 *         description: Periodo inicial en formato YYYYMM (año-mes). Por defecto es 202401.
 *         example: 202401
 *       - in: query
 *         name: periodoFinal
 *         required: false
 *         schema:
 *           type: integer
 *           format: YYYYMM
 *         default: 202412
 *         description: Periodo final en formato YYYYMM (año-mes). Por defecto es 202412.
 *         example: 202412
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 1
 *         description: Número de página para paginación. Por defecto es 1.
 *         example: 1
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5000
 *         default: 1000
 *         description: Cantidad de registros por página. Por defecto es 1000, máximo 5000.
 *         example: 1000
 *     responses:
 *       200:
 *         description: Listado de facturas obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FacturasResponse'
 *             example:
 *               success: true
 *               data:
 *                 - IdCompania: 1
 *                   NumeroFactura: "FV-2024-001234"
 *                   FechaFactura: "2024-03-15T00:00:00.000Z"
 *                   IdTercero: "12345"
 *                   NombreCliente: "EMPRESA COMERCIAL S.A.S"
 *                   TipoDocumento: "Factura de Venta"
 *                   CodigoCuenta: "411505"
 *                   NombreCuenta: "Ingresos por Ventas"
 *                   ValorDebito: 1000000.00
 *                   ValorCredito: 0.00
 *                   ValorNeto: 1000000.00
 *                   PeriodoContable: 202403
 *                 - IdCompania: 1
 *                   NumeroFactura: "FV-2024-001235"
 *                   FechaFactura: "2024-03-14T00:00:00.000Z"
 *                   IdTercero: "12346"
 *                   NombreCliente: "DISTRIBUIDORA ABC LTDA"
 *                   TipoDocumento: "Factura de Venta"
 *                   CodigoCuenta: "411505"
 *                   NombreCuenta: "Ingresos por Ventas"
 *                   ValorDebito: 850000.00
 *                   ValorCredito: 0.00
 *                   ValorNeto: 850000.00
 *                   PeriodoContable: 202403
 *               pagination:
 *                 page: 1
 *                 pageSize: 1000
 *                 total: 5000
 *                 totalPages: 5
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
 *                   example: "Error al obtener las facturas"
 */
router.get('/facturas', facturaController.getFacturas);

/**
 * @swagger
 * components:
 *   schemas:
 *     EstadoResultado:
 *       type: object
 *       properties:
 *         TipoCuenta:
 *           type: string
 *           description: Tipo de cuenta según el primer dígito del código auxiliar
 *           enum: [Ingresos, Costos, Gastos, Otros]
 *           example: "Ingresos"
 *         Cuenta:
 *           type: string
 *           description: Nombre de la cuenta contable
 *           example: "Ingresos por Ventas"
 *         Total:
 *           type: number
 *           format: double
 *           description: Suma total del valor neto de la cuenta
 *           example: 15000000.50
 *     EstadoResultadosResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EstadoResultado'
 *           description: Lista de cuentas agrupadas por tipo para el Estado de Resultados
 */

/**
 * @swagger
 * /api/factura/perdidas-ganancias:
 *   get:
 *     summary: Obtener Estado de Resultados (Pérdidas y Ganancias)
 *     description: Retorna el Estado de Resultados agrupado por tipo de cuenta (Ingresos, Costos, Gastos, Otros) según el primer dígito del código auxiliar. Las cuentas se clasifican automáticamente - código 4xxx para Ingresos, 5xxx para Costos, 6xxx para Gastos, otros para Otros.
 *     tags: [Factura]
 *     parameters:
 *       - in: query
 *         name: periodoInicial
 *         required: false
 *         schema:
 *           type: integer
 *           format: YYYYMM
 *         default: 202401
 *         description: Periodo inicial en formato YYYYMM (año-mes). Por defecto es 202401.
 *         example: 202401
 *       - in: query
 *         name: periodoFinal
 *         required: false
 *         schema:
 *           type: integer
 *           format: YYYYMM
 *         default: 202412
 *         description: Periodo final en formato YYYYMM (año-mes). Por defecto es 202412.
 *         example: 202412
 *     responses:
 *       200:
 *         description: Estado de Resultados obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EstadoResultadosResponse'
 *             example:
 *               success: true
 *               data:
 *                 - TipoCuenta: "Ingresos"
 *                   Cuenta: "Ingresos por Ventas"
 *                   Total: 15000000.50
 *                 - TipoCuenta: "Ingresos"
 *                   Cuenta: "Otros Ingresos"
 *                   Total: 500000.00
 *                 - TipoCuenta: "Costos"
 *                   Cuenta: "Costo de Ventas"
 *                   Total: -8500000.25
 *                 - TipoCuenta: "Gastos"
 *                   Cuenta: "Gastos Administrativos"
 *                   Total: -2500000.00
 *                 - TipoCuenta: "Gastos"
 *                   Cuenta: "Gastos de Ventas"
 *                   Total: -1200000.00
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
 *                   example: "Error al obtener el Estado de Resultados"
 */
router.get('/perdidas-ganancias', facturaController.getEstadoResultados);

/**
 * @swagger
 * components:
 *   schemas:
 *     TendenciaMensual:
 *       type: object
 *       properties:
 *         Periodo:
 *           type: integer
 *           description: Periodo contable en formato YYYYMM
 *           example: 202401
 *         Ingresos:
 *           type: number
 *           format: double
 *           description: Suma de ingresos del periodo (cuentas código 4xxx)
 *           example: 15000000.50
 *         Costos:
 *           type: number
 *           format: double
 *           description: Suma de costos del periodo (cuentas código 5xxx)
 *           example: 8500000.25
 *         Gastos:
 *           type: number
 *           format: double
 *           description: Suma de gastos del periodo (cuentas código 6xxx)
 *           example: 2500000.00
 *         Utilidad:
 *           type: number
 *           format: double
 *           description: Utilidad neta calculada (Ingresos - Costos - Gastos)
 *           example: 4000000.25
 *     TendenciaMensualResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TendenciaMensual'
 *           description: Lista de tendencia mensual de ingresos, costos y gastos
 */

/**
 * @swagger
 * /api/factura/tendencia-mensual:
 *   get:
 *     summary: Obtener Tendencia Mensual de Ingresos, Costos y Gastos
 *     description: Retorna la tendencia mensual de ingresos, costos y gastos agrupados por periodo contable. Calcula automáticamente la utilidad como Ingresos menos Costos y Gastos.
 *     tags: [Factura]
 *     parameters:
 *       - in: query
 *         name: periodoInicial
 *         required: false
 *         schema:
 *           type: integer
 *           format: YYYYMM
 *         default: 202401
 *         description: Periodo inicial en formato YYYYMM (año-mes). Por defecto es 202401.
 *         example: 202401
 *       - in: query
 *         name: periodoFinal
 *         required: false
 *         schema:
 *           type: integer
 *           format: YYYYMM
 *         default: 202412
 *         description: Periodo final en formato YYYYMM (año-mes). Por defecto es 202412.
 *         example: 202412
 *     responses:
 *       200:
 *         description: Tendencia mensual obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TendenciaMensualResponse'
 *             example:
 *               success: true
 *               data:
 *                 - Periodo: 202401
 *                   Ingresos: 12000000.00
 *                   Costos: 7000000.00
 *                   Gastos: 2000000.00
 *                   Utilidad: 3000000.00
 *                 - Periodo: 202402
 *                   Ingresos: 13500000.50
 *                   Costos: 8000000.25
 *                   Gastos: 2200000.00
 *                   Utilidad: 3300000.25
 *                 - Periodo: 202403
 *                   Ingresos: 15000000.00
 *                   Costos: 8500000.50
 *                   Gastos: 2500000.00
 *                   Utilidad: 4000000.50
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
 *                   example: "Error al obtener la tendencia mensual"
 */
router.get('/tendencia-mensual', facturaController.getTendenciaMensual);

module.exports = router;

