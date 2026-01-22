const express = require("express");
const router = express.Router();
const ggoController = require("../controllers/ggo.controller");
const { validateJWT } = require("../middlewares/auth");

/**
 * @swagger
 * components:
 *   schemas:
 *     PackageUnit:
 *       type: object
 *       properties:
 *         codigo:
 *           type: integer
 *           description: Código del tipo de empaque
 *           example: 1
 *         nombre:
 *           type: string
 *           description: Nombre del tipo de empaque
 *           example: "Cajas"
 *     DispensaryLocation:
 *       type: object
 *       required:
 *         - cityCode
 *         - address
 *       properties:
 *         countryCode:
 *           type: string
 *           description: Código ISO 3166-1 de 2 letras del país
 *           example: "CO"
 *         departmentCode:
 *           type: string
 *           description: Código Divipola del departamento
 *           example: "11"
 *         cityCode:
 *           type: string
 *           description: Código Divipola del municipio o ciudad
 *           example: "11001"
 *         address:
 *           type: string
 *           description: Dirección del dispensario
 *           example: "Calle 45 63 98"
 *     Dispensary:
 *       type: object
 *       required:
 *         - name
 *         - code
 *         - location
 *       properties:
 *         name:
 *           type: string
 *           description: Nombre del dispensario
 *           example: "Dispensario 2025"
 *         code:
 *           type: string
 *           description: Código único del dispensario
 *           example: "1114256"
 *         location:
 *           $ref: '#/components/schemas/DispensaryLocation'
 *     Product:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Nombre del producto
 *           example: "Loratadina pastas x 10 unidades"
 *         quantity:
 *           type: number
 *           format: double
 *           description: Número de elementos del producto (puede ser decimal)
 *           example: 3.2
 *         packageUnit:
 *           type: integer
 *           description: Tipología de empaque del producto (ver tabla type_packageUnit)
 *           example: 2
 *     ShippingRequest:
 *       type: object
 *       required:
 *         - orderNumber
 *         - customerName
 *         - address
 *         - managementType
 *         - priority
 *         - deliveryPlannedDate
 *         - dispensary
 *       properties:
 *         orderNumber:
 *           type: string
 *           description: Número con el que se hace trazabilidad a la gestión
 *           example: "124569"
 *         customerName:
 *           type: string
 *           description: Nombre del cliente
 *           example: "Angelo Diaz"
 *         address:
 *           type: string
 *           description: Dirección de envío
 *           example: "Transversal 75 56 69"
 *         addressAdd:
 *           type: string
 *           description: Dirección adicional (opcional)
 *           example: "Torre 15 Apartamento 502"
 *         managementType:
 *           type: integer
 *           enum: [1, 2, 3]
 *           description: |
 *             Especifica el tipo de gestión:
 *             1. Entrega
 *             2. Recogida
 *             3. Visita
 *           example: 1
 *         priority:
 *           type: integer
 *           enum: [0, 1, 2, 3]
 *           description: |
 *             Prioridad que debe asignarse a un domicilio:
 *             0. No otorgar prioridad
 *             1. Prioridad Alta/Urgente
 *             2. Prioridad Media
 *             3. Prioridad Baja
 *           example: 1
 *         phone:
 *           type: string
 *           description: Número telefónico de contacto
 *           example: "5608452"
 *         cellphone:
 *           type: string
 *           description: Número celular de contacto
 *           example: "3155524236"
 *         email:
 *           type: string
 *           format: email
 *           description: Email de contacto
 *           example: "user.email@hostdomain.com"
 *         comments:
 *           type: string
 *           description: Comentarios adicionales a tener en cuenta en envío
 *           example: "Por favor dejar en portería a nombre de Alejandro Pinzón"
 *         fromHour:
 *           type: string
 *           format: time
 *           pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$'
 *           description: Hora inicial de ventana de tiempo donde el cliente puede recibir el envío (debe enviarse junto con toHour)
 *           example: "14:00:00"
 *         toHour:
 *           type: string
 *           format: time
 *           pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$'
 *           description: Hora final de ventana de tiempo donde el cliente puede recibir el envío (debe enviarse junto con fromHour)
 *           example: "15:00:00"
 *         deliveryPlannedDate:
 *           type: string
 *           format: date-time
 *           description: Fecha de planeación de entrega en formato UTC. Puede ser solo fecha o fecha con hora específica
 *           example: "2025-09-20T15:00:00Z"
 *         dispensary:
 *           $ref: '#/components/schemas/Dispensary'
 *         products:
 *           type: array
 *           description: Listado de productos que hacen parte del envío (opcional)
 *           items:
 *             $ref: '#/components/schemas/Product'
 *     ShippingResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID del envío creado
 *           example: 38008138
 *         shippingNumber:
 *           type: integer
 *           description: Número de envío
 *           example: 1
 *         orderNumber:
 *           type: string
 *           description: Número de orden
 *           example: "124569"
 *         managementType:
 *           type: integer
 *           description: Tipo de gestión
 *           example: 1
 *         routeRequired:
 *           type: integer
 *           description: Indica si se requiere ruta
 *           example: 0
 *         customerName:
 *           type: string
 *           description: Nombre del cliente
 *           example: "Angelo Diaz"
 *         address:
 *           type: string
 *           description: Dirección de envío
 *           example: "Transversal 75 56 69"
 *         phone:
 *           type: string
 *           description: Teléfono de contacto
 *           example: "5608452"
 *         cellphone:
 *           type: string
 *           description: Celular de contacto
 *           example: "3155524236"
 *         addressAdd:
 *           type: string
 *           description: Dirección adicional
 *           example: "Torre 15 Apartamento 502"
 *         email:
 *           type: string
 *           description: Email de contacto
 *           example: "user.email@hostdomain.com"
 *         comments:
 *           type: string
 *           description: Comentarios adicionales
 *           example: "Por favor dejar en portería a nombre de Alejandro Pinzón"
 *         dispensaryId:
 *           type: integer
 *           description: ID del dispensario
 *           example: 4
 *         fromHour:
 *           type: string
 *           description: Hora inicial de ventana de tiempo
 *           example: "14:00:00"
 *         toHour:
 *           type: string
 *           description: Hora final de ventana de tiempo
 *           example: "15:00:00"
 *         deliveryPlannedDate:
 *           type: string
 *           format: date-time
 *           description: Fecha de planeación de entrega
 *           example: "2025-09-20T15:00:00"
 *         productsId:
 *           type: integer
 *           description: ID de productos
 *           example: 51446
 *         products:
 *           type: array
 *           description: Lista de productos
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 55
 *               name:
 *                 type: string
 *                 example: "Oxitocina ampolla por ..."
 *               quantity:
 *                 type: number
 *                 example: 2
 *               packageUnit:
 *                 type: integer
 *                 example: 1
 */

