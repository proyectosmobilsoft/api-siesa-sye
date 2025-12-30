const express = require('express');
const router = express.Router();
const reciboCajaController = require('../controllers/recibo-caja.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     ReciboCajaRequest:
 *       type: object
 *       required:
 *         - id_cia
 *         - id_co
 *         - id_tipo_docto
 *         - consec_docto
 *         - prefijo
 *         - fecha
 *         - periodo
 *         - rowid_tercero
 *         - sucursal
 *         - total_db
 *         - total_cr
 *         - ind_origen
 *         - ind_estado
 *         - ind_transmit
 *         - fecha_creacion
 *         - fecha_actualiza
 *         - fecha_afectado
 *         - notas
 *         - p_estado
 *         - id_un
 *         - rowid_auxiliar
 *         - rowid_ccosto
 *         - rowid_fe
 *         - id_co_mov
 *         - valor_db
 *         - valor_cr
 *         - docto_banco
 *         - nro_docto_banco
 *         - id_medios_pago
 *         - valor
 *         - id_banco
 *         - nro_cheque
 *         - nro_cuenta
 *         - cod_seguridad
 *         - nro_autorizacion
 *         - fecha_vcto
 *         - id_cuentas_bancarias
 *         - fecha_consignacion
 *         - rowid_docto_consignacion
 *         - rowid_mov_docto_consignacion
 *         - id_causales_devolucion
 *         - id_sucursal
 *         - p_rowid_docto_letra
 *         - p_id_ubicacion_origen
 *         - p_id_ubicacion_destino
 *         - p_rowid_sa_origen
 *         - p_rowid_sa_destino
 *         - p_id_cuenta_bancaria
 *       properties:
 *         id_cia:
 *           type: integer
 *           description: ID de la compañía
 *         id_co:
 *           type: string
 *           maxLength: 3
 *           description: ID del centro operativo
 *         id_tipo_docto:
 *           type: string
 *           maxLength: 3
 *           description: ID del tipo de documento
 *         consec_docto:
 *           type: integer
 *           description: Consecutivo del documento
 *         prefijo:
 *           type: string
 *           maxLength: 4
 *           description: Prefijo del documento
 *         fecha:
 *           type: string
 *           format: date-time
 *           description: Fecha del documento
 *         periodo:
 *           type: integer
 *           description: Período contable
 *         rowid_tercero:
 *           type: integer
 *           description: RowID del tercero
 *         sucursal:
 *           type: string
 *           maxLength: 3
 *           description: Sucursal
 *         total_db:
 *           type: number
 *           format: double
 *           description: Total débito
 *         total_cr:
 *           type: number
 *           format: double
 *           description: Total crédito
 *         ind_origen:
 *           type: integer
 *           description: Indicador de origen
 *         ind_estado:
 *           type: integer
 *           description: Indicador de estado
 *         ind_transmit:
 *           type: integer
 *           description: Indicador de transmisión
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         fecha_actualiza:
 *           type: string
 *           format: date-time
 *           description: Fecha de actualización
 *         fecha_afectado:
 *           type: string
 *           format: date-time
 *           description: Fecha afectado
 *         notas:
 *           type: string
 *           maxLength: 255
 *           description: Notas del documento
 *         p_estado:
 *           type: integer
 *           description: Estado para actualizar (requerido para sp_docto_actualizar_estado)
 *         id_un:
 *           type: string
 *           description: ID unidad (requerido para sp_mov_docto_insertar)
 *         rowid_auxiliar:
 *           type: integer
 *           description: RowID auxiliar (requerido para sp_mov_docto_insertar y sp_rel_med_pag_insertar)
 *         rowid_ccosto:
 *           type: integer
 *           description: RowID centro de costo (requerido para sp_mov_docto_insertar y sp_rel_med_pag_insertar)
 *         rowid_fe:
 *           type: integer
 *           description: RowID fuente (requerido para sp_mov_docto_insertar y sp_rel_med_pag_insertar)
 *         id_co_mov:
 *           type: string
 *           maxLength: 3
 *           description: ID centro operativo movimiento (requerido para sp_mov_docto_insertar)
 *         valor_db:
 *           type: number
 *           format: double
 *           description: Valor débito (requerido para sp_mov_docto_insertar)
 *         valor_cr:
 *           type: number
 *           format: double
 *           description: Valor crédito (requerido para sp_mov_docto_insertar)
 *         docto_banco:
 *           type: string
 *           maxLength: 2
 *           description: Documento banco (requerido para sp_mov_docto_insertar)
 *         nro_docto_banco:
 *           type: integer
 *           description: Número documento banco (requerido para sp_mov_docto_insertar)
 *         id_medios_pago:
 *           type: string
 *           maxLength: 3
 *           description: ID medios de pago (requerido para sp_rel_med_pag_insertar)
 *         valor:
 *           type: number
 *           format: double
 *           description: Valor (requerido para sp_rel_med_pag_insertar)
 *         id_banco:
 *           type: string
 *           maxLength: 10
 *           description: ID banco (requerido para sp_rel_med_pag_insertar)
 *         nro_cheque:
 *           type: integer
 *           description: Número cheque (requerido para sp_rel_med_pag_insertar)
 *         nro_cuenta:
 *           type: string
 *           maxLength: 25
 *           description: Número cuenta (requerido para sp_rel_med_pag_insertar)
 *         cod_seguridad:
 *           type: string
 *           maxLength: 3
 *           description: Código seguridad (requerido para sp_rel_med_pag_insertar)
 *         nro_autorizacion:
 *           type: string
 *           maxLength: 10
 *           description: Número autorización (requerido para sp_rel_med_pag_insertar)
 *         fecha_vcto:
 *           type: string
 *           maxLength: 8
 *           description: Fecha vencimiento (requerido para sp_rel_med_pag_insertar)
 *         id_cuentas_bancarias:
 *           type: string
 *           maxLength: 3
 *           description: ID cuentas bancarias (requerido para sp_rel_med_pag_insertar)
 *         fecha_consignacion:
 *           type: string
 *           format: date-time
 *           description: Fecha consignación (requerido para sp_rel_med_pag_insertar)
 *         rowid_docto_consignacion:
 *           type: integer
 *           description: RowID documento consignación (requerido para sp_rel_med_pag_insertar)
 *         rowid_mov_docto_consignacion:
 *           type: integer
 *           description: RowID movimiento documento consignación (requerido para sp_rel_med_pag_insertar)
 *         id_causales_devolucion:
 *           type: string
 *           maxLength: 3
 *           description: ID causales devolución (requerido para sp_rel_med_pag_insertar)
 *         id_sucursal:
 *           type: string
 *           maxLength: 3
 *           description: ID sucursal (requerido para sp_rel_med_pag_insertar)
 *         p_rowid_docto_letra:
 *           type: integer
 *           description: RowID documento letra (requerido para sp_let_movto_adicionar)
 *         p_id_ubicacion_origen:
 *           type: string
 *           maxLength: 3
 *           description: ID ubicación origen (requerido para sp_let_movto_adicionar)
 *         p_id_ubicacion_destino:
 *           type: string
 *           maxLength: 3
 *           description: ID ubicación destino (requerido para sp_let_movto_adicionar)
 *         p_rowid_sa_origen:
 *           type: integer
 *           description: RowID SA origen (requerido para sp_let_movto_adicionar)
 *         p_rowid_sa_destino:
 *           type: integer
 *           description: RowID SA destino (requerido para sp_let_movto_adicionar)
 *         p_id_cuenta_bancaria:
 *           type: string
 *           maxLength: 3
 *           description: ID cuenta bancaria (requerido para sp_let_movto_adicionar)
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
 *       Ejecuta una secuencia de 5 stored procedures de forma secuencial para procesar un recibo de caja.
 *       Los procedimientos se ejecutan en el siguiente orden:
 *       1. sp_docto_insertar - Inserta el documento
 *       2. sp_mov_docto_insertar - Inserta el movimiento del documento
 *       3. sp_rel_med_pag_insertar - Inserta la relación de medios de pago
 *       4. sp_let_movto_adicionar - Adiciona movimiento de letra
 *       5. sp_docto_actualizar_estado - Actualiza el estado del documento
 *       
 *       Si alguno de los procedimientos falla, se hace rollback de toda la transacción.
 *     tags: [Recibo de Caja]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReciboCajaRequest'
 *           example:
 *             id_cia: 1
 *             id_co: "001"
 *             id_tipo_docto: "RC"
 *             consec_docto: 12345
 *             prefijo: "RC"
 *             fecha: "2025-12-23T10:00:00Z"
 *             periodo: 202512
 *             rowid_tercero: 34580
 *             sucursal: "001"
 *             total_db: 1000000
 *             total_cr: 1000000
 *             ind_origen: 1
 *             ind_estado: 1
 *             ind_transmit: 0
 *             fecha_creacion: "2025-12-23T10:00:00Z"
 *             fecha_actualiza: "2025-12-23T10:00:00Z"
 *             fecha_afectado: "2025-12-23T10:00:00Z"
 *             notas: "Recibo de caja de prueba"
 *             p_estado: 1
 *             id_un: "UN001"
 *             rowid_auxiliar: 1
 *             rowid_ccosto: 1
 *             rowid_fe: 1
 *             id_co_mov: "001"
 *             valor_db: 1000000
 *             valor_cr: 1000000
 *             docto_banco: "01"
 *             nro_docto_banco: 12345
 *             id_medios_pago: "EF"
 *             valor: 1000000
 *             id_banco: "BANCO001"
 *             nro_cheque: 12345
 *             nro_cuenta: "123456789"
 *             cod_seguridad: "123"
 *             nro_autorizacion: "AUTH001"
 *             fecha_vcto: "20251231"
 *             id_cuentas_bancarias: "001"
 *             fecha_consignacion: "2025-12-23T10:00:00Z"
 *             rowid_docto_consignacion: 0
 *             rowid_mov_docto_consignacion: 0
 *             id_causales_devolucion: ""
 *             id_sucursal: "001"
 *             p_rowid_docto_letra: 0
 *             p_id_ubicacion_origen: "001"
 *             p_id_ubicacion_destino: "002"
 *             p_rowid_sa_origen: 0
 *             p_rowid_sa_destino: 0
 *             p_id_cuenta_bancaria: "001"
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
 *               data:
 *                 sp_docto_insertar:
 *                   p_rowid: 12345
 *                   p_timestamp: "2024-01-15T10:00:00Z"
 *                 sp_mov_docto_insertar:
 *                   RowId: 67890
 *                 sp_rel_med_pag_insertar:
 *                   p_rowid: 11111
 *                 sp_let_movto_adicionar:
 *                   p_error: 0
 *                   p_des_error: null
 *                   p_des_error2: null
 *                 sp_docto_actualizar_estado:
 *                   p_error: 0
 *                   p_des_error: null
 *                   p_id_cia: 1
 *                   p_id_co: "001"
 *                   p_id_tipo_docto: "RC"
 *                   p_numero_docto: 12345
 *                   p_ind_cfdi: 0
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
 *                   example: "Parámetros requeridos faltantes"
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
 *                   example: "Error en sp_docto_insertar: [mensaje de error]"
 */
router.post('/procesar', reciboCajaController.procesarReciboCaja);

module.exports = router;

