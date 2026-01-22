/**
 * Middleware para validar tokens API
 * Verifica que el token esté presente en el header x-api-key o api-token
 */
function validateJWT(req, res, next) {
  // Buscar el token en diferentes headers posibles
  const token = req.headers['x-api-key'] || req.headers['api-token'] || req.headers['x-api-token'];
  
  if (!token || token.trim() === '') {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticación requerido. Por favor, proporcione un token API en el header x-api-key.'
    });
  }

  // Guardar el token en el request para uso posterior
  req.token = token.trim();
  next();
}

module.exports = { validateJWT };
