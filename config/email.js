const nodemailer = require('nodemailer');
const { logger } = require('./logger');

// Email configuration from environment variables
const emailConfig = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    enabled: process.env.EMAIL_ENABLED !== 'false' // default to enabled
};

// Create reusable transporter
let transporter = null;

const createTransporter = () => {
    if (!emailConfig.enabled) {
        logger.info('Email sending is disabled via EMAIL_ENABLED environment variable');
        return null;
    }

    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
        logger.warn('Email credentials not configured. Set EMAIL_USER and EMAIL_PASSWORD environment variables.');
        return null;
    }

    try {
        transporter = nodemailer.createTransporter({
            host: emailConfig.host,
            port: emailConfig.port,
            secure: emailConfig.secure,
            auth: emailConfig.auth
        });

        logger.info('Email transporter created successfully', {
            host: emailConfig.host,
            port: emailConfig.port,
            user: emailConfig.auth.user
        });

        return transporter;
    } catch (error) {
        logger.error('Failed to create email transporter', { error: error.message });
        return null;
    }
};

// Initialize transporter
transporter = createTransporter();

module.exports = {
    transporter,
    emailConfig,
    createTransporter
};
