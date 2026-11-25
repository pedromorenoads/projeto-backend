/**
 * Encapsula controllers assíncronos para que rejeições caiam no middleware de erro.
 */
module.exports = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};
