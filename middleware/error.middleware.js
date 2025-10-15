const { logger } = require('../config/logger');
const {
    handleMongooseValidationError,
    handleDuplicateKeyError,
    handleJWTError,
    handleJWTExpiredError,
    handlePayUError
} = require('../utils/error-utils');

const sendErrorDev = (err, res) => {
    logger.error('API Error', {
        error: err.message,
        stack: err.stack,
        statusCode: err.statusCode,
        status: err.status,
        isOperational: err.isOperational
    });

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        logger.warn('Operational Error', {
            error: err.message,
            statusCode: err.statusCode,
            status: err.status
        });

        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            code: err.code
        });
    }
    // Programming or other unknown error: don't leak error details
    else {
        logger.error('Programming Error', {
            error: err.message,
            stack: err.stack
        });

        res.status(500).json({
            status: 'error',
            message: 'Something went wrong',
            code: 'INTERNAL_SERVER_ERROR'
        });
    }
};

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        let error = { ...err };
        error.message = err.message;

        // Mongoose Validation Error
        if (err.name === 'ValidationError') {
            const formattedError = handleMongooseValidationError(err);
            error.statusCode = 400;
            error.message = formattedError.message;
            error.details = formattedError.details;
            error.code = formattedError.code;
        }

        // Mongoose Duplicate Key Error
        if (err.code === 11000) {
            const formattedError = handleDuplicateKeyError(err);
            error.statusCode = 400;
            error.message = formattedError.message;
            error.details = formattedError.details;
            error.code = formattedError.code;
        }

        // JWT Invalid Token Error
        if (err.name === 'JsonWebTokenError') {
            const formattedError = handleJWTError();
            error.statusCode = 401;
            error.message = formattedError.message;
            error.details = formattedError.details;
            error.code = formattedError.code;
        }

        // JWT Expired Token Error
        if (err.name === 'TokenExpiredError') {
            const formattedError = handleJWTExpiredError();
            error.statusCode = 401;
            error.message = formattedError.message;
            error.details = formattedError.details;
            error.code = formattedError.code;
        }

        // PayU Error
        if (err.name === 'PayUError') {
            const formattedError = handlePayUError(err);
            error.statusCode = 400;
            error.message = formattedError.message;
            error.details = formattedError.details;
            error.code = formattedError.code;
        }

        sendErrorProd(error, res);
    }
};

module.exports = errorHandler;