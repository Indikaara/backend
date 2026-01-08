const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { logger } = require('./config/logger');
const { requestLogger, errorLogger } = require('./middleware/request-logger.middleware');
const cors = require('cors');
const passport = require('passport');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/db');
const AppError = require('./utils/appError');

// Load env vars
dotenv.config();
logger.info('Environment variables loaded', {
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? '***' : 'undefined',
    EMAIL_ENABLED: process.env.EMAIL_ENABLED,
    cwd: process.cwd()
});

// Now load email service after env vars are loaded
const EmailService = require('./services/email.service');

const swaggerOptions = require('./swagger.config');
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Connect to database
connectDB().then(() => {
    logger.info('Database connected successfully');
}).catch(err => {
    logger.error('Database connection failed', { error: err.message, stack: err.stack });
});

const app = express();

// Request logging middleware
app.use((req, res, next) => {
    logger.http(`Incoming ${req.method} request`, {
        path: req.path,
        query: req.query,
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});

// Body parser middleware
app.use(express.json());
// HTTP request logging in dev
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.urlencoded({ extended: false }));

// CORS middleware with specific options
app.use(cors({
    origin: [
        'http://localhost:5173',     // Vite's default development port
        'http://127.0.0.1:5173',     // Alternative local development URL
        'https://backend-wei5.onrender.com',  // Production backend
        'https://www.indikaara.com'          // Production frontend
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Origin',
        'X-Requested-With',
        'Accept'
    ],
    credentials: true,
    maxAge: 86400 // CORS preflight cache for 24 hours
}));

// Passport middleware
app.use(passport.initialize());
require('./config/passport')(passport);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/health', require('./routes/health.routes'));
app.use('/api/orders', require('./routes/order.routes'));
// Debug route to verify server routing
app.get('/api/email/test-debug', (req, res) => res.json({ ok: true }));
// PayU webhook (no auth - PayU will POST here)
app.use('/api/payu', require('./routes/payu.routes'));
// Admin routes (webhook viewer)
app.use('/api/admin', require('./routes/admin.routes'));
// User routes (profile, admin user management)
app.use('/api/users', require('./routes/user.routes'));
// Email test routes (no auth)
app.use('/api/email', require('./routes/email.routes'));

// Direct test endpoint (no-auth) - fallback if routes aren't mounted
app.get('/api/email/test', async (req, res) => {
    try {
        const email = 'ashutoshhome42@gmail.com';
        const customerName = 'Ashutosh';

        const dummyOrder = {
            _id: 'TEST-ORDER-' + Date.now(),
            txnid: 'TEST-TXN-' + Date.now(),
            isPaid: true,
            paidAt: new Date(),
            createdAt: new Date(),
            totalPrice: 1999.00,
            emailSent: false,
            user: null,
            paymentResult: {
                email_address: email,
                firstname: customerName
            },
            products: [
                { product: { name: 'Handcrafted Wooden Bowl' }, quantity: 2, price: 799.00 },
                { product: { name: 'Traditional Clay Pot' }, quantity: 1, price: 401.00 }
            ],
            shippingAddress: {
                address: '123 MG Road', city: 'Mumbai', state: 'Maharashtra', postalCode: '400001', country: 'India'
            },
            save: async function() { return this; }
        };

        const result = await EmailService.sendOrderConfirmationEmail(dummyOrder);
        return res.status(200).json({ success: result, recipient: email, testOrderId: dummyOrder._id });
    } catch (err) {
        logger.error('Direct test email failed', { error: err.message });
        return res.status(500).json({ success: false, error: err.message });
    }
});

// Alternate test endpoint (top-level) to avoid any route prefix conflicts
app.get('/test-email', async (req, res) => {
    try {
        const email = 'ashutoshhome42@gmail.com';
        const customerName = 'Ashutosh';
        const dummyOrder = {
            _id: 'TEST-ORDER-' + Date.now(),
            txnid: 'TEST-TXN-' + Date.now(),
            isPaid: true,
            paidAt: new Date(),
            createdAt: new Date(),
            totalPrice: 1999.00,
            emailSent: false,
            user: null,
            paymentResult: { email_address: email, firstname: customerName },
            products: [ { product: { name: 'Handcrafted Wooden Bowl' }, quantity: 2, price: 799.00 } ],
            shippingAddress: { address: '123 MG Road', city: 'Mumbai', state: 'Maharashtra', postalCode: '400001', country: 'India' },
            save: async function() { return this; }
        };

        const result = await EmailService.sendOrderConfirmationEmail(dummyOrder);
        return res.status(200).json({ success: result, recipient: email, testOrderId: dummyOrder._id });
    } catch (err) {
        logger.error('Top-level test email failed', { error: err.message });
        return res.status(500).json({ success: false, error: err.message });
    }
});

// Debug: list registered routes (for troubleshooting)
try {
    const routes = [];
    const entries = [];
    if (app._router && Array.isArray(app._router.stack)) {
        app._router.stack.forEach((mw, idx) => {
            entries.push({ idx, name: mw && mw.name, route: !!(mw && mw.route) });
            try {
                if (mw && mw.route && mw.route.path) {
                    const methods = Object.keys(mw.route.methods).join(',').toUpperCase();
                    routes.push(`${methods} ${mw.route.path}`);
                } else if (mw && mw.name === 'router' && mw.handle && Array.isArray(mw.handle.stack)) {
                    mw.handle.stack.forEach(r => {
                        if (r && r.route && r.route.path) {
                            const methods = Object.keys(r.route.methods).join(',').toUpperCase();
                            routes.push(`${methods} ${r.route.path}`);
                        }
                    });
                }
            } catch (inner) {
                // ignore layer read errors
            }
        });
    }
    logger.info('Router stack entries', { entries });
    logger.info('Registered routes', { routes });
} catch (e) {
    logger.warn('Failed to enumerate routes', { error: e.message });
}

const PORT = process.env.PORT || 5000;

// Global error handlers
app.use(errorLogger);
app.use(require('./middleware/error.middleware'));

// Catch 404 and forward to error handler (must be after other routes)
app.use((req, res, next) => {
    next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// Start server
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
