const express = require('express');
const router = express.Router();
const secondaryDbController = require('../controllers/local.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     LineDiscount:
 *       type: object
 *       description: Datos de descuentos de línea obtenidos del procedimiento almacenado getAllLineDiscount
 *       properties:
 *         id:
 *           type: integer
 *           description: ID del registro
 *           example: 1
 *         nombre:
 *           type: string
 *           description: Nombre del descuento
 *           example: "Descuento Ejemplo"
 *     LineDiscountResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/LineDiscount'
 *           description: Lista de descuentos de línea obtenidos del procedimiento almacenado getAllLineDiscount
 *         total:
 *           type: integer
 *           description: Total de registros
 *           example: 100
 *         pagination:
 *           type: object
 *           description: Información de paginación (solo si se usan parámetros page y pageSize)
 *           properties:
 *             page:
 *               type: integer
 *               example: 1
 *             pageSize:
 *               type: integer
 *               example: 100
 *             total:
 *               type: integer
 *               example: 100
 *             totalPages:
 *               type: integer
 *               example: 1
 */

/**
 * @swagger
 * /api/local/data:
 *   get:
 *     summary: Obtener descuentos de línea ejecutando getAllLineDiscount
 *     description: Retorna datos ejecutando el procedimiento almacenado getAllLineDiscount de la segunda base de datos (diferente a la principal). Este endpoint se conecta a una BD distinta configurada en DB2_*.
 *     tags: [Base de Datos Local]
 *     parameters:
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
 *           maximum: 1000
 *           default: 100
 *         description: Cantidad de registros por página. Valor por defecto 100 cuando se proporciona page. Máximo 1000.
 *         example: 100
 *     responses:
 *       200:
 *         description: Datos obtenidos exitosamente de la segunda base de datos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LineDiscountResponse'
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   nombre: "Ejemplo 1"
 *                 - id: 2
 *                   nombre: "Ejemplo 2"
 *               total: 100
 *               pagination:
 *                 page: 1
 *                 pageSize: 100
 *                 total: 100
 *                 totalPages: 1
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
 *                   example: "Error al obtener los datos de la segunda base de datos"
 */

/**
 * @swagger
 * /api/local/data/{id}:
 *   get:
 *     summary: Obtener un descuento de línea específico por ID
 *     description: Retorna un registro específico ejecutando getAllLineDiscount y filtrando por ID de la segunda base de datos.
 *     tags: [Base de Datos Local]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del registro a obtener
 *         example: 1
 *     responses:
 *       200:
 *         description: Registro obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/LineDiscount'
 *       404:
 *         description: Registro no encontrado
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
 *                   example: "Registro no encontrado"
 *       500:
 *         description: Error interno del servidor
 */
/**
 * @swagger
 * /api/local/procedures:
 *   get:
 *     summary: Listar procedimientos almacenados disponibles en la BD2
 *     description: Retorna una lista de todos los procedimientos almacenados disponibles en la segunda base de datos. Útil para encontrar el nombre correcto del procedimiento.
 *     tags: [Base de Datos Local]
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Término de búsqueda para filtrar procedimientos
 *         example: "Discount"
 *     responses:
 *       200:
 *         description: Lista de procedimientos almacenados obtenida exitosamente.
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
 *                       ROUTINE_SCHEMA:
 *                         type: string
 *                         example: "dbo"
 *                       ROUTINE_NAME:
 *                         type: string
 *                         example: "getAllLineDiscount"
 *                       ROUTINE_TYPE:
 *                         type: string
 *                         example: "PROCEDURE"
 *                 total:
 *                   type: integer
 *                   example: 5
 *                 message:
 *                   type: string
 *                   example: "Se encontraron 5 procedimiento(s) almacenado(s)"
 *       500:
 *         description: Error interno del servidor
 */
router.get('/data', secondaryDbController.getData);
router.get('/data/:id', secondaryDbController.getDataById);
router.get('/procedures', secondaryDbController.getAvailableProcedures);

module.exports = router;

