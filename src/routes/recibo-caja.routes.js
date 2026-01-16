const express = require("express");
const router = express.Router();
const reciboCajaController = require("../controllers/recibo-caja.controller");

/**
 * @swagger
 * components:
 *   schemas:
 *     ReciboCajaRequest:
 *       type: object
 *       required:
 *         - p_cia
 *         - p_fecha
 *         - p_clase_modulo
 *         - p_rowid_usuario
 *         - p_id_co
 *         - p_id_tipo_docto
 *         - p_numero_docto
 *         - p_clase_docto
 *         - p_rowid_tercero
 *         - p_periodo_docto
 *         - p_notas
 *         - p_usuario
 *         - p_id_caja
 *         - p_moneda
 *         - p_valor
 *         - p_rowid_cobrador
 *         - p_rowid_fe
 *         - p_id_un
 *         - p_id_medio_pago
 *         - p_id_cta_bancaria
 *         - p_referencia_med
 *         - p_rowid_sa
 *         - p_rowid_sa
 *       properties:
 *         p_cia:
 *           type: integer
 *           description: ID de la compañía
 *           example: 1
 *         p_fecha:
 *           type: string
 *           format: date-time
 *           description: Fecha del documento
 *           example: "2026-01-14T00:00:00Z"
 *         p_clase_modulo:
 *           type: integer
 *           description: Clase del módulo
 *           example: 2
 *         p_rowid_usuario:
 *           type: integer
 *           description: RowID del usuario
 *           example: 1133
 *         p_id_co:
 *           type: string
 *           maxLength: 3
 *           description: ID del centro operativo
 *           example: "001"
 *         p_id_tipo_docto:
 *           type: string
 *           maxLength: 3
 *           description: ID del tipo de documento
 *           example: "RCC"
 *         p_numero_docto:
 *           type: integer
 *           description: Número del documento
 *           example: 10583
 *         p_clase_docto:
 *           type: integer
 *           description: Clase del documento
 *           example: 13
 *         p_rowid_tercero:
 *           type: integer
 *           description: RowID del tercero
 *           example: 34580
 *         p_periodo_docto:
 *           type: integer
 *           description: Período del documento (formato YYYYMM)
 *           example: 202601
 *         p_prefijo:
 *           type: string
 *           maxLength: 4
 *           description: Prefijo del documento (opcional)
 *           example: ""
 *         p_notas:
 *           type: string
 *           maxLength: 255
 *           description: Notas del documento
 *           example: "test 001"
 *         p_usuario:
 *           type: string
 *           maxLength: 50
 *           description: Usuario
 *           example: "lgarzon"
 *         p_id_caja:
 *           type: string
 *           maxLength: 3
 *           description: ID de caja
 *           example: "001"
 *         p_moneda:
 *           type: string
 *           maxLength: 3
 *           description: Moneda
 *           example: "COP"
 *         p_valor:
 *           type: number
 *           format: double
 *           description: Valor del recibo
 *           example: 1002.00
 *         p_rowid_cobrador:
 *           type: integer
 *           description: RowID del cobrador
 *           example: 74
 *         p_rowid_fe:
 *           type: integer
 *           description: RowID de fuente
 *           example: 3
 *         p_id_un:
 *           type: string
 *           maxLength: 3
 *           description: ID unidad
 *           example: "99"
 *         p_id_medio_pago:
 *           type: string
 *           maxLength: 10
 *           description: ID medio de pago
 *           example: "CG1"
 *         p_id_cta_bancaria:
 *           type: string
 *           maxLength: 10
 *           description: ID cuenta bancaria
 *           example: "27"
 *         p_referencia_med:
 *           type: string
 *           maxLength: 50
 *           description: Referencia del medio de pago
 *           example: "20260114"
 *         p_rowid_sa:
 *           type: integer
 *           description: RowID SA
 *           example: 264651
 *     ReciboCajaResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Recibo de caja procesado exitosamente"
 *         data:
 *           type: object
 *           properties:
 *             sp_docto_insertar:
 *               type: object
 *               properties:
 *                 p_rowid:
 *                   type: integer
 *                 p_timestamp:
 *                   type: string
 *                   format: date-time
 *             sp_mov_docto_insertar:
 *               type: object
 *               properties:
 *                 RowId:
 *                   type: integer
 *             sp_rel_med_pag_insertar:
 *               type: object
 *               properties:
 *                 p_rowid:
 *                   type: integer
 *             sp_let_movto_adicionar:
 *               type: object
 *               properties:
 *                 p_error:
 *                   type: integer
 *                 p_des_error:
 *                   type: string
 *                 p_des_error2:
 *                   type: string
 *             sp_docto_actualizar_estado:
 *               type: object
 *               properties:
 *                 p_error:
 *                   type: integer
 *                 p_des_error:
 *                   type: string
 *                 p_id_cia:
 *                   type: integer
 *                 p_id_co:
 *                   type: string
 *                 p_id_tipo_docto:
 *                   type: string
 *                 p_numero_docto:
 *                   type: integer
 *                 p_ind_cfdi:
 *                   type: integer
 */

