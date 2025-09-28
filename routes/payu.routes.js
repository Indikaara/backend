const express = require('express');
const router = express.Router();
const { payuWebhook, initiatePayment } = require('../controllers/payu.controller');
const { protect } = require('../middleware/auth.middleware');

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
router.use('/webhook', express.urlencoded({ extended: true, verify: rawBodySaver }));
router.post('/webhook', payuWebhook);

module.exports = router;
