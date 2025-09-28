const express = require('express');
const router = express.Router();
const { Order } = require('../models/order.model');
const { WebhookEvent } = require('../models/webhookEvent.model');
const { logger } = require('../config/logger');
const {
    validatePayuHash,
    validateContentType,
    logPayuRequest
} = require('../middleware/payu.middleware');

/**
 * Handle PayU payment success callback
 * @route POST /payment/success
 */
router.post('/success', 
    validateContentType,
    logPayuRequest,
    validatePayuHash,
    async (req, res) => {
    try {
        // Log the webhook event
        await WebhookEvent.create({
            source: 'payu',
            event: 'payment_success',
            data: req.body
        });

        // Extract transaction details from PayU response
        const {
            txnid,
            mihpayid,
            status,
            amount,
            mode,
            error,
            unmappedstatus
        } = req.body;

        // Find and update the order
        const order = await Order.findOneAndUpdate(
            { transactionId: txnid },
            {
                $set: {
                    paymentStatus: status,
                    paymentId: mihpayid,
                    paymentMode: mode,
                    paymentError: error,
                    paymentRawStatus: unmappedstatus,
                    paidAmount: amount,
                    lastPaymentUpdate: new Date()
                }
            },
            { new: true }
        );

        if (!order) {
            console.error(`Order not found for transaction ${txnid}`);
        }

        // Send a simple success response to PayU
        res.send(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Payment Success</title>
                </head>
                <body>
                    <h1>Payment Successfully Processed</h1>
                    <p>Thank you for your payment. You may close this window.</p>
                </body>
            </html>
        `);
    } catch (error) {
        logger.error('Error processing payment success', { error: error.message, stack: error.stack });
        res.status(500).send('Error processing payment');
    }
});

/**
 * Handle PayU payment failure callback
 * @route POST /payment/failure
 */
router.post('/failure',
    validateContentType,
    logPayuRequest,
    validatePayuHash,
    async (req, res) => {
    try {
        // Log the webhook event
        await WebhookEvent.create({
            source: 'payu',
            event: 'payment_failure',
            data: req.body
        });

        // Extract transaction details from PayU response
        const {
            txnid,
            mihpayid,
            status,
            amount,
            mode,
            error,
            unmappedstatus
        } = req.body;

        // Find and update the order
        const order = await Order.findOneAndUpdate(
            { transactionId: txnid },
            {
                $set: {
                    paymentStatus: status,
                    paymentId: mihpayid,
                    paymentMode: mode,
                    paymentError: error,
                    paymentRawStatus: unmappedstatus,
                    lastPaymentUpdate: new Date()
                }
            },
            { new: true }
        );

        if (!order) {
            console.error(`Order not found for transaction ${txnid}`);
        }

        // Send a simple failure response to PayU
        res.send(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Payment Failed</title>
                </head>
                <body>
                    <h1>Payment Processing Failed</h1>
                    <p>Your payment could not be processed. Please try again later.</p>
                </body>
            </html>
        `);
    } catch (error) {
        logger.error('Error processing payment failure', { error: error.message, stack: error.stack });
        res.status(500).send('Error processing payment');
    }
});

module.exports = router;