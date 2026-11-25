const { ValidationError, UniqueConstraintError } = require('sequelize');

/**
 * Centraliza o tratamento de erros e garante uma resposta JSON consistente.
 */
module.exports = function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erro interno do servidor';

  if (err instanceof UniqueConstraintError) {
    statusCode = 400;
    message = 'Já existe um registro com os dados informados';
  } else if (err instanceof ValidationError) {
    statusCode = 400;
    message = err.errors.map((error) => error.message).join(', ');
  }

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({ message });
};
