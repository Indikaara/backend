const OrderService = require('../services/order.service');
const { logger } = require('../config/logger');

// @desc    Create a pending order and generate txnid
// @route   POST /api/orders/create-pending
exports.createPendingOrder = async (req, res) => {
    try {
        const { products, shippingAddress } = req.body;
        const userId = req.user ? req.user._id : null;
        
        const result = await OrderService.createPendingOrder(userId, products, shippingAddress);
        
        logger.info('Pending order created', { orderId: result.order._id, txnid: result.txnid });
        res.status(201).json(result);
    } catch (error) {
        logger.error('Pending order creation failed', { error: error.message });
        res.status(400).json({ message: error.message });
    }
};

// @desc    Create order after PayU payment success (callback/redirect)
// @route   POST /api/orders/payu-success
exports.createOrderAfterPayU = async (req, res) => {
    try {
        const { txnid, status, hash, products, shippingAddress, totalPrice, paymentResult } = req.body;
        const userId = req.user._id;
        
        const order = await OrderService.createOrderAfterPayment(
            userId, 
            txnid, 
            status, 
            products, 
            shippingAddress, 
            totalPrice, 
            paymentResult
        );
        
        logger.info('Order created after PayU payment', { orderId: order._id, txnid });
        res.status(201).json(order);
    } catch (error) {
        logger.error('Order creation after PayU payment failed', { error: error.message });
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
exports.getOrderById = async (req, res) => {
    try {
        const order = await OrderService.getOrderById(req.params.id);
        res.json(order);
    } catch (error) {
        logger.error('Order fetch failed', { orderId: req.params.id, error: error.message });
        const statusCode = error.message === 'Order not found' ? 404 : 500;
        res.status(statusCode).json({ message: error.message });
    }
};

// @desc    Get all orders for logged-in user
// @route   GET /api/orders/my
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await OrderService.getUserOrders(req.user._id);
        res.json(orders);
    } catch (error) {
        logger.error('Orders fetch failed', { userId: req.user._id, error: error.message });
        res.status(500).json({ message: error.message });
    }
};
