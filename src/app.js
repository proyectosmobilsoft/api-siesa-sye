const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Security middleware
app.use(helmet());

// Logging middleware
app.use(morgan('dev'));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const clientsRoutes = require('./routes/clients.routes');
app.use('/api/clients', clientsRoutes);

// 404 handler (must be after all routes)
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;

