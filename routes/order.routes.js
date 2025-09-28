const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
    createOrder,
    getOrderById,
    getMyOrders,
    createPendingOrder,
    createOrderAfterPayU,
} = require('../controllers/order.controller');
// Create order after PayU payment success
router.post('/payu-success', protect, createOrderAfterPayU);

// Create a pending order and return txnid (protected)
// Create a pending order and return txnid (protected)
router.post('/create-pending', protect, createPendingOrder);
// (Removed public create-pending-public endpoint; pending orders require authentication now)

// Create order
router.post('/', protect, createOrder);
// Get order by ID
router.get('/:id', protect, getOrderById);
// Get all orders for logged-in user
router.get('/my/orders', protect, getMyOrders);

module.exports = router;