/**
 * @swagger
 * /api/ggo/package-units:
 *   get:
 *     summary: Obtener tipos de empaque disponibles
 *     description: Consulta los tipos de empaque disponibles desde la tabla type_packageUnit de la base de datos
 *     tags: [GGO - Envíos, Recogidas y Visitas]
 *     responses:
 *       200:
 *         description: Lista de tipos de empaque obtenida exitosamente
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
 *                     $ref: '#/components/schemas/PackageUnit'
 *             example:
 *               success: true
 *               data:
 *                 - codigo: 1
 *                   nombre: "Cajas"
 *                 - codigo: 2
 *                   nombre: "Estibas"
 *                 - codigo: 3
 *                   nombre: "Paquetes"
 *       500:
 *         description: Error al consultar los tipos de empaque
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
 *                   example: "Error al consultar la base de datos"
 */
router.get("/package-units", ggoController.getPackageUnits);

/**
 * @swagger
 * /api/ggo/shippings:
 *   post:
 *     summary: Crear envío, recogida o visita
 *     description: |
 *       Crea un envío, recogida o visita en el servicio GGO (Logimiles).
 *       
 *       La comunicación se realiza mediante HTTPS con autenticación mediante token API.
 *       
 *       **Campos requeridos:**
 *       - orderNumber: Número de orden para trazabilidad
 *       - customerName: Nombre del cliente
 *       - address: Dirección de envío
 *       - managementType: Tipo de gestión (1=Entrega, 2=Recogida, 3=Visita)
 *       - priority: Prioridad (0=Ninguna, 1=Alta, 2=Media, 3=Baja)
 *       - deliveryPlannedDate: Fecha de planeación en formato UTC
 *       - dispensary: Información del dispensario (name, code, location)
 *       
 *       **Campos opcionales:**
 *       - phone, cellphone, email: Datos de contacto
 *       - comments: Comentarios adicionales
 *       - fromHour/toHour: Ventana de tiempo (deben enviarse juntos)
 *       - products: Lista de productos del envío
 *       
 *       **Nota sobre productos:**
 *       - Si se envía el array de productos, cada producto debe tener al menos el campo "name"
 *       - El campo packageUnit debe corresponder a un código válido de la tabla type_packageUnit
 *     tags: [GGO - Envíos, Recogidas y Visitas]
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *         description: API Key para validar la identidad y autenticación
 *         example: "tu-token-jwt-aqui"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShippingRequest'
 *           example:
 *             orderNumber: "124569"
 *             customerName: "Angelo Diaz"
 *             address: "Transversal 75 56 69"
 *             addressAdd: "Torre 15 Apartamento 502"
 *             managementType: 1
 *             priority: 1
 *             phone: "5608452"
 *             cellphone: "3155524236"
 *             email: "user.email@hostdomain.com"
 *             comments: "Por favor dejar en portería a nombre de Alejandro Pinzón"
 *             fromHour: "14:00:00"
 *             toHour: "15:00:00"
 *             deliveryPlannedDate: "2025-09-20T15:00:00Z"
 *             dispensary:
 *               name: "Dispensario 2025"
 *               code: "1114256"
 *               location:
 *                 countryCode: "CO"
 *                 departmentCode: "11"
 *                 cityCode: "11001"
 *                 address: "Calle 45 63 98"
 *             products:
 *               - name: "Oxitocina ampolla por ..."
 *                 quantity: 2
 *                 packageUnit: 1
 *               - name: "Loratadina pastas x 10 unidades"
 *                 quantity: 1
 *                 packageUnit: 2
 *     responses:
 *       200:
 *         description: Envío creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Envío creado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/ShippingResponse'
 *             example:
 *               success: true
 *               message: "Envío creado exitosamente"
 *               data:
 *                 id: 38008138
 *                 shippingNumber: 1
 *                 orderNumber: "124569"
 *                 managementType: 1
 *                 routeRequired: 0
 *                 customerName: "Angelo Diaz"
 *                 address: "Transversal 75 56 69"
 *                 phone: "5608452"
 *                 cellphone: "3155524236"
 *                 addressAdd: "Torre 15 Apartamento 502"
 *                 email: "user.email@hostdomain.com"
 *                 comments: "Por favor dejar en portería a nombre de Alejandro Pinzón"
 *                 dispensaryId: 4
 *                 fromHour: "14:00:00"
 *                 toHour: "15:00:00"
 *                 deliveryPlannedDate: "2025-09-20T15:00:00"
 *                 productsId: 51446
 *                 products:
 *                   - id: 55
 *                     name: "Oxitocina ampolla por ..."
 *                     quantity: 2
 *                     packageUnit: 1
 *                   - id: 56
 *                     name: "Loratadina pastas x 10 unidades"
 *                     quantity: 1
 *                     packageUnit: 2
 *       400:
 *         description: Error de validación en los datos enviados
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
 *                   example: "Error de validación"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example:
 *                     - "orderNumber es requerido"
 *                     - "managementType debe ser 1, 2 o 3"
 *       401:
 *         description: Token de autenticación requerido o inválido
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
 *                   example: "Token de autenticación requerido"
 *       500:
 *         description: Error al procesar la solicitud o al comunicarse con el servicio GGO
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
 *                   example: "Error al enviar datos al servicio GGO"
 *                 error:
 *                   type: string
 *                 data:
 *                   type: object
 */
router.post("/shippings", validateJWT, ggoController.createShipping);

module.exports = router;
