const express = require('express');
const router = express.Router();
const { healthCheck } = require('../controllers/health.controller');

// Health check route
router.get('/', healthCheck);

module.exports = router;
