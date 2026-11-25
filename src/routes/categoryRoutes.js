const { Router } = require('express');
const categoryController = require('../controllers/categoryController');
const authenticate = require('../middleware/auth');

const router = Router();

// /search precisa ser declarada antes de /:id
router.get('/search', categoryController.search);
router.get('/:id', categoryController.getById);

router.post('/', authenticate, categoryController.create);
router.put('/:id', authenticate, categoryController.update);
router.delete('/:id', authenticate, categoryController.remove);

module.exports = router;
