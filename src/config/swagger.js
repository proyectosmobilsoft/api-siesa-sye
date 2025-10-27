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
        url: 'http://localhost:3000',
        description: 'Servidor local de desarrollo',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // ruta donde Swagger buscará las anotaciones
};

const swaggerSpec = swaggerJsDoc(options);

function setupSwagger(app) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('📘 Swagger disponible en http://localhost:3000/api/docs');
}

module.exports = { setupSwagger };

