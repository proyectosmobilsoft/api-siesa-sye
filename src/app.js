const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');

const clientsRoutes = require('./routes/clients.routes');
const companiesRoutes = require('./routes/companies.routes');
const productsRoutes = require('./routes/products.routes');
const reportsRoutes = require('./routes/reports.routes');
const warehousesRoutes = require('./routes/warehouses.routes');
const facturaRoutes = require('./routes/factura.routes');
const cuentasBancariasRoutes = require('./routes/cuentas-bancarias.routes');
const localRoutes = require('./routes/local.routes');
const reciboCajaRoutes = require('./routes/recibo-caja.routes');
const ggoRoutes = require('./routes/ggo.routes');
const pedidosRoutes = require('./routes/pedidos.routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const { setupSwagger } = require('./config/swagger');

const app = express();

// Configurar CORS - Permitir peticiones desde cualquier origen
app.use(cors({
  origin: '*', // En producción, especifica los orígenes permitidos
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200 // Para navegadores legacy
}));

// Configurar Helmet con opciones menos restrictivas para producción
app.use(helmet({
  contentSecurityPolicy: false, // Desactivar CSP para Swagger UI
  crossOriginEmbedderPolicy: false,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

/**
 * @swagger
 * components:
 *   schemas:
 *     HealthCheck:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *           example: true
 *         status:
 *           type: string
 *           description: Estado de la API
 *           example: "ok"
 *         environment:
 *           type: object
 *           description: Verificación del estado de las variables de entorno
 *           properties:
 *             hasDbHost:
 *               type: boolean
 *               description: Indica si DB_HOST está configurado
 *               example: true
 *             hasDbUser:
 *               type: boolean
 *               description: Indica si DB_USER está configurado
 *               example: true
 *             hasDbPass:
 *               type: boolean
 *               description: Indica si DB_PASS está configurado
 *               example: true
 *             hasDbName:
 *               type: boolean
 *               description: Indica si DB_NAME está configurado
 *               example: true
 *             dbPort:
 *               type: string
 *               description: Puerto de la base de datos configurado
 *               example: "1433"
 *             port:
 *               type: string
 *               description: Puerto del servidor configurado
 *               example: "3000"
 *             nodeEnv:
 *               type: string
 *               description: Entorno de ejecución
 *               example: "production"
 *             timestamp:
 *               type: string
 *               format: date-time
 *               description: Timestamp de la verificación
 *               example: "2025-11-22T16:35:00.000Z"
 *         message:
 *           type: string
 *           description: Mensaje de estado
 *           example: "API is running"
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Verificar estado de la API y configuración
 *     description: Endpoint de salud que verifica el estado de la API y muestra si las variables de entorno están configuradas correctamente. Útil para diagnosticar problemas de configuración en producción.
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: Estado de la API y verificación de variables de entorno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 *             example:
 *               success: true
 *               status: "ok"
 *               environment:
 *                 hasDbHost: true
 *                 hasDbUser: true
 *                 hasDbPass: true
 *                 hasDbName: true
 *                 dbPort: "1433"
 *                 port: "3000"
 *                 nodeEnv: "production"
 *                 timestamp: "2025-11-22T16:35:00.000Z"
 *               message: "API is running"
 */
// Endpoint de salud y verificación de configuración
app.get('/api/health', (req, res) => {
  const envCheck = {
    hasDbHost: !!process.env.DB_HOST,
    hasDbUser: !!process.env.DB_USER,
    hasDbPass: !!process.env.DB_PASS,
    hasDbName: !!process.env.DB_NAME,
    dbPort: process.env.DB_PORT || '1433 (default)',
    port: process.env.PORT || '3000 (default)',
    nodeEnv: process.env.NODE_ENV || 'not set',
    timestamp: new Date().toISOString()
  };

  res.json({
    success: true,
    status: 'ok',
    environment: envCheck,
    message: 'API is running'
  });
});

// 📘 Swagger UI (debe ir después de la documentación)
setupSwagger(app);

// Rutas principales
app.use('/api/clients', clientsRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/warehouses', warehousesRoutes);
app.use('/api/factura', facturaRoutes);
app.use('/api/maestros/cuentas-bancarias', cuentasBancariasRoutes);
app.use('/api/local', localRoutes);
app.use('/api/recibo-caja', reciboCajaRoutes);
app.use('/api/ggo', ggoRoutes);
app.use('/api/pedidos', pedidosRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

