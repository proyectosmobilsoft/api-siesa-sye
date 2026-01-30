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
      console.log(`🚀 Server running on port ${port}`);

      // SINCRONIZACIÓN AUTOMÁTICA DESHABILITADA PARA PRUEBAS
      // Descomentar cuando se quiera activar la sincronización automática
      /*
      try {
        const pedidosSyncJob = require('./jobs/pedidos-sync.job');
        pedidosSyncJob.start();
      } catch (error) {
        console.warn('⚠️  No se pudo iniciar sync job:', error.message);
      }
      */
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

    // Manejo de cierre graceful
    const gracefulShutdown = () => {
      console.log('\n📛 Señal de cierre recibida, cerrando servidor...');
      try {
        const pedidosSyncJob = require('./jobs/pedidos-sync.job');
        pedidosSyncJob.stop();
      } catch (error) {
        console.warn('⚠️  Error deteniendo sync job:', error.message);
      }

      server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('❌ Error starting server:', error);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

startServer();
