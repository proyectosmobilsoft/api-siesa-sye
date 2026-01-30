require('dotenv').config();
const app = require('./app');
const { getPool, getPool2 } = require('./db/db');
const { port } = require('./config/env');

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

async function startServer() {
  try {
    // Conectar a ambas bases de datos
    await getPool();
    console.log('✅ Primary Database connected successfully');

    // Intentar conectar a la segunda BD (opcional, solo si está configurada)
    try {
      await getPool2();
      console.log('✅ Secondary Database connected successfully');
    } catch (err) {
      console.warn('⚠️  Secondary Database connection failed (continuing with primary DB only):', err.message);
    }

    const server = app.listen(port, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
      console.log(`📘 Documentación disponible en http://localhost:${port}/api/docs`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);

      // Iniciar job de sincronización de pedidos
      const pedidosSyncJob = require('./jobs/pedidos-sync.job');
      pedidosSyncJob.start();
    });

    // Manejo de cierre graceful
    process.on('SIGTERM', () => {
      console.log('📛 SIGTERM recibido, cerrando servidor...');
      const pedidosSyncJob = require('./jobs/pedidos-sync.job');
      pedidosSyncJob.stop();
      server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('\n📛 SIGINT recibido, cerrando servidor...');
      const pedidosSyncJob = require('./jobs/pedidos-sync.job');
      pedidosSyncJob.stop();
      server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
      });
    });
    // Manejo de errores del servidor
    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

      switch (error.code) {
        case 'EACCES':
          console.error(`❌ ${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`❌ ${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

startServer();

