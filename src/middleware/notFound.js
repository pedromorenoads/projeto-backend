const AppError = require('../utils/AppError');

module.exports = function notFound(req, res, next) {
  next(new AppError(404, `Rota ${req.method} ${req.originalUrl} não encontrada`));
};
