const express = require('express');
const router = express.Router();
const companiesController = require('../controllers/companies.controller');

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
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       f010_id:
 *                         type: integer
 *                         example: 1
 *                       f010_razon_social:
 *                         type: string
 *                         example: "Empresa Ejemplo S.A.S"
 *                       f010_nit:
 *                         type: string
 *                         example: "900123456-7"
 *                       f010_ind_estado:
 *                         type: integer
 *                         example: 1
 *                       f010_ind_consolidadora:
 *                         type: integer
 *                         example: 0
 *                       f010_max_per_abiertos:
 *                         type: integer
 *                         example: 12
 *                       f010_ult_per_abierto:
 *                         type: integer
 *                         example: 1
 *                       f010_ult_per_cerrado:
 *                         type: integer
 *                         example: 12
 *                       f010_ult_ano_cerrado:
 *                         type: integer
 *                         example: 2023
 *                       f010_numero_periodos:
 *                         type: integer
 *                         example: 12
 *                       f010_notas:
 *                         type: string
 *                         example: "Compañía principal del grupo"
 *                       f010_ciiu:
 *                         type: string
 *                         example: "6201"
 *                       f010_dv_nit:
 *                         type: string
 *                         example: "7"
 */
router.get('/', companiesController.getCompanies);

module.exports = router;
