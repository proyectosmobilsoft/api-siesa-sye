const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const clientsRoutes = require('./routes/clients.routes');
const companiesRoutes = require('./routes/companies.routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const { setupSwagger } = require('./config/swagger');

const app = express();

app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// 📘 Swagger UI
setupSwagger(app);

// Rutas principales
app.use('/api/clients', clientsRoutes);
app.use('/api/companies', companiesRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

