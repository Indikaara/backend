const Order = require('../models/order.model');
const WebhookEvent = require('../models/webhookEvent.model');
const PayUService = require('../services/payu.service');
const { Product } = require('../models/product.model');
const { logger } = require('../config/logger');
const crypto = require('crypto');

// Handler for PayU redirect (surl / furl)
// After validation (middleware) we redirect the user to the frontend with txnid and status
exports.payuReturnHandler = async (req, res) => {
    try {
        const data = req.body || {};
        const { txnid, status } = data;

        // Prefer frontend URL if configured
        const frontendBase = (process.env.FRONTEND_BASE_URL || process.env.FRONTEND_URL || '').replace(/\/$/, '');

        // Persist a WebhookEvent for audit (browser redirect payload)
        try {
            await WebhookEvent.create({
                provider: 'payu',
                payload: data,
                headers: req.headers,
                ip: req.ip,
                rawBody: req.rawBody || null,
                hashValid: true,
                status: status || 'unknown',
                event: 'return_redirect'
            });
        } catch (e) {
            logger.warn('Failed to persist PayU return event', { err: e.message });
        }

        // Try to update the order server-side as a fallback in case webhook was not delivered yet
        try {
            if (txnid) {
                const existingOrder = await Order.findOne({ txnid });
                if (existingOrder) {
                    if (!existingOrder.isPaid) {
                        existingOrder.isPaid = status === 'success';
                        if (status === 'success') {
                            existingOrder.paidAt = new Date();
                            existingOrder.paymentResult = { id: data.mihpayid || txnid, status };
                            existingOrder.status = 'confirmed';
                        }
                        await existingOrder.save();
                        logger.info('Order updated from PayU return', { orderId: existingOrder._id, txnid, status });
                    }
                } else {
                    logger.warn('No order found for txnid on PayU return', { txnid });
                }
            }
        } catch (e) {
            logger.error('Error updating order from PayU return', { error: e.message });
        }

        if (frontendBase) {
            // Redirect to a frontend route — include txnid and status so frontend can reconcile with backend/webhook
            const redirectUrl = `${frontendBase}/dashboard`
            // /payment-result?txnid=${encodeURIComponent(txnid || '')}&status=${encodeURIComponent(status || '')}`;
            return res.redirect(302, redirectUrl);
        }

        // If frontend not configured, return a small HTML response indicating status
        return res.status(200).send(`<html><body><h1>Payment ${status}</h1><p>Transaction: ${txnid || 'unknown'}</p></body></html>`);
    } catch (error) {
        logger.error('Error handling PayU redirect', { error: error.message, stack: error.stack });
        return res.status(500).send('Server error');
    }
};

