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

// Load env vars
dotenv.config();

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
// PayU webhook (no auth - PayU will POST here)
app.use('/api/payu', require('./routes/payu.routes'));
// Admin routes (webhook viewer)
app.use('/api/admin', require('./routes/admin.routes'));
// User routes (profile, admin user management)
app.use('/api/users', require('./routes/user.routes'));

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
