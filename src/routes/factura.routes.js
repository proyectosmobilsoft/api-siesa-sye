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
 *         Nombre Compañía:
 *           type: string
 *           description: Razón social de la compañía
 *           example: "CI DISTRIBUCIONES SYE S.A.S."
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
 *                   "Nombre Compañía": "CI DISTRIBUCIONES SYE S.A.S."
 *                   "Código Cuenta": "110505"
 *                   "Nombre de la Cuenta": "Caja General"
 *                   "Total Cuenta": 15000000.50
 *                   "Tipo de Saldo": "Deudor"
 *                 - Compañía: 1
 *                   "Nombre Compañía": "CI DISTRIBUCIONES SYE S.A.S."
 *                   "Código Cuenta": "210505"
 *                   "Nombre de la Cuenta": "Proveedores Nacionales"
 *                   "Total Cuenta": -12000000.25
 *                   "Tipo de Saldo": "Acreedor"
 *                 - Compañía: 1
 *                   "Nombre Compañía": "CI DISTRIBUCIONES SYE S.A.S."
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
 *         f350_id_cia:
 *           type: integer
 *           description: ID de la compañía
 *           example: 1
 *         f350_rowid:
 *           type: integer
 *           description: ID único del documento contable
 *           example: 831917
 *         f350_id_co:
 *           type: string
 *           description: ID del centro de operación
 *           example: "001"
 *         f350_id_tipo_docto:
 *           type: string
 *           description: ID del tipo de documento
 *           example: "RC"
 *         f350_consec_docto:
 *           type: integer
 *           description: Número consecutivo del documento
 *           example: 65637
 *         f350_prefijo:
 *           type: string
 *           nullable: true
 *           description: Prefijo del documento
 *           example: null
 *         f350_fecha:
 *           type: string
 *           format: date-time
 *           description: Fecha del documento
 *           example: "2025-05-15T00:00:00.000Z"
 *         f350_id_periodo:
 *           type: integer
 *           description: Periodo contable en formato YYYYMM
 *           example: 202505
 *         f350_rowid_tercero:
 *           type: integer
 *           description: ID del tercero (rowid)
 *           example: 29505
 *         f350_id_sucursal:
 *           type: string
 *           nullable: true
 *           description: ID de la sucursal
 *           example: null
 *         f350_total_db:
 *           type: number
 *           format: double
 *           description: Total débito del documento
 *           example: 5428017.00
 *         f350_total_cr:
 *           type: number
 *           format: double
 *           description: Total crédito del documento
 *           example: 5428017.00
 *         f350_id_clase_docto:
 *           type: integer
 *           description: ID de la clase de documento
 *           example: 13
 *         f350_ind_estado:
 *           type: integer
 *           description: Indicador de estado (1=Activo, 0=Inactivo)
 *           example: 1
 *         f350_ind_transmit:
 *           type: integer
 *           description: Indicador de transmisión
 *           example: 0
 *         f350_fecha_ts_creacion:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Fecha y hora de creación
 *           example: "2025-05-16T07:48:09.920Z"
 *         f350_fecha_ts_actualizacion:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Fecha y hora de actualización
 *           example: "2025-05-16T07:48:14.977Z"
 *         f350_fecha_ts_aprobacion:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Fecha y hora de aprobación
 *           example: "2025-05-16T07:48:14.977Z"
 *         f350_fecha_ts_anulacion:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Fecha y hora de anulación
 *           example: null
 *         f350_usuario_creacion:
 *           type: string
 *           nullable: true
 *           description: Usuario que creó el documento
 *           example: "ksalinas"
 *         f350_usuario_actualizacion:
 *           type: string
 *           nullable: true
 *           description: Usuario que actualizó el documento
 *           example: "ksalinas"
 *         f350_usuario_aprobacion:
 *           type: string
 *           nullable: true
 *           description: Usuario que aprobó el documento
 *           example: "ksalinas"
 *         f350_usuario_anulacion:
 *           type: string
 *           nullable: true
 *           description: Usuario que anuló el documento
 *           example: null
 *         f350_total_base_gravable:
 *           type: number
 *           format: double
 *           description: Total base gravable
 *           example: 0.00
 *         f350_ind_impresion:
 *           type: integer
 *           description: Indicador de impresión (1=Impreso, 0=No impreso)
 *           example: 1
 *         f350_nro_impresiones:
 *           type: integer
 *           description: Número de impresiones
 *           example: 1
 *         f350_fecha_ts_habilita_imp:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Fecha y hora de habilitación de impresión
 *           example: null
 *         f350_usuario_habilita_imp:
 *           type: string
 *           nullable: true
 *           description: Usuario que habilitó la impresión
 *           example: null
 *         f350_notas:
 *           type: string
 *           nullable: true
 *           description: Notas del documento
 *           example: "CANCELA"
 *         f350_rowid_docto_base:
 *           type: integer
 *           nullable: true
 *           description: RowID del documento base
 *           example: null
 *         f350_referencia:
 *           type: string
 *           nullable: true
 *           description: Referencia del documento
 *           example: null
 *         f350_id_mandato:
 *           type: string
 *           nullable: true
 *           description: ID del mandato
 *           example: null
 *         f350_rowid_movto_entidad:
 *           type: integer
 *           nullable: true
 *           description: RowID del movimiento de entidad
 *           example: null
 *         f350_id_motivo_otros:
 *           type: string
 *           nullable: true
 *           description: ID del motivo otros
 *           example: null
 *         f350_id_moneda_docto:
 *           type: string
 *           description: ID de la moneda del documento
 *           example: "COP"
 *         f350_id_moneda_conv:
 *           type: string
 *           description: ID de la moneda de conversión
 *           example: "COP"
 *         f350_ind_forma_conv:
 *           type: integer
 *           description: Indicador de forma de conversión
 *           example: 0
 *         f350_tasa_conv:
 *           type: number
 *           format: double
 *           description: Tasa de conversión
 *           example: 1.0000
 *         f350_id_moneda_local:
 *           type: string
 *           description: ID de la moneda local
 *           example: "COP"
 *         f350_ind_forma_local:
 *           type: integer
 *           description: Indicador de forma local
 *           example: 0
 *         f350_tasa_local:
 *           type: number
 *           format: double
 *           description: Tasa local
 *           example: 1.0000
 *         f350_id_tipo_cambio:
 *           type: string
 *           description: ID del tipo de cambio
 *           example: "001"
 *         f350_ind_cfd:
 *           type: integer
 *           description: Indicador CFD (Comprobante Fiscal Digital)
 *           example: 0
 *         f350_usuario_impresion:
 *           type: string
 *           nullable: true
 *           description: Usuario que imprimió el documento
 *           example: "ksalinas"
 *         f350_fecha_ts_impresion:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Fecha y hora de impresión
 *           example: "2025-05-16T07:48:18.793Z"
 *         f350_rowid_te_plantilla:
 *           type: integer
 *           nullable: true
 *           description: RowID de la plantilla
 *           example: null
 *         f350_total_db2:
 *           type: number
 *           format: double
 *           description: Total débito 2
 *           example: 5428017.00
 *         f350_total_cr2:
 *           type: number
 *           format: double
 *           description: Total crédito 2
 *           example: 5428017.00
 *         f350_total_db3:
 *           type: number
 *           format: double
 *           description: Total débito 3
 *           example: 5428017.00
 *         f350_total_cr3:
 *           type: number
 *           format: double
 *           description: Total crédito 3
 *           example: 5428017.00
 *         f350_ind_impto_asumido:
 *           type: integer
 *           description: Indicador de impuesto asumido
 *           example: 2
 *         f350_rowid_sesion:
 *           type: integer
 *           description: RowID de la sesión
 *           example: 340073
 *         f350_ind_tipo_origen:
 *           type: integer
 *           description: Indicador de tipo de origen
 *           example: 0
 *         f350_rowid_docto_rp:
 *           type: integer
 *           nullable: true
 *           description: RowID del documento RP
 *           example: null
 *         f350_id_proyecto:
 *           type: string
 *           nullable: true
 *           description: ID del proyecto
 *           example: null
 *         f350_ind_dif_cambio_forma:
 *           type: integer
 *           description: Indicador de diferencia de cambio forma
 *           example: 0
 *         f350_ind_clase_origen:
 *           type: integer
 *           description: Indicador de clase de origen
 *           example: 0
 *         f350_ind_envio_correo:
 *           type: integer
 *           description: Indicador de envío de correo
 *           example: 0
 *         f350_usuario_envio_correo:
 *           type: string
 *           nullable: true
 *           description: Usuario que envió el correo
 *           example: null
 *         f350_fecha_ts_envio_correo:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Fecha y hora de envío de correo
 *           example: null
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
 *         total:
 *           type: integer
 *           description: Total de registros que cumplen con los filtros (siempre presente)
 *           example: 5000
 *         pagination:
 *           type: object
 *           description: Información de paginación (solo si se usan parámetros page y pageSize)
 *           properties:
 *             page:
 *               type: integer
 *               description: Página actual
 *               example: 1
 *             pageSize:
 *               type: integer
 *               description: Tamaño de página
 *               example: 100
 *             total:
 *               type: integer
 *               description: Total de registros
 *               example: 5000
 *             totalPages:
 *               type: integer
 *               description: Total de páginas
 *               example: 50
 */