exports.initiatePayment = async (req, res) => {
    try {
        const { orderId, txnid: reqTxnId } = req.body;

        // Fetch order details by orderId or txnid
        let order = null;
        if (orderId) {
            order = await Order.findById(orderId);
        } else if (reqTxnId) {
            order = await Order.findOne({ txnid: reqTxnId });
        }
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Validate order products and compute amount from DB prices (do not trust client-supplied totals)
        if (!Array.isArray(order.products) || order.products.length === 0) {
            return res.status(400).json({ error: 'Order has no products' });
        }

        const productIds = [...new Set(order.products.map(p => p.product.toString()))];
        const dbProducts = await Product.find({ _id: { $in: productIds } });
        const prodById = new Map(dbProducts.map(p => [p._id.toString(), p]));

        const validatedProducts = [];
        for (const op of order.products) {
            const dbp = prodById.get(op.product.toString());
            if (!dbp) {
                // Missing product referenced by order: persist and return error
                await WebhookEvent.create({
                    provider: 'payu',
                    payload: { reason: 'initiate_missing_product', orderId, missingProduct: op.product },
                    headers: {},
                    ip: req.ip,
                    rawBody: null,
                    hashValid: false,
                    status: 'initiate_error',
                    failureReason: `Missing product in order: ${op.product}`
                });
                return res.status(400).json({ error: `Product not found: ${op.product}` });
            }
            // product.price may be an array of {amount} entries or a single number; normalize to numeric amount
            let price = 0;
            if (Array.isArray(dbp.price) && dbp.price.length > 0) {
                price = Number(dbp.price[0].amount);
            } else {
                price = Number(dbp.price);
            }
            if (isNaN(price)) price = 0;
            validatedProducts.push({ product: dbp._id.toString(), quantity: Number(op.quantity) || 1, price });
        }

        let amount = validatedProducts.reduce((s, it) => s + (it.price * it.quantity), 0);
        if (isNaN(amount)) amount = 0;

        // Optionally persist computed total back to order
        order.totalPrice = amount;
        await order.save();

    // Prefer frontend base URL for PayU return pages; fall back to backend host
    const baseUrl = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;

        // Format amount to exactly 2 decimal places
        const formattedAmount = parseFloat(amount).toFixed(2);
        
        // Get customer details with proper fallbacks
        const customerName = (order.shippingAddress?.firstname || order.customerName || req.user?.name || 'Test User').trim();
        const customerEmail = (order.shippingAddress?.email || order.customerEmail || req.user?.email || 'test@example.com').trim().toLowerCase();
        const customerPhone = (order.shippingAddress?.phone || order.customerPhone || '9999999999').replace(/[^0-9]/g, '');
        
        // Create a clean product info string
        const productInfo = `Order_${order._id}`.replace(/[^a-zA-Z0-9_-]/g, '');
        
        // Generate PayU form data
        const paymentData = PayUService.generatePaymentFormData({
            orderId: order._id.toString(),
            amount: formattedAmount,
            productInfo: productInfo,
            firstName: customerName,
            email: customerEmail,
            phone: customerPhone,
            baseUrl: baseUrl.trim()
        });

        // Update order with payment initiation
    order.txnid = paymentData.formData.txnid;
    // Use existing enum value 'pending' for initiated payments
    order.status = 'pending';
        await order.save();

        return res.json(paymentData);
    } catch (error) {
        logger.error('Payment initiation error', { error: error.message, stack: error.stack });
        return res.status(500).json({ error: 'Payment initiation failed' });
    }
};

// PayU Hosted Checkout Implementation

