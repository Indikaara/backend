const payuConfig = require('../config/payu');
const crypto = require('crypto');
const { logger } = require('../config/logger');

class PayUService {
    /**
     * Generate PayU Hosted Checkout form data
     */
    static generatePaymentFormData(orderData) {
        try {
            // Basic validation
            if (!orderData) throw new Error('Order data is required');
            if (!orderData.baseUrl) throw new Error('Base URL is required');
            
            // Ensure clean transaction ID
            const timestamp = Date.now().toString();
            const txnid = `TXN${timestamp}`;
            
            // Format amount with exactly 2 decimal places
            const rawAmount = Number(orderData.amount) || 0;
            if (rawAmount <= 0) throw new Error('Invalid amount');
            const amount = rawAmount.toFixed(2);
            
            // Clean and prepare fields according to PayU requirements
            const productinfo = (orderData.productInfo || `Order_${timestamp}`)
                .replace(/[^a-zA-Z0-9\s-_]/g, '')
                .trim()
                .substring(0, 100); // Limit length
                
            const firstname = (orderData.firstName || 'Test User')
                .replace(/[^a-zA-Z0-9\s]/g, '')
                .trim()
                .substring(0, 60); // Limit length
                
            const email = (orderData.email || 'test@example.com')
                .toLowerCase()
                .trim();
                
            const phone = (orderData.phone || '9999999999')
                .replace(/[^0-9]/g, '')
                .substring(0, 10);
                
            const formData = {
                key: payuConfig.merchantKey,
                txnid: txnid,
                amount: amount,
                productinfo: productinfo,
                firstname: firstname,
                email: email,
                phone: phone,
                surl: `${orderData.baseUrl}${payuConfig.successUrl}`,
                furl: `${orderData.baseUrl}${payuConfig.failureUrl}`,
                lastname: '',
                address1: '',
                address2: '',
                city: '',
                state: '',
                country: '',
                zipcode: '',
                udf1: '',
                udf2: '',
                udf3: '',
                udf4: '',
                udf5: '',
                pg: ''
            };

            formData.hash = this.generatePaymentHash({
                txnid,
                amount,
                productinfo,
                firstname,
                email
            });
            // Debug log: print formData and hashString for troubleshooting
            logger.debug('PayU form data generated', { formData });
            logger.debug('PayU hash string generated', { 
                hashString: `${formData.key}|${formData.txnid}|${formData.amount}|${formData.productinfo}|${formData.firstname}|${formData.email}|||||||||||${payuConfig.merchantSalt}`
            });

            return {
                formData,
                paymentUrl: payuConfig.endpoints[payuConfig.mode]
            };
        } catch (err) {
            // Handle error appropriately, e.g., log and rethrow or return error object
            logger.error('Error generating PayU payment form data', { error: err.message, stack: err.stack });
            throw err;
        }
    }

    static generatePaymentHash({ txnid, amount, productinfo, firstname, email }) {
        // Validate all required inputs
        if (!txnid || !amount || !productinfo || !firstname || !email) {
            throw new Error('All hash parameters are required: txnid, amount, productinfo, firstname, email');
        }

        const key = payuConfig.merchantKey;
        const salt = payuConfig.merchantSalt;
        
        if (!key || !salt) {
            throw new Error('PayU merchant key or salt not configured');
        }

        // Ensure amount has exactly 2 decimal places
        const cleanAmount = Number(amount).toFixed(2);
        
        // Clean and validate input values according to PayU requirements
        const cleanTxnid = String(txnid).trim();
        const cleanProductInfo = String(productinfo).trim()
            .replace(/[^a-zA-Z0-9\s-_]/g, ''); // Only allow alphanumeric, space, hyphen, underscore
        const cleanFirstname = String(firstname).trim()
            .replace(/[^a-zA-Z0-9\s]/g, ''); // Only allow alphanumeric and space
        const cleanEmail = String(email).trim().toLowerCase();

        // Validate cleaned values
        if (!cleanTxnid || !cleanAmount || !cleanProductInfo || !cleanFirstname || !cleanEmail) {
            throw new Error('Invalid input parameters after cleaning');
        }
        
        // PayU hash sequence: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
        // Construct hash string exactly as specified in the documentation
        const hashString = `${key}|${cleanTxnid}|${cleanAmount}|${cleanProductInfo}|${cleanFirstname}|${cleanEmail}|||||||||||${salt}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');
    // Debug: log hashString and resulting hash to help diagnose mismatches (remove in production)
    logger.debug('PayU hash calculation', { hashString, hash });
    return hash;
    }
}

module.exports = PayUService;