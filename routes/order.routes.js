const express = require('express');
const router = express.Router();
const {
    createOrder,
    createPendingOrder,
    createOrderAfterPayU,
    getOrderById,
    getMyOrders
} = require('../controllers/order.controller');
const { protect } = require('../middleware/auth.middleware'); // Assuming auth middleware exists

router.route('/').post(protect, createOrder);
router.route('/create-pending').post(protect, createPendingOrder);
router.route('/payu-success').post(protect, createOrderAfterPayU);

// **IMPORTANT**: The specific '/my' route must be before the parameterized '/:id' route.
router.route('/my').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);


module.exports = router;