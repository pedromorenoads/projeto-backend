const AppError = require('../utils/AppError');
const { verifyToken } = require('../utils/token');

/**
 * Exige o cabeçalho `Authorization: Bearer <jwt>` nas rotas protegidas.
 */
module.exports = function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return next(new AppError(401, 'Token de autorização não informado'));
  }

  const [scheme, token] = header.split(' ');

  if (!/^Bearer$/i.test(scheme || '') || !token) {
    return next(new AppError(401, 'Token de autorização inválido'));
  }

  try {
    req.user = verifyToken(token);
    return next();
  } catch (error) {
    return next(new AppError(401, 'Token de autorização inválido ou expirado'));
  }
};
