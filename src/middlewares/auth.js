/**
 * Middleware para validar tokens JWT
 * Verifica que el token esté presente en el header Authorization
 */
function validateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticación requerido. Por favor, proporcione un token JWT en el header Authorization.'
    });
  }

  // El formato esperado es: "Bearer <token>" o solo "<token>"
  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : authHeader;

  if (!token || token.trim() === '') {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticación inválido. El token no puede estar vacío.'
    });
  }

  // Guardar el token en el request para uso posterior
  req.token = token;
  next();
}

module.exports = { validateJWT };
