const express = require('express');
const router = express.Router();
const companiesController = require('../controllers/companies.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Company:
 *       type: object
 *       properties:
 *         f010_id:
 *           type: integer
 *           description: ID único de la compañía
 *           example: 1
 *         f010_razon_social:
 *           type: string
 *           description: Razón social de la compañía
 *           example: "Empresa Ejemplo S.A.S"
 *         f010_nit:
 *           type: string
 *           description: Número de identificación tributaria
 *           example: "900123456-7"
 *         f010_ind_estado:
 *           type: integer
 *           description: Indicador de estado (1=Activo, 0=Inactivo)
 *           example: 1
 *         f010_ind_consolidadora:
 *           type: integer
 *           description: Indicador si es compañía consolidadora
 *           example: 0
 *         f010_max_per_abiertos:
 *           type: integer
 *           description: Máximo número de períodos abiertos
 *           example: 12
 *         f010_ult_per_abierto:
 *           type: integer
 *           description: Último período abierto
 *           example: 1
 *         f010_ult_per_cerrado:
 *           type: integer
 *           description: Último período cerrado
 *           example: 12
 *         f010_ult_ano_cerrado:
 *           type: integer
 *           description: Último año cerrado
 *           example: 2023
 *         f010_numero_periodos:
 *           type: integer
 *           description: Número de períodos configurados
 *           example: 12
 *         f010_notas:
 *           type: string
 *           description: Notas adicionales de la compañía
 *           example: "Compañía principal del grupo"
 *         f010_ciiu:
 *           type: string
 *           description: Código CIIU de la compañía
 *           example: "6201"
 *         f010_dv_nit:
 *           type: string
 *           description: Dígito de verificación del NIT
 *           example: "7"
 *     CompaniesResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Company'
 *           description: Lista de compañías
 */

/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: Obtener todas las compañías
 *     description: Retorna la lista de compañías activas desde la base de datos SQL Server.
 *     tags: [Compañías]
 *     responses:
 *       200:
 *         description: Lista de compañías obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompaniesResponse'
 */
router.get('/', companiesController.getCompanies);

module.exports = router;
