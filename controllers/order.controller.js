const Order = require('../models/order.model');
const { Product } = require('../models/product.model');

// @desc    Create a new order
// @route   POST /api/orders
/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request
 */
exports.createOrder = async (req, res) => {
    try {
        const { products, shippingAddress, paymentMethod } = req.body;
        
        if (!products || products.length === 0) {
            return res.status(400).json({ message: 'No products in order' });
        }

        // Fetch all products to validate prices
        const productIds = products.map(p => p.product);
        const dbProducts = await Product.find({ _id: { $in: productIds } });
        
        if (dbProducts.length !== products.length) {
            return res.status(400).json({ message: 'Some products not found' });
        }

        // Calculate correct prices and total
        const validatedProducts = products.map(orderProduct => {
            const dbProduct = dbProducts.find(p => p._id.toString() === orderProduct.product.toString());
            if (!dbProduct) {
                throw new Error(`Product ${orderProduct.product} not found`);
            }
            if (dbProduct.countInStock < orderProduct.quantity) {
                throw new Error(`Insufficient stock for product ${dbProduct.name}`);
            }
            return {
                product: orderProduct.product,
                quantity: orderProduct.quantity,
                price: dbProduct.price // Use price from database
            };
        });

        const totalPrice = validatedProducts.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);

        const order = new Order({
            user: req.user._id,
            products: validatedProducts,
            shippingAddress,
            paymentMethod,
            totalPrice, // Calculated from validated prices
        });
        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: 'Order creation failed', error: error.message });
    }
        // Atomic stock reservation
        const reservedProducts = [];
        const reservedProductIds = [];
        let reservationFailed = false;
        let failedProduct = null;
        for (const orderProduct of products) {
            const dbProduct = dbProductMap.get(orderProduct.product.toString());
            // Try to reserve stock atomically
            const updatedProduct = await Product.findOneAndUpdate(
                { _id: dbProduct._id, countInStock: { $gte: orderProduct.quantity } },
                { $inc: { countInStock: -orderProduct.quantity } },
                { new: true }
            );
            if (!updatedProduct) {
                reservationFailed = true;
                failedProduct = dbProduct.name;
                break;
            }
            reservedProducts.push({
                product: dbProduct._id,
                quantity: orderProduct.quantity,
                price: dbProduct.price
            });
            reservedProductIds.push({ _id: dbProduct._id, quantity: orderProduct.quantity });
        }

        // If reservation failed, roll back previous decrements
        if (reservationFailed) {
            for (const reserved of reservedProductIds) {
                await Product.findByIdAndUpdate(reserved._id, { $inc: { countInStock: reserved.quantity } });
            }
            return res.status(409).json({ message: `Insufficient stock for product ${failedProduct}` });
        }

        // Calculate total price
        const totalPrice = reservedProducts.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);

        const order = new Order({
            user: req.user._id,
            products: reservedProducts,
            shippingAddress,
            paymentMethod,
            totalPrice, // Calculated from reserved products
        });
        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
};

// @desc    Create a pending order and generate txnid
// @route   POST /api/orders/create-pending
/**
 * @swagger
 * /api/orders/create-pending:
 *   post:
 *     summary: Create a pending order and get a txnid (used for PayU)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePendingRequest'
 *     responses:
 *       201:
 *         description: Pending order created with txnid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreatePendingResponse'
 *             examples:
 *               demo:
 *                 value:
 *                   order: { txnid: 'tx_12345', totalPrice: 100 }
 *                   txnid: 'tx_12345'
 */
exports.createPendingOrder = async (req, res) => {
    try {
        const { products, shippingAddress } = req.body;
        if (!products || products.length === 0) {
            return res.status(400).json({ message: 'No products in order' });
        }

        // Validate products and compute prices from DB (do not trust client-supplied prices)
        const productIds = products.map(p => p.product);
        const dbProducts = await Product.find({ _id: { $in: productIds } });
        if (dbProducts.length !== products.length) {
            return res.status(400).json({ message: 'Some products not found' });
        }

        // Build products array with numeric price (use first price entry.amount if price is an array)
        const validatedProducts = products.map(op => {
            const dbp = dbProducts.find(p => p._id.toString() === op.product.toString());
            if (!dbp) throw new Error(`Product ${op.product} not found`);
            const price = Array.isArray(dbp.price) && dbp.price.length > 0 ? Number(dbp.price[0].amount) : Number(dbp.price) || 0;
            return {
                product: dbp._id,
                quantity: Number(op.quantity) || 1,
                price,
            };
        });

        const totalPrice = validatedProducts.reduce((s, it) => s + (it.price * it.quantity), 0);

        // Generate a unique txnid
        const txnid = `tx_${Date.now()}_${Math.floor(Math.random()*10000)}`;
        const order = new Order({
            user: req.user ? req.user._id : null,
            products: validatedProducts,
            shippingAddress,
            paymentMethod: 'payu',
            totalPrice,
            isPaid: false,
            txnid,
            status: 'pending',
        });
        const createdOrder = await order.save();
        res.status(201).json({ order: createdOrder, txnid });
    } catch (error) {
        res.status(500).json({ message: 'Pending order creation failed', error: error.message });
    }
};

// @desc    Create order after PayU payment success (callback/redirect)
// @route   POST /api/orders/payu-success
/**
 * @swagger
 * /api/orders/payu-success:
 *   post:
 *     summary: Create an order after PayU redirects/callbacks (post-payment)
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: Order created
 */
exports.createOrderAfterPayU = async (req, res) => {
    try {
        // PayU will send txnid, status, hash, and other details
        const { txnid, status, hash, products, shippingAddress, totalPrice, paymentResult } = req.body;
        // Optionally, verify hash here for extra security
        if (status !== 'success') {
            return res.status(400).json({ message: 'PayU payment not successful' });
        }
        const order = new Order({
            user: req.user._id,
            products,
            shippingAddress,
            paymentMethod: 'payu',
            totalPrice,
            isPaid: true,
            paidAt: new Date(),
            paymentResult: paymentResult || { id: txnid, status },
        });
        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: 'Order creation after PayU payment failed', error: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 */
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email').populate('products.product', 'name price');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Order fetch failed', error: error.message });
    }
};

// @desc    Get all orders for logged-in user
// @route   GET /api/orders/my
/**
 * @swagger
 * /api/orders/my:
 *   get:
 *     summary: Get orders for the logged-in user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).populate('products.product', 'name price');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Order fetch failed', error: error.message });
    }
};