/**
 * @swagger
 * /api/factura/facturas:
 *   get:
 *     summary: Obtener listado de facturas
 *     description: Retorna el listado de facturas ordenadas por fecha de factura de forma descendente. Solo incluye documentos tipo factura. Soporta filtro opcional por tercero y paginación para optimizar el rendimiento. Si se proporciona page sin pageSize, se usará pageSize=100 por defecto.
 *     tags: [Factura]
 *     parameters:
 *       - in: query
 *         name: id_tercero
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID del tercero (rowid) para filtrar facturas. Si se proporciona, solo retorna facturas de ese tercero específico.
 *         example: 12345
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número de página para paginación. Si se proporciona sin pageSize, se usará pageSize=100 por defecto.
 *         example: 1
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5000
 *           default: 100
 *         description: Cantidad de registros por página. Valor por defecto 100 cuando se proporciona page. Máximo 5000.
 *         example: 100
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
 *                 - f350_id_cia: 1
 *                   f350_rowid: 831917
 *                   f350_id_co: "001"
 *                   f350_id_tipo_docto: "RC"
 *                   f350_consec_docto: 65637
 *                   f350_prefijo: null
 *                   f350_fecha: "2025-05-15T00:00:00.000Z"
 *                   f350_id_periodo: 202505
 *                   f350_rowid_tercero: 29505
 *                   f350_id_sucursal: null
 *                   f350_total_db: 5428017.00
 *                   f350_total_cr: 5428017.00
 *                   f350_id_clase_docto: 13
 *                   f350_ind_estado: 1
 *                   f350_ind_transmit: 0
 *                   f350_fecha_ts_creacion: "2025-05-16T07:48:09.920Z"
 *                   f350_fecha_ts_actualizacion: "2025-05-16T07:48:14.977Z"
 *                   f350_fecha_ts_aprobacion: "2025-05-16T07:48:14.977Z"
 *                   f350_fecha_ts_anulacion: null
 *                   f350_usuario_creacion: "ksalinas"
 *                   f350_usuario_actualizacion: "ksalinas"
 *                   f350_usuario_aprobacion: "ksalinas"
 *                   f350_usuario_anulacion: null
 *                   f350_total_base_gravable: 0.00
 *                   f350_ind_impresion: 1
 *                   f350_nro_impresiones: 1
 *                   f350_fecha_ts_habilita_imp: null
 *                   f350_usuario_habilita_imp: null
 *                   f350_notas: "CANCELA"
 *                   f350_rowid_docto_base: null
 *                   f350_referencia: null
 *                   f350_id_mandato: null
 *                   f350_rowid_movto_entidad: null
 *                   f350_id_motivo_otros: null
 *                   f350_id_moneda_docto: "COP"
 *                   f350_id_moneda_conv: "COP"
 *                   f350_ind_forma_conv: 0
 *                   f350_tasa_conv: 1.0000
 *                   f350_id_moneda_local: "COP"
 *                   f350_ind_forma_local: 0
 *                   f350_tasa_local: 1.0000
 *                   f350_id_tipo_cambio: "001"
 *                   f350_ind_cfd: 0
 *                   f350_usuario_impresion: "ksalinas"
 *                   f350_fecha_ts_impresion: "2025-05-16T07:48:18.793Z"
 *                   f350_rowid_te_plantilla: null
 *                   f350_total_db2: 5428017.00
 *                   f350_total_cr2: 5428017.00
 *                   f350_total_db3: 5428017.00
 *                   f350_total_cr3: 5428017.00
 *                   f350_ind_impto_asumido: 2
 *                   f350_rowid_sesion: 340073
 *                   f350_ind_tipo_origen: 0
 *                   f350_rowid_docto_rp: null
 *                   f350_id_proyecto: null
 *                   f350_ind_dif_cambio_forma: 0
 *                   f350_ind_clase_origen: 0
 *                   f350_ind_envio_correo: 0
 *                   f350_usuario_envio_correo: null
 *                   f350_fecha_ts_envio_correo: null
 *               total: 5000
 *               pagination:
 *                 page: 1
 *                 pageSize: 100
 *                 total: 5000
 *                 totalPages: 50
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

