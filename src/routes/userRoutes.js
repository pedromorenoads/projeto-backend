const { Router } = require('express');
const userController = require('../controllers/userController');
const authenticate = require('../middleware/auth');

const router = Router();

// Rotas públicas
router.post('/token', userController.login);
router.post('/', userController.create);
router.get('/:id', userController.getById);

// Rotas protegidas por JWT
router.put('/:id', authenticate, userController.update);
router.delete('/:id', authenticate, userController.remove);

module.exports = router;