/**
 * @swagger
 * /api/recibo-caja/procesar:
 *   post:
 *     summary: Procesar recibo de caja
 *     description: |
 *       Ejecuta un script SQL completo para procesar un recibo de caja. El script ejecuta una secuencia
 *       de stored procedures que incluyen validaciones, inserción de documento, movimientos contables,
 *       medios de pago y actualización de estado. Si alguno de los procedimientos falla, se hace rollback
 *       de toda la transacción.
 *     tags: [Recibo de Caja]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReciboCajaRequest'
 *           example:
 *             p_cia: 1
 *             p_fecha: "2026-01-14T00:00:00Z"
 *             p_clase_modulo: 2
 *             p_rowid_usuario: 1133
 *             p_id_co: "001"
 *             p_id_tipo_docto: "RCC"
 *             p_numero_docto: 10583
 *             p_clase_docto: 13
 *             p_rowid_tercero: 34580
 *             p_periodo_docto: 202601
 *             p_prefijo: ""
 *             p_notas: "test 001"
 *             p_usuario: "lgarzon"
 *             p_id_caja: "001"
 *             p_moneda: "COP"
 *             p_valor: 1002.00
 *             p_rowid_cobrador: 74
 *             p_rowid_fe: 3
 *             p_id_un: "99"
 *             p_id_medio_pago: "CG1"
 *             p_id_cta_bancaria: "27"
 *             p_referencia_med: "20260114"
 *             p_rowid_sa: null
 *     responses:
 *       200:
 *         description: Recibo de caja procesado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReciboCajaResponse'
 *             example:
 *               success: true
 *               message: "Recibo de caja procesado exitosamente"
 *               data: []
 *       400:
 *         description: Error en los parámetros de entrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Parámetros requeridos faltantes: p_cia, p_fecha"
 *       500:
 *         description: Error al procesar el recibo de caja
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error ejecutando script SQL: [mensaje de error]"
 */
router.post("/procesar", reciboCajaController.procesarReciboCaja);

/**
 * @swagger
 * /api/recibo-caja/proximo-consecutivo:
 *   get:
 *     summary: Consultar consecutivo siguiente de recibos de caja
 *     description: Consulta el próximo consecutivo disponible para un tipo de recibo de caja mediante el stored procedure sp_tipo_docto_leer_proximo
 *     tags:
 *       - Recibo de Caja
 *     parameters:
 *       - in: query
 *         name: id_cia
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID de compañía
 *       - in: query
 *         name: id_tipo_docto
 *         required: true
 *         schema:
 *           type: string
 *           example: RCC
 *         description: Tipo de documento
 *       - in: query
 *         name: id_co
 *         required: true
 *         schema:
 *           type: string
 *           example: "001"
 *         description: Centro de operación
 *       - in: query
 *         name: p_bloquear
 *         required: false
 *         schema:
 *           type: integer
 *           default: 0
 *           enum: [0, 1]
 *         description: 0 solo consulta, 1 bloquea
 *       - in: query
 *         name: p_leer_mandato_tipo
 *         required: false
 *         schema:
 *           type: integer
 *           default: 0
 *         description: 0 para documento estándar
 *     responses:
 *       200:
 *         description: Respuesta exitosa con el consecutivo siguiente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 proximoConsecutivo:
 *                   type: object
 *                   description: Información devuelta por el SP
 *                 p_ind_mandato_tipo:
 *                   type: integer
 *                   description: Indicador mandato tipo
 *             examples:
 *               ejemplo1:
 *                 value:
 *                   success: true
 *                   proximoConsecutivo:
 *                     consecutivo: 68434
 *                   p_ind_mandato_tipo: 0
 *       400:
 *         description: Error de parámetros o consulta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Parámetros requeridos faltantes"
 *       500:
 *         description: Error del servidor o de la base de datos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error al ejecutar sp_tipo_docto_leer_proximo"
 */
router.get("/proximo-consecutivo", reciboCajaController.getProximoConsecutivoRC);

module.exports = router;

