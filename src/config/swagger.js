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
        url: 'http://179.33.214.87:3010',
        description: 'Servidor de producción',
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
  // Opciones de Swagger UI
  const swaggerUiOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API Distrisye - Documentación',
    swaggerOptions: {
      // Esto es crítico para producción - le dice a Swagger UI que use URLs relativas
      url: '/api/docs/swagger.json',
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
      supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
      requestInterceptor: (request) => {
        // Asegurar que las peticiones usen el protocolo correcto
        if (request.url && !request.url.startsWith('http')) {
          // Usar la URL del navegador para construir la URL completa
          const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
          request.url = `${baseUrl}${request.url}`;
        }
        // Asegurar que los headers sean correctos
        if (!request.headers) {
          request.headers = {};
        }
        request.headers['Accept'] = 'application/json';
        if (request.method !== 'GET') {
          request.headers['Content-Type'] = 'application/json';
        }

        return request;
      },
      responseInterceptor: (response) => {
        // Asegurar que las respuestas se manejen correctamente
        return response;
      }
    }
  };

  // Servir el JSON de Swagger en una ruta separada
  app.get('/api/docs/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Configurar Swagger UI
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
  const port = process.env.PORT || 3010;
  console.log(`📘 Swagger disponible en http://179.33.214.87:${port}/api/docs`);

  // Verificar que el endpoint de health esté documentado
  if (swaggerSpec.paths && swaggerSpec.paths['/api/health']) {
    console.log('✅ Endpoint /api/health documentado en Swagger');
  } else {
    console.warn('⚠️  Endpoint /api/health NO encontrado en Swagger');
  }
}

module.exports = { setupSwagger };

