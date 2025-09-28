const winston = require('winston');

// Define custom log levels
const logLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        debug: 4,
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        http: 'magenta',
        debug: 'white',
    },
};

// Add colors to Winston
winston.addColors(logLevels.colors);

// Create logger instance
const logger = winston.createLogger({
    levels: logLevels.levels,
    level: process.env.LOG_LEVEL || 'info', // Default to 'info' if not specified
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    transports: [
        // Console transport only
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize({ all: true }),
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.printf(
                    (info) => `${info.timestamp} ${info.level}: ${info.message} ${info.stack || ''} ${Object.keys(info).length > 3 ? JSON.stringify(Object.assign({}, info, { level: undefined, message: undefined, timestamp: undefined, stack: undefined })) : ''}`
                )
            ),
        }),
    ],
});

// No conditional console logging - it's always enabled now

// Utility function to get log level based on status code
const getLogLevel = (statusCode) => {
    if (statusCode >= 500) return 'error';
    if (statusCode >= 400) return 'warn';
    return 'info';
};

// Export the logger and utility functions
module.exports = {
    logger,
    getLogLevel,
    // Helper methods for consistent logging
    error: (message, meta = {}) => logger.error(message, meta),
    warn: (message, meta = {}) => logger.warn(message, meta),
    info: (message, meta = {}) => logger.info(message, meta),
    http: (message, meta = {}) => logger.http(message, meta),
    debug: (message, meta = {}) => logger.debug(message, meta),
};