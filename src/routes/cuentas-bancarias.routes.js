const express = require('express');
const router = express.Router();
const cuentasBancariasController = require('../controllers/cuentas-bancarias.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     CuentaBancaria:
 *       type: object
 *       properties:
 *         f026_id_cia:
 *           type: integer
 *           description: ID de la compañía
 *           example: 1
 *         f026_id:
 *           type: string
 *           description: ID único de la cuenta bancaria
 *           example: "001"
 *         f026_descripcion:
 *           type: string
 *           description: Descripción de la cuenta bancaria
 *           example: "BANCO DE BOGOTA 187-133-657"
 *         f026_rowid_aux_bancos:
 *           type: integer
 *           description: RowID del auxiliar de bancos
 *           example: 497
 *         f026_id_banco:
 *           type: string
 *           description: ID del banco
 *           example: "01"
 *         f026_nro_cuenta:
 *           type: string
 *           description: Número de cuenta bancaria
 *           example: "187133657"
 *         f026_ind_controla_chequera:
 *           type: integer
 *           description: Indicador si controla chequera (1=Sí, 0=No)
 *           example: 1
 *         f026_inicial1:
 *           type: integer
 *           description: Número inicial de chequera 1
 *           example: 1000
 *         f026_final1:
 *           type: integer
 *           description: Número final de chequera 1
 *           example: 1099
 *         f026_siguiente1:
 *           type: integer
 *           description: Siguiente número de chequera 1
 *           example: 1095
 *         f026_inicial2:
 *           type: integer
 *           description: Número inicial de chequera 2
 *           example: 0
 *         f026_final2:
 *           type: integer
 *           description: Número final de chequera 2
 *           example: 99
 *         f026_siguiente2:
 *           type: integer
 *           description: Siguiente número de chequera 2
 *           example: 0
 *         f026_ind_controla_consecutivo:
 *           type: integer
 *           description: Indicador si controla consecutivo (1=Sí, 0=No)
 *           example: 1
 *         f026_ind_pago_electronico:
 *           type: integer
 *           description: Indicador si permite pago electrónico (1=Sí, 0=No)
 *           example: 0
 *         f026_ind_forma_generacion:
 *           type: integer
 *           description: Indicador de forma de generación
 *           example: 0
 *         f026_rowid_tercero_pago_elect:
 *           type: integer
 *           nullable: true
 *           description: RowID del tercero para pago electrónico
 *           example: null
 *         f026_criterio_ch_digitos:
 *           type: integer
 *           description: Criterio de dígitos para cheques
 *           example: 8
 *         f026_criterio_ch:
 *           type: integer
 *           description: Criterio de cheques
 *           example: 1
 *         f026_criterio_cg_digitos:
 *           type: integer
 *           description: Criterio de dígitos para comprobantes de egreso
 *           example: 8
 *         f026_criterio_cg:
 *           type: integer
 *           description: Criterio de comprobantes de egreso
 *           example: 4
 *         f026_criterio_nd_digitos:
 *           type: integer
 *           description: Criterio de dígitos para notas débito
 *           example: 8
 *         f026_criterio_nd:
 *           type: integer
 *           description: Criterio de notas débito
 *           example: 2
 *         f026_criterio_nc_digitos:
 *           type: integer
 *           description: Criterio de dígitos para notas crédito
 *           example: 8
 *         f026_criterio_nc:
 *           type: integer
 *           description: Criterio de notas crédito
 *           example: 2
 *         f026_id_formato_extracto:
 *           type: string
 *           nullable: true
 *           description: ID del formato de extracto
 *           example: null
 *         f026_id_formato:
 *           type: string
 *           nullable: true
 *           description: ID del formato
 *           example: null
 *         f026_id_pe_formato:
 *           type: string
 *           nullable: true
 *           description: ID del formato de pago electrónico
 *           example: null
 *         f026_fecha_ultima_contab:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Fecha de última contabilización
 *           example: "2022-11-30T15:00:09.163Z"
 *         f026_ts:
 *           type: string
 *           format: date-time
 *           description: Timestamp del registro
 *           example: "2022-11-30T15:00:09.163Z"
 *         f026_ind_multiple_movto_cg:
 *           type: integer
 *           description: Indicador de múltiples movimientos de comprobante de egreso
 *           example: 0
 *         f026_num_max_med_pagos:
 *           type: integer
 *           description: Número máximo de medios de pago
 *           example: 0
 *         f026_ind_encripcion:
 *           type: integer
 *           description: Indicador si usa encriptación (1=Sí, 0=No)
 *           example: 0
 *         f026_ruta_exe_enc:
 *           type: string
 *           nullable: true
 *           description: Ruta del ejecutable de encriptación
 *           example: null
 *         f026_parametros_enc:
 *           type: string
 *           nullable: true
 *           description: Parámetros de encriptación
 *           example: null
 *         f026_ruta_cert_enc:
 *           type: string
 *           nullable: true
 *           description: Ruta del certificado de encriptación
 *           example: null
 *         f026_vlr_retorno_exitoso_enc:
 *           type: string
 *           nullable: true
 *           description: Valor de retorno exitoso de encriptación
 *           example: null
 *         f026_id_llave_ret_gmf:
 *           type: string
 *           nullable: true
 *           description: ID de la llave de retorno GMF
 *           example: null
 *         f026_ind_tarjeta_decimales:
 *           type: integer
 *           description: Indicador si la tarjeta usa decimales (1=Sí, 0=No)
 *           example: 0
 *         f026_num_tarjeta_decimales:
 *           type: integer
 *           description: Número de decimales de la tarjeta
 *           example: 0
 *         f026_ruta1_archivo_pe:
 *           type: string
 *           nullable: true
 *           description: Ruta 1 del archivo de pago electrónico
 *           example: null
 *         f026_ruta2_archivo_pe:
 *           type: string
 *           nullable: true
 *           description: Ruta 2 del archivo de pago electrónico
 *           example: null
 *     CuentasBancariasResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CuentaBancaria'
 *           description: Lista de cuentas bancarias
 */

/**
 * @swagger
 * /api/maestros/cuentas-bancarias:
 *   get:
 *     summary: Obtener todas las cuentas bancarias
 *     description: Retorna la lista completa de cuentas bancarias desde la tabla t026_mm_cuentas_bancarias. Incluye información sobre chequeras, pagos electrónicos, formatos de extracto y configuración de encriptación.
 *     tags: [Maestros]
 *     responses:
 *       200:
 *         description: Lista de cuentas bancarias obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CuentasBancariasResponse'
 *             example:
 *               success: true
 *               data:
 *                 - f026_id_cia: 1
 *                   f026_id: "001"
 *                   f026_descripcion: "BANCO DE BOGOTA 187-133-657"
 *                   f026_rowid_aux_bancos: 497
 *                   f026_id_banco: "01"
 *                   f026_nro_cuenta: "187133657"
 *                   f026_ind_controla_chequera: 1
 *                   f026_inicial1: 1000
 *                   f026_final1: 1099
 *                   f026_siguiente1: 1095
 *                   f026_ind_controla_consecutivo: 1
 *                   f026_ind_pago_electronico: 0
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
 *                   example: "Error al obtener las cuentas bancarias"
 */
router.get('/', cuentasBancariasController.getCuentasBancarias);

module.exports = router;

