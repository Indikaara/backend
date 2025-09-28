const crypto = require('crypto');
const payuConfig = require('../config/payu');

/**
 * Validates PayU response hash to ensure request authenticity
 */
const validatePayuHash = (req, res, next) => {
    try {
        const {
            key,
            txnid,
            amount,
            productinfo,
            firstname,
            email,
            status,
            hash,
        } = req.body;

        // Verify all required fields are present
        if (!key || !txnid || !amount || !productinfo || !firstname || !email || !status || !hash) {
            return res.status(400).json({
                error: 'Missing required PayU response parameters'
            });
        }

        // Verify merchant key matches
        if (key !== payuConfig.merchantKey) {
            return res.status(403).json({
                error: 'Invalid merchant key'
            });
        }

        // For success transactions:
        // sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
        
        // For failure transactions:
        // sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)

        const responseString = `${payuConfig.merchantSalt}|${status}||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
        const calculatedHash = crypto.createHash('sha512').update(responseString).digest('hex');

        if (calculatedHash !== hash) {
            console.error('PayU hash validation failed');
            console.debug('Expected hash:', calculatedHash);
            console.debug('Received hash:', hash);
            console.debug('Response string:', responseString);
            return res.status(403).json({
                error: 'Invalid payment response hash'
            });
        }

        next();
    } catch (error) {
        console.error('Error in PayU hash validation:', error);
        res.status(500).json({
            error: 'Internal server error during payment validation'
        });
    }
};

/**
 * Validates content type is application/x-www-form-urlencoded
 */
const validateContentType = (req, res, next) => {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/x-www-form-urlencoded')) {
        return res.status(415).json({
            error: 'Invalid content type. Expected application/x-www-form-urlencoded'
        });
    }
    next();
};

/**
 * Log incoming PayU requests for debugging
 */
const logPayuRequest = (req, res, next) => {
    console.log('PayU Callback Request:', {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body
    });
    next();
};

module.exports = {
    validatePayuHash,
    validateContentType,
    logPayuRequest
};