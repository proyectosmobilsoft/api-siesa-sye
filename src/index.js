require('dotenv').config();
const app = require('./app');
const { getPool } = require('./db/db');
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
    await getPool();
    console.log('✅ Database connected successfully');

    const server = app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
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

