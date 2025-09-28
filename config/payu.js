require('dotenv').config();

const payuConfig = {
    mode: process.env.PAYU_MODE || 'test', // test or live
    merchantKey: process.env.PAYU_MERCHANT_KEY,
    // Support either PAYU_MERCHANT_SALT (preferred) or PAYU_SALT (legacy)
    merchantSalt: process.env.PAYU_MERCHANT_SALT || process.env.PAYU_SALT,
    salt: process.env.PAYU_MERCHANT_SALT || process.env.PAYU_SALT,
    endpoints: {
        test: 'https://test.payu.in/_payment',
        live: 'https://secure.payu.in/_payment'
    },
    successUrl: process.env.PAYU_SUCCESS_URL || '/api/payu/success',
    failureUrl: process.env.PAYU_FAILURE_URL || '/api/payu/failure',
    webhookUrl: process.env.PAYU_WEBHOOK_URL || '/api/payu/webhook'
};

module.exports = payuConfig;