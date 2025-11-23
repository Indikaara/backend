const express = require('express');
const router = express.Router();
const { payuWebhook, initiatePayment, payuReturnHandler } = require('../controllers/payu.controller');
const { protect } = require('../middleware/auth.middleware');
const { validatePayuHash, validateContentType, logPayuRequest } = require('../middleware/payu.middleware');

// Protected payment initiation endpoint for Hosted Checkout
router.post('/initiate', protect, initiatePayment);

// PayU Hosted Checkout webhook endpoint
// We need the raw body for auditing and verification
const rawBodySaver = (req, res, buf, encoding) => {
    if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || 'utf8');
    }
};

// Use express.urlencoded with verify to capture raw body
// Webhook (raw body captured for verification)
router.use('/webhook', express.urlencoded({ extended: true, verify: rawBodySaver }));
router.post('/webhook', payuWebhook);

// PayU hosted checkout redirects (surl/furl) — PayU sends form-encoded POST when redirecting
// We parse urlencoded bodies for these endpoints and run validation middleware before responding
router.use('/success', express.urlencoded({ extended: true }));
router.post('/success', validateContentType, logPayuRequest, validatePayuHash, payuReturnHandler);

router.use('/failure', express.urlencoded({ extended: true }));
router.post('/failure', validateContentType, logPayuRequest, validatePayuHash, payuReturnHandler);

module.exports = router;
