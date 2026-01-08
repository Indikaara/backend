const EmailService = require('../services/email.service');
const Order = require('../models/order.model');
const { logger } = require('../config/logger');
const { emailConfig, transporter } = require('../config/email');

/**
 * Test email sending functionality
 * @route GET /api/email/test
 */
exports.testEmail = async (req, res) => {
    try {
        const email = 'ashutoshhome42@gmail.com';
        const customerName = 'Ashutosh';

        // Create dummy order data for testing
        const dummyOrder = {
            _id: 'TEST-ORDER-' + Date.now(),
            txnid: 'TEST-TXN-' + Date.now(),
            isPaid: true,
            paidAt: new Date(),
            createdAt: new Date(),
            totalPrice: 1999.00,
            emailSent: false,
            user: null,
            paymentResult: {
                email_address: email,
                firstname: customerName
            },
            products: [
                {
                    product: { name: 'Handcrafted Wooden Bowl' },
                    quantity: 2,
                    price: 799.00
                },
                {
                    product: { name: 'Traditional Clay Pot' },
                    quantity: 1,
                    price: 401.00
                }
            ],
            shippingAddress: {
                address: '123 MG Road',
                city: 'Mumbai',
                state: 'Maharashtra',
                postalCode: '400001',
                country: 'India'
            },
            save: async function() {
                logger.info('Test email - dummy order, skipping save');
                return this;
            }
        };

        const result = await EmailService.sendOrderConfirmationEmail(dummyOrder);

        return res.status(200).json({
            success: result,
            message: result 
                ? 'Test email sent successfully to ashutoshhome42@gmail.com' 
                : 'Email sending failed - check logs for details',
            recipient: email,
            testOrderId: dummyOrder._id
        });

    } catch (error) {
        logger.error('Error in email test endpoint', { 
            error: error.message, 
            stack: error.stack 
        });
        
        return res.status(500).json({
            success: false,
            message: 'Failed to send test email',
            error: error.message
        });
    }
};

/**
 * Get email configuration status
 * @route GET /api/email/status
 */
exports.getEmailStatus = async (req, res) => {
    try {
        logger.info('Email status check', {
            enabled: emailConfig.enabled,
            configured: !!transporter,
            host: emailConfig.host,
            port: emailConfig.port,
            user: emailConfig.auth.user ? '***' + emailConfig.auth.user.slice(-10) : 'null',
            hasPassword: !!emailConfig.auth.pass,
            transporterType: typeof transporter
        });

        const status = {
            enabled: emailConfig.enabled,
            configured: !!transporter,
            host: emailConfig.host,
            port: emailConfig.port,
            from: emailConfig.from,
            user: emailConfig.auth.user ? '***' + emailConfig.auth.user.slice(-10) : null,
            hasPassword: !!emailConfig.auth.pass
        };

        return res.status(200).json({
            success: true,
            status,
            message: transporter 
                ? 'Email service is configured and ready' 
                : 'Email service is not configured - check environment variables'
        });
    } catch (error) {
        logger.error('Error getting email status', { error: error.message });
        
        return res.status(500).json({
            success: false,
            message: 'Failed to get email status',
            error: error.message
        });
    }
};
