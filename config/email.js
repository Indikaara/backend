const nodemailer = require('nodemailer');
const { logger } = require('./logger');

// Email configuration from environment variables
// Note: Render.com and many cloud platforms block port 465, use 587 with STARTTLS instead
const emailConfig = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for 587
    requireTLS: process.env.EMAIL_PORT === '587', // Require TLS for port 587
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
    logger.info('Email config debug', {
        enabled: emailConfig.enabled,
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        hasUser: !!emailConfig.auth.user,
        hasPass: !!emailConfig.auth.pass,
        user: emailConfig.auth.user ? '***' + emailConfig.auth.user.slice(-10) : 'undefined',
        from: emailConfig.from
    });

    if (!emailConfig.enabled) {
        logger.info('Email sending is disabled via EMAIL_ENABLED environment variable');
        return null;
    }

    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
        logger.warn('Email credentials not configured. Set EMAIL_USER and EMAIL_PASSWORD environment variables.');
        return null;
    }

    try {
        // For cloud platforms like Render.com, port 587 with STARTTLS works better than 465
        // If port 465 is specified but we're on a cloud platform, log a warning
        const isCloudPlatform = process.env.RENDER || process.env.VERCEL || process.env.HEROKU;
        
        if (isCloudPlatform && emailConfig.port === 465) {
            logger.warn('Port 465 may be blocked on cloud platforms. Consider using port 587 with STARTTLS.', {
                platform: process.env.RENDER ? 'Render.com' : process.env.VERCEL ? 'Vercel' : process.env.HEROKU ? 'Heroku' : 'Unknown'
            });
        }

        transporter = nodemailer.createTransport({
            host: emailConfig.host,
            port: emailConfig.port,
            secure: emailConfig.secure, // true for 465 (SSL), false for 587 (STARTTLS)
            requireTLS: !emailConfig.secure && emailConfig.port === 587, // Require TLS for port 587
            auth: emailConfig.auth,
            connectionTimeout: 60000, // 60 seconds
            greetingTimeout: 30000, // 30 seconds
            socketTimeout: 60000, // 60 seconds
            pool: false, // Disable pooling on cloud platforms to avoid connection issues
            tls: {
                // Do not fail on invalid certificates (some SMTP servers have self-signed certs)
                rejectUnauthorized: false,
                // Allow older TLS versions for compatibility
                minVersion: 'TLSv1'
            }
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

// Verify SMTP connection
const verifyConnection = async () => {
    if (!transporter) {
        logger.warn('Cannot verify connection: transporter not configured');
        return false;
    }

    try {
        await transporter.verify();
        logger.info('SMTP connection verified successfully');
        return true;
    } catch (error) {
        logger.error('SMTP connection verification failed', {
            error: error.message,
            code: error.code,
            command: error.command
        });
        return false;
    }
};

module.exports = {
    transporter,
    emailConfig,
    createTransporter,
    verifyConnection
};
