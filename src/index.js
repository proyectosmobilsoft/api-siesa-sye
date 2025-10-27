require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./db/db');
const { PORT } = require('./config/env');

async function startServer() {
  try {
    await connectDB();
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

startServer();

