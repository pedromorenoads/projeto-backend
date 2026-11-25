const { Router } = require('express');
const productController = require('../controllers/productController');
const authenticate = require('../middleware/auth');

const router = Router();

// /search precisa ser declarada antes de /:id
router.get('/search', productController.search);
router.get('/:id', productController.getById);

router.post('/', authenticate, productController.create);
router.put('/:id', authenticate, productController.update);
router.delete('/:id', authenticate, productController.remove);

module.exports = router;
