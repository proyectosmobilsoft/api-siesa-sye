require('dotenv').config();
const app = require('./app');
const { getPool } = require('./db/db');
const { port } = require('./config/env');

async function startServer() {
  try {
    await getPool();
    console.log('✅ Database connected successfully');

    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

startServer();

