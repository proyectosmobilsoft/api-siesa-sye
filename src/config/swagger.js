const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

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
  apis: ['./src/routes/*.js', './src/app.js'], // ruta donde Swagger buscará las anotaciones
};

const swaggerSpec = swaggerJsDoc(options);

function setupSwagger(app) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API Distrisye - Documentación',
  }));
  const port = process.env.PORT || 3000;
  console.log(`📘 Swagger disponible en http://localhost:${port}/api/docs`);
}

module.exports = { setupSwagger };

