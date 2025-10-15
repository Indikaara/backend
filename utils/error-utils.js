class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Mongoose validation error formatter
const handleMongooseValidationError = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    return {
        message: 'Invalid input data',
        details: errors,
        code: 'VALIDATION_ERROR'
    };
};

// Mongoose duplicate key error formatter
const handleDuplicateKeyError = (err) => {
    const field = Object.keys(err.keyValue)[0];
    return {
        message: `Duplicate field: ${field}`,
        details: [`${field} already exists`],
        code: 'DUPLICATE_KEY'
    };
};

// JWT token error formatter
const handleJWTError = () => ({
    message: 'Invalid token',
    details: ['Please log in again'],
    code: 'INVALID_TOKEN'
});

// JWT expired error formatter
const handleJWTExpiredError = () => ({
    message: 'Token expired',
    details: ['Please log in again'],
    code: 'TOKEN_EXPIRED'
});

// PayU error formatter
const handlePayUError = (err) => ({
    message: 'Payment processing error',
    details: [err.message],
    code: 'PAYMENT_ERROR'
});

module.exports = {
    AppError,
    handleMongooseValidationError,
    handleDuplicateKeyError,
    handleJWTError,
    handleJWTExpiredError,
    handlePayUError
};