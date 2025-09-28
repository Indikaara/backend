const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const adminCheck = require('../middleware/admin.middleware');
const { getWebhookEvents } = require('../controllers/admin.controller');

// Admin routes - protected + admin-only
router.get('/webhooks', protect, adminCheck, getWebhookEvents);

module.exports = router;
