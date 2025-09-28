const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
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
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());
// HTTP request logging in dev
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.urlencoded({ extended: false }));

// CORS middleware with specific options
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Vite's default development port
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
