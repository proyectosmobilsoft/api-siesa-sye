const express = require('express');
const router = express.Router();
const clientsController = require('../controllers/clients.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Client:
 *       type: object
 *       properties:
 *         f9740_id:
 *           type: integer
 *           description: ID único del cliente
 *           example: 101
 *         f9740_nit:
 *           type: string
 *           description: Número de identificación tributaria
 *           example: "901123456"
 *         f9740_razon_social:
 *           type: string
 *           description: Razón social del cliente
 *           example: "Distribuidora S.A.S"
 *         f9740_nombre:
 *           type: string
 *           description: Nombre comercial del cliente
 *           example: "Distribuidora Principal"
 *         f9740_email:
 *           type: string
 *           description: Correo electrónico del cliente
 *           example: "info@empresa.com"
 *         f9740_celular:
 *           type: string
 *           description: Número de celular del cliente
 *           example: "3001234567"
 *         f9740_direccion1:
 *           type: string
 *           description: Dirección principal del cliente
 *           example: "Calle 123 #45-67"
 *     ClientsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Client'
 *           description: Lista de clientes
 *         total:
 *           type: integer
 *           description: Total de registros que cumplen con el filtro (siempre presente)
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
 *     SalesByClient:
 *       type: object
 *       properties:
 *         ID Cliente:
 *           type: integer
 *           description: ID único del cliente
 *           example: 12345
 *         Ventas Netas:
 *           type: number
 *           format: double
 *           description: Suma de ventas netas (bruto - descuentos + impuestos)
 *           example: 1500000.50
 *         Ventas Brutas:
 *           type: number
 *           format: double
 *           description: Suma de ventas brutas
 *           example: 1600000.00
 *         Descuentos:
 *           type: number
 *           format: double
 *           description: Suma total de descuentos aplicados
 *           example: 50000.00
 *         Impuestos:
 *           type: number
 *           format: double
 *           description: Suma total de impuestos
 *           example: 100000.50
 *         Periodos Activos:
 *           type: integer
 *           description: Número de periodos distintos con actividad
 *           example: 5
 *         Ticket Promedio:
 *           type: number
 *           format: double
 *           description: Ticket promedio por cliente
 *           example: 300000.10
 *     SalesByClientResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SalesByClient'
 *           description: Lista de ventas por cliente
 *     Top10Client:
 *       type: object
 *       properties:
 *         ID Cliente:
 *           type: integer
 *           description: ID único del cliente
 *           example: 12345
 *         Ventas Netas:
 *           type: number
 *           format: double
 *           description: Suma de ventas netas del cliente
 *           example: 2500000.75
 *     Top10ClientsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Top10Client'
 *           description: Lista de los 10 clientes con mayores ventas
 *     NewVsRecurrentClient:
 *       type: object
 *       properties:
 *         Tipo Cliente:
 *           type: string
 *           description: Tipo de cliente - Nuevo o Recurrente
 *           enum: [Clientes Nuevos, Clientes Recurrentes]
 *           example: "Clientes Nuevos"
 *         Cantidad Clientes:
 *           type: integer
 *           description: Cantidad de clientes de ese tipo
 *           example: 150
 *     NewVsRecurrentClientsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/NewVsRecurrentClient'
 *           description: Análisis de clientes nuevos vs recurrentes
 */

/**
 * @swagger
 * /api/clients:
 *   get:
 *     summary: Obtener todos los clientes
 *     description: Retorna la lista de clientes activos desde la base de datos SQL Server. Filtra por tipo de tercero = 1. Soporta búsqueda por razón social y paginación opcional para mejorar el rendimiento con grandes volúmenes de datos.
 *     tags: [Clientes]
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
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Palabra o texto para filtrar clientes por razón social. La búsqueda es case-insensitive y busca coincidencias parciales.
 *         example: "Distribuidora"
 *     responses:
 *       200:
 *         description: Lista de clientes obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientsResponse'
 *             examples:
 *               conPaginacion:
 *                 summary: Respuesta con paginación
 *                 value:
 *                   success: true
 *                   data:
 *                     - f9740_id: 101
 *                       f9740_nit: "901123456"
 *                       f9740_razon_social: "Distribuidora S.A.S"
 *                       f9740_nombre: "Distribuidora Principal"
 *                       f9740_email: null
 *                       f9740_celular: null
 *                       f9740_direccion1: null
 *                   total: 5000
 *                   pagination:
 *                     page: 1
 *                     pageSize: 100
 *                     total: 5000
 *                     totalPages: 50
 *               sinPaginacion:
 *                 summary: Respuesta sin paginación
 *                 value:
 *                   success: true
 *                   data:
 *                     - f9740_id: 101
 *                       f9740_nit: "901123456"
 *                       f9740_razon_social: "Distribuidora S.A.S"
 *                       f9740_nombre: "Distribuidora Principal"
 *                       f9740_email: null
 *                       f9740_celular: null
 *                       f9740_direccion1: null
 *                   total: 5000
 */

/**
 * @swagger
 * /api/clients/sales-report:
 *   get:
 *     summary: Obtener reporte de ventas por cliente
 *     description: Retorna un reporte agregado de ventas por cliente con métricas de ventas netas, brutas, descuentos, impuestos, periodos activos y ticket promedio. Los resultados están ordenados por ventas netas en orden descendente.
 *     tags: [Clientes]
 *     parameters:
 *       - in: query
 *         name: yearMonth
 *         required: false
 *         schema:
 *           type: integer
 *         example: 202510
 *         description: Año y mes en formato YYYYMM. Ejemplo 202510 para octubre 2025. Si no se proporciona, se obtienen todos los meses disponibles.
 *       - in: query
 *         name: companyId
 *         required: false
 *         schema:
 *           type: integer
 *         default: 1
 *         description: ID de la compañía. Por defecto es 1.
 *     responses:
 *       200:
 *         description: Reporte de ventas por cliente obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SalesByClientResponse'
 *             example:
 *               success: true
 *               data:
 *                 - ID Cliente: 12345
 *                   Ventas Netas: 1500000.50
 *                   Ventas Brutas: 1600000.00
 *                   Descuentos: 50000.00
 *                   Impuestos: 100000.50
 *                   Periodos Activos: 5
 *                   Ticket Promedio: 300000.10
 *                 - ID Cliente: 67890
 *                   Ventas Netas: 850000.25
 *                   Ventas Brutas: 900000.00
 *                   Descuentos: 25000.00
 *                   Impuestos: 75000.25
 *                   Periodos Activos: 3
 *                   Ticket Promedio: 283333.42
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
 *                   example: "Error al obtener el reporte de ventas"
 */
/**
 * @swagger
 * /api/clients/top-10:
 *   get:
 *     summary: Obtener top 10 clientes del mes
 *     description: Retorna los 10 clientes con mayores ventas netas, ordenados de forma descendente. Si se proporciona el parámetro yearMonth, filtra por ese mes específico.
 *     tags: [Clientes]
 *     parameters:
 *       - in: query
 *         name: yearMonth
 *         required: false
 *         schema:
 *           type: integer
 *         example: 202510
 *         description: Año y mes en formato YYYYMM. Ejemplo 202510 para octubre 2025. Si no se proporciona, se obtienen todos los meses disponibles.
 *       - in: query
 *         name: companyId
 *         required: false
 *         schema:
 *           type: integer
 *         default: 1
 *         description: ID de la compañía. Por defecto es 1.
 *     responses:
 *       200:
 *         description: Top 10 clientes obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Top10ClientsResponse'
 *             example:
 *               success: true
 *               data:
 *                 - ID Cliente: 12345
 *                   Ventas Netas: 2500000.75
 *                 - ID Cliente: 67890
 *                   Ventas Netas: 1800000.50
 *                 - ID Cliente: 11111
 *                   Ventas Netas: 1500000.00
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
 *                   example: "Error al obtener el top 10 de clientes"
 */
/**
 * @swagger
 * /api/clients/new-vs-recurrent:
 *   get:
 *     summary: Analizar clientes nuevos vs recurrentes
 *     description: Compara los clientes del mes actual con el mes anterior para identificar cuáles son nuevos y cuáles son recurrentes. Si no se proporciona previousMonth, se calcula automáticamente como el mes previo al currentMonth.
 *     tags: [Clientes]
 *     parameters:
 *       - in: query
 *         name: currentMonth
 *         required: true
 *         schema:
 *           type: integer
 *         example: 201902
 *         description: Mes actual en formato YYYYMM. Ejemplo 201902 para febrero 2019. Este parámetro es obligatorio.
 *       - in: query
 *         name: previousMonth
 *         required: false
 *         schema:
 *           type: integer
 *         example: 201901
 *         description: Mes previo en formato YYYYMM. Ejemplo 201901 para enero 2019. Si no se proporciona, se calcula automáticamente restando 1 mes del currentMonth.
 *       - in: query
 *         name: companyId
 *         required: false
 *         schema:
 *           type: integer
 *         default: 1
 *         description: ID de la compañía. Por defecto es 1.
 *     responses:
 *       200:
 *         description: Análisis de clientes obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NewVsRecurrentClientsResponse'
 *             example:
 *               success: true
 *               data:
 *                 - Tipo Cliente: "Clientes Nuevos"
 *                   Cantidad Clientes: 150
 *                 - Tipo Cliente: "Clientes Recurrentes"
 *                   Cantidad Clientes: 320
 *       400:
 *         description: Parámetro requerido faltante
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
 *                   example: "El parámetro currentMonth es requerido (formato YYYYMM)"
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
 *                   example: "Error al obtener el análisis de clientes"
 */
router.get('/', clientsController.getClients);
router.get('/sales-report', clientsController.getSalesByClient);
router.get('/top-10', clientsController.getTop10Clients);
router.get('/new-vs-recurrent', clientsController.getNewVsRecurrentClients);

module.exports = router;