// PayU webhook / callback endpoint - hardened
// Features:
// - Optional IP allow-list via PAYU_ALLOWED_IPS (comma separated)
// - Raw body is persisted and stored in WebhookEvent
// - Headers and IP are stored
// - Clear failure reasons and idempotent order updates by txnid
exports.payuWebhook = async (req, res) => {
    try {
        const merchantSalt = process.env.PAYU_MERCHANT_SALT;
        const merchantKey = process.env.PAYU_MERCHANT_KEY;

        // Capture posted data and rawBody
        const data = req.body || {};
        const rawBody = req.rawBody || null;
        const headers = req.headers || {};
        const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || null;

        // Optional IP allow-list check
        const allowed = process.env.PAYU_ALLOWED_IPS; // comma-separated
        if (allowed) {
            const allowedList = allowed.split(',').map(s => s.trim()).filter(Boolean);
            if (allowedList.length && ip) {
                // Normalize IPv6 prefix if present
                const normalizedIp = ip.replace('::ffff:', '');
                if (!allowedList.includes(normalizedIp)) {
                    await WebhookEvent.create({
                        provider: 'payu',
                        payload: data,
                        headers,
                        ip: normalizedIp,
                        rawBody,
                        hashValid: false,
                        status: data.status || 'unknown',
                        failureReason: 'IP not allowed'
                    });
                    return res.status(403).send('Forbidden');
                }
            }
        }

        // Expected fields
        const { key, txnid, amount, productinfo, firstname, email, status, hash } = data;

        // Build the reverse hash string per PayU docs: salt|status|||||||||||email|firstname|productinfo|amount|txnid|key
        const reverseHashString = `${merchantSalt}|${status}|||||||||||${email || ''}|${firstname || ''}|${productinfo || ''}|${amount || ''}|${txnid || ''}|${key || ''}`;
        const calculatedHash = crypto.createHash('sha512').update(reverseHashString).digest('hex');

        // Persist incoming event before acting
        const eventDoc = await WebhookEvent.create({
            provider: 'payu',
            payload: data,
            headers,
            ip,
            rawBody,
            hashValid: calculatedHash === (hash || ''),
            status: status || 'unknown',
        });

        if (calculatedHash !== (hash || '')) {
            // Update event with failure reason
            eventDoc.failureReason = 'Invalid hash';
            await eventDoc.save();
            return res.status(400).send('Invalid hash');
        }

        if (status !== 'success') {
            eventDoc.failureReason = 'Payment status not success';
            await eventDoc.save();
            return res.status(400).send('Payment not successful');
        }

        // At this point payment is verified. Try to find existing order by txnid
        let existingOrder = null;
        if (txnid) {
            existingOrder = await Order.findOne({ txnid });
        }

        if (existingOrder) {
            // Idempotent update: only mark paid if not already
            if (!existingOrder.isPaid) {
                existingOrder.isPaid = true;
                existingOrder.paidAt = new Date();
                existingOrder.paymentResult = { id: txnid, status };
                // Set to 'confirmed' when payment is verified by PayU
                existingOrder.status = 'confirmed';
                await existingOrder.save();
            } else {
                // Ensure status is at least 'confirmed' for already-paid orders
                if (existingOrder.status !== 'confirmed') {
                    existingOrder.status = 'confirmed';
                    await existingOrder.save();
                }
            }
            return res.status(200).send('OK');
        }

        // Fallback: if products are included in the webhook, try to create a new paid order
        const { products, shippingAddress, totalPrice } = data;
        if (!products) {
            // Nothing to create; acknowledge the webhook
            return res.status(200).send('OK');
        }

        // Parse products (might come as JSON string)
        const parsedProducts = typeof products === 'string' ? JSON.parse(products) : products;
        // Build unique product ids and fetch DB prices
        const incomingIds = parsedProducts.map(p => p.product.toString());
        const uniqueIds = [...new Set(incomingIds)];
        const dbProductsForWebhook = await Product.find({ _id: { $in: uniqueIds } });
        const mapById = new Map(dbProductsForWebhook.map(p => [p._id.toString(), p]));

        // If any referenced product is missing, persist the webhook event for manual review and acknowledge (200)
        const missing = parsedProducts.find(op => !mapById.has(op.product.toString()));
        if (missing) {
            await WebhookEvent.create({
                provider: 'payu',
                payload: data,
                headers,
                ip,
                rawBody,
                hashValid: true,
                status: status || 'unknown',
                failureReason: `Webhook references missing product: ${missing.product}`
            });
            // Return 200 to avoid PayU retry storms; ops team will reconcile
            return res.status(200).send('OK');
        }

        // Validate and compute prices from DB
        const validatedWebhookProducts = parsedProducts.map(op => {
            const dbp = mapById.get(op.product.toString());
            let price = 0;
            if (Array.isArray(dbp.price) && dbp.price.length > 0) {
                price = Number(dbp.price[0].amount);
            } else {
                price = Number(dbp.price);
            }
            if (isNaN(price)) price = 0;
            return { product: op.product, quantity: Number(op.quantity) || 1, price };
        });
        let computedTotal = validatedWebhookProducts.reduce((s, it) => s + (it.price * it.quantity), 0);
        if (isNaN(computedTotal)) computedTotal = 0;

        const order = new Order({
            user: null,
            txnid,
            products: validatedWebhookProducts,
            shippingAddress: shippingAddress ? (typeof shippingAddress === 'string' ? JSON.parse(shippingAddress) : shippingAddress) : {},
            paymentMethod: 'payu',
            totalPrice: computedTotal,
            isPaid: true,
            paidAt: new Date(),
            paymentResult: { id: txnid, status },
            // New orders created from webhook are considered confirmed since payment is verified
            status: 'confirmed'
        });

        await order.save();
        return res.status(200).send('OK');
    } catch (error) {
        console.error('PayU webhook error:', error);
        try {
            await WebhookEvent.create({ provider: 'payu', payload: req.body, headers: req.headers, ip: req.ip, rawBody: req.rawBody, failureReason: `Exception: ${error.message}` });
        } catch (e) {
            console.error('Failed to persist webhook error event', e);
        }
        return res.status(500).send('Server error');
    }
};
