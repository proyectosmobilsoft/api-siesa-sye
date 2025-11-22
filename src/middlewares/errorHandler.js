function notFound(req, res, next) {
  res.status(404).json({ success: false, message: 'Not Found' });
}

function errorHandler(err, req, res, next) {
  // Log del error completo para debugging
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    status: err.status || err.statusCode,
    code: err.code,
    originalUrl: req.originalUrl,
    method: req.method,
  });

  const status = err.status || err.statusCode || 500;
  
  // Asegurar que siempre se devuelva JSON
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { 
      error: err.stack,
      details: err 
    })
  });
}

module.exports = { notFound, errorHandler };

