const crypto = require('crypto');
const payuConfig = require('../config/payu');
const { logger } = require('../config/logger');

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

    // Build reverse hash string per PayU docs (salt|status|<11 empty fields>|email|firstname|productinfo|amount|txnid|key)
    // Note: PayU uses a specific number of empty pipe-delimited fields between status and email.
    // The controller uses 11 empty fields — keep middleware consistent to avoid hash mismatches.

    const normalizedEmail = (email || '').toString().toLowerCase().trim();
    const normalizedFirst = (firstname || '').toString().trim();
    const normalizedProduct = (productinfo || '').toString();
    const normalizedAmount = (amount || '').toString();
    const normalizedTxn = (txnid || '').toString();
    const normalizedKey = (key || '').toString();

    const responseString = `${payuConfig.merchantSalt}|${status}|||||||||||${normalizedEmail}|${normalizedFirst}|${normalizedProduct}|${normalizedAmount}|${normalizedTxn}|${normalizedKey}`;
        const calculatedHash = crypto.createHash('sha512').update(responseString).digest('hex');

        if (calculatedHash !== hash) {
            logger.error('PayU hash validation failed', {
                expectedHash: calculatedHash,
                receivedHash: hash,
                responseString: responseString
            });
            return res.status(403).json({
                error: 'Invalid payment response hash'
            });
        }

        next();
    } catch (error) {
        logger.error('Error in PayU hash validation', { error: error.message, stack: error.stack });
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
    logger.http('PayU Callback Request', {
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