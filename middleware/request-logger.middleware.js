const { logger } = require('../config/logger');

/**
 * Middleware to log request details
 */
const requestLogger = (req, res, next) => {
    // Capture the start time of the request
    const start = Date.now();

    // Log the incoming request
    logger.http(`→ ${req.method} ${req.originalUrl}`, {
        method: req.method,
        url: req.originalUrl,
        query: req.query,
        body: req.method !== 'GET' ? req.body : undefined,
        ip: req.ip,
        userAgent: req.get('user-agent')
    });

    // Capture response
    const originalSend = res.send;
    res.send = function(body) {
        const duration = Date.now() - start;
        
        // Log the response
        logger.http(`← ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`, {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration,
            responseSize: body ? body.length : 0
        });

        // Call the original send function
        return originalSend.call(this, body);
    };

    next();
};

/**
 * Middleware to log errors
 */
const errorLogger = (err, req, res, next) => {
    logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl,
        body: req.body,
        query: req.query,
        user: req.user ? req.user._id : undefined
    });
    
    next(err);
};

module.exports = {
    requestLogger,
    errorLogger
};