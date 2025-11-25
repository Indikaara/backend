const Order = require('../models/order.model');
const { Product } = require('../models/product.model');

class OrderService {
    /**
     * Validate products and compute prices from database
     */
    async validateAndPriceProducts(products) {
        if (!products || products.length === 0) {
            throw new Error('No products in order');
        }

        const productIds = products.map(p => p.product);
        const dbProducts = await Product.find({ _id: { $in: productIds } });
        
        if (dbProducts.length !== products.length) {
            throw new Error('Some products not found');
        }

        // Build products array with numeric price
        const validatedProducts = products.map(op => {
            const dbp = dbProducts.find(p => p._id.toString() === op.product.toString());
            if (!dbp) {
                throw new Error(`Product ${op.product} not found`);
            }
            const price = Array.isArray(dbp.price) && dbp.price.length > 0 
                ? Number(dbp.price[0].amount) 
                : Number(dbp.price) || 0;
            return {
                product: dbp._id,
                quantity: Number(op.quantity) || 1,
                price,
            };
        });

        const totalPrice = validatedProducts.reduce((s, it) => s + (it.price * it.quantity), 0);

        return { validatedProducts, totalPrice };
    }

    /**
     * Generate unique transaction ID
     */
    generateTxnId() {
        return `tx_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    }

    /**
     * Create a pending order (before payment)
     */
    async createPendingOrder(userId, products, shippingAddress) {
        const { validatedProducts, totalPrice } = await this.validateAndPriceProducts(products);
        
        const txnid = this.generateTxnId();
        
        const order = new Order({
            user: userId || null,
            products: validatedProducts,
            shippingAddress,
            paymentMethod: 'payu',
            totalPrice,
            isPaid: false,
            txnid,
            status: 'pending',
        });

        const createdOrder = await order.save();
        return { order: createdOrder, txnid };
    }

    /**
     * Create order after PayU payment success
     */
    async createOrderAfterPayment(userId, txnid, status, products, shippingAddress, totalPrice, paymentResult) {
        if (status !== 'success') {
            throw new Error('PayU payment not successful');
        }

        const order = new Order({
            user: userId,
            products,
            shippingAddress,
            paymentMethod: 'payu',
            totalPrice,
            isPaid: true,
            paidAt: new Date(),
            paymentResult: paymentResult || { id: txnid, status },
            status: 'confirmed',
        });

        const createdOrder = await order.save();
        return createdOrder;
    }

    /**
     * Get order by ID with populated data
     */
    async getOrderById(orderId) {
        const order = await Order.findById(orderId)
            .populate('user', 'name email')
            .populate('products.product', 'name price');
        
        if (!order) {
            throw new Error('Order not found');
        }
        
        return order;
    }

    /**
     * Get all orders for a user
     */
    async getUserOrders(userId) {
        const orders = await Order.find({ user: userId })
            .populate('products.product', 'name price');
        
        return orders;
    }
}

module.exports = new OrderService();
