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
        url: 'http://192.168.1.254:3010',
        description: 'Servidor de producción',
      },
      {
        url: 'http://localhost:3010',
        description: 'Servidor local de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT para autenticación. Incluya el token en el header Authorization como "Bearer {token}"'
        }
      }
    }
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
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
      supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
      requestInterceptor: (request) => {
        // Asegurar que las peticiones usen el protocolo correcto
        if (request.url && !request.url.startsWith('http')) {
          const host = request.headers && request.headers.host;
          if (host) {
            request.url = `http://${host}${request.url}`;
          }
        }
        // Asegurar que los headers sean correctos
        if (!request.headers) {
          request.headers = {};
        }
        request.headers['Accept'] = 'application/json';
        request.headers['Content-Type'] = 'application/json';
        
        // El token JWT se maneja automáticamente por Swagger UI cuando se configura en el campo de autorización
        // Si el usuario ha ingresado un token, Swagger UI lo incluirá automáticamente en el header Authorization
        
        return request;
      },
      responseInterceptor: (response) => {
        // Asegurar que las respuestas se manejen correctamente
        return response;
      }
    }
  }));
  const port = process.env.PORT || 3010;
  console.log(`📘 Swagger disponible en http://localhost:${port}/api/docs`);
  console.log(`📘 Swagger disponible en http://192.168.1.254:${port}/api/docs`);
  
  // Verificar que el endpoint de health esté documentado
  if (swaggerSpec.paths && swaggerSpec.paths['/api/health']) {
    console.log('✅ Endpoint /api/health documentado en Swagger');
  } else {
    console.warn('⚠️  Endpoint /api/health NO encontrado en Swagger');
  }
}

module.exports = { setupSwagger };

