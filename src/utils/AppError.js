/**
 * Erro de aplicação com o status HTTP que deve ser devolvido ao cliente.
 */
class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}

module.exports = AppError;
