const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Distrisye - Documentación',
      version: '1.0.0',
      description: 'API en Express conectada a SQL Server con las mejores prácticas de desarrollo.',
      contact: {
        name: 'Equipo de Desarrollo',
        email: 'dev@distrisye.com',
      },
    },
    servers: [
      {
        url: 'https://api-siesa.sye.vehiman.com',
        description: 'Servidor de producción',
      },
      {
        url: 'http://localhost:3000',
        description: 'Servidor local de desarrollo',
      },
    ],
  },
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../app.js')
  ], // ruta donde Swagger buscará las anotaciones
};

const swaggerSpec = swaggerJsDoc(options);

// Log para verificar qué archivos se están cargando (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  console.log('📘 Swagger buscando archivos en:', options.apis);
}

function setupSwagger(app) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API Distrisye - Documentación',
  }));
  const port = process.env.PORT || 3000;
  console.log(`📘 Swagger disponible en http://localhost:${port}/api/docs`);
  
  // Verificar que el endpoint de health esté documentado
  if (swaggerSpec.paths && swaggerSpec.paths['/api/health']) {
    console.log('✅ Endpoint /api/health documentado en Swagger');
  } else {
    console.warn('⚠️  Endpoint /api/health NO encontrado en Swagger');
  }
}

module.exports = { setupSwagger };

