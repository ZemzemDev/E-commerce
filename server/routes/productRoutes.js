const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, detectProductInfo, deleteProduct, bulkDeleteProducts } = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.post('/detect', protect, admin, detectProductInfo);
router.post('/bulk-delete', protect, admin, bulkDeleteProducts);
router.get('/:id', getProductById);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
