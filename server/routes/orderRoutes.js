const express = require('express');
const { createOrder, getOrderById, updateOrderToPaid, getMyOrders, createStripeCheckoutSession, verifyStripePayment } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/pay', protect, updateOrderToPaid);
router.post('/:id/create-checkout-session', protect, createStripeCheckoutSession);
router.post('/:id/verify-payment', protect, verifyStripePayment);

module.exports = router;
