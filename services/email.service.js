const fs = require('fs').promises;
const path = require('path');
const handlebars = require('handlebars');
const { transporter, emailConfig } = require('../config/email');
const { logger } = require('../config/logger');

class EmailService {
    /**
     * Send order confirmation email to customer
     * @param {Object} order - Populated order object with user and products
     * @returns {Promise<boolean>} - Returns true if email sent successfully, false otherwise
     */
    static async sendOrderConfirmationEmail(order) {
        try {
            if (!this._validateEmailPrerequisites(order)) {
                return false;
            }

            const recipient = this._extractRecipientInfo(order);
            if (!recipient.email) {
                logger.warn('No recipient email found for order', { orderId: order._id });
                return false;
            }

            const templateData = this._prepareTemplateData(order, recipient);
            const htmlContent = await this._renderEmailTemplate(templateData);
            const mailOptions = this._buildMailOptions(recipient, order, htmlContent);

            await this._sendEmail(mailOptions, order);
            await this._updateOrderEmailStatus(order);

            logger.info('Order confirmation email sent successfully', {
                orderId: order._id,
                txnid: order.txnid,
                recipient: recipient.email
            });

            return true;

        } catch (error) {
            this._logEmailError(error, order);
            return false;
        }
    }

    /**
     * Validate email prerequisites before sending
     * @private
     */
    static _validateEmailPrerequisites(order) {
        if (!emailConfig.enabled) {
            logger.info('Email sending is disabled', { orderId: order._id });
            return false;
        }

        if (!transporter) {
            logger.warn('Email transporter not configured', { orderId: order._id });
            return false;
        }

        if (order.emailSent) {
            logger.info('Order confirmation email already sent', { orderId: order._id });
            return false;
        }

        return true;
    }

    /**
     * Extract recipient email and name from order
     * @private
     */
    static _extractRecipientInfo(order) {
        return {
            email: order.user?.email || order.paymentResult?.email_address,
            name: order.user?.name || order.paymentResult?.firstname || 'Valued Customer'
        };
    }

    /**
     * Prepare template data for email rendering
     * @private
     */
    static _prepareTemplateData(order, recipient) {
        return {
            customerName: recipient.name,
            orderId: order._id.toString(),
            transactionId: order.txnid || 'N/A',
            orderDate: this._formatOrderDate(order),
            paymentStatus: order.isPaid ? 'PAID' : 'PENDING',
            statusClass: order.isPaid ? 'status-paid' : 'status-pending',
            products: this._formatProductsList(order.products),
            totalPrice: this._formatCurrency(order.totalPrice),
            shippingAddress: order.shippingAddress || null
        };
    }

    /**
     * Format order date for display
     * @private
     */
    static _formatOrderDate(order) {
        const dateToFormat = order.paidAt || order.createdAt;
        const options = order.paidAt 
            ? { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
            : { year: 'numeric', month: 'long', day: 'numeric' };
        
        return new Date(dateToFormat).toLocaleDateString('en-IN', options);
    }

    /**
     * Format products list for email template
     * @private
     */
    static _formatProductsList(products) {
        return products.map(item => ({
            name: item.product?.name || 'Product',
            quantity: item.quantity,
            price: this._formatCurrency(item.price),
            total: this._formatCurrency(Number(item.price) * item.quantity)
        }));
    }

    /**
     * Format currency value
     * @private
     */
    static _formatCurrency(amount) {
        return `₹${Number(amount).toFixed(2)}`;
    }

    /**
     * Render email template with data
     * @private
     */
    static async _renderEmailTemplate(templateData) {
        const templatePath = path.join(__dirname, '../templates/order-confirmation.html');
        const templateSource = await fs.readFile(templatePath, 'utf-8');
        const template = handlebars.compile(templateSource);
        return template(templateData);
    }

    /**
     * Build mail options object for nodemailer
     * @private
     */
    static _buildMailOptions(recipient, order, htmlContent) {
        return {
            from: `"Indikara" <${emailConfig.from}>`,
            to: recipient.email,
            subject: `Order Confirmation - Order #${order.txnid || order._id}`,
            html: htmlContent,
            text: this._buildPlainTextEmail(recipient.name, order)
        };
    }

    /**
     * Build plain text email fallback
     * @private
     */
    static _buildPlainTextEmail(customerName, order) {
        return `Dear ${customerName},

Thank you for your order!

Order ID: ${order._id}
Transaction ID: ${order.txnid || 'N/A'}
Total Amount: ₹${order.totalPrice}
Payment Status: ${order.isPaid ? 'PAID' : 'PENDING'}

We will send you a shipping confirmation email as soon as your order ships.

Thank you for shopping with Indikara!`;
    }

    /**
     * Send email via transporter
     * @private
     */
    static async _sendEmail(mailOptions, order) {
        const info = await transporter.sendMail(mailOptions);
        return info;
    }

    /**
     * Update order with email sent status
     * @private
     */
    static async _updateOrderEmailStatus(order) {
        order.emailSent = true;
        order.emailSentAt = new Date();
        await order.save();
    }

    /**
     * Log email sending error
     * @private
     */
    static _logEmailError(error, order) {
        logger.error('Failed to send order confirmation email', {
            orderId: order._id,
            txnid: order.txnid,
            error: error.message,
            stack: error.stack
        });
    }
}

module.exports = EmailService;
