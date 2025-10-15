const { User } = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { logger } = require('../config/logger');

// Helper function to generate token
const generateToken = (userId) => {
    logger.debug('Generating JWT token', { userId });
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *           examples:
 *             demo:
 *               value:
 *                 name: 'Alice'
 *                 email: 'alice@example.com'
 *                 password: 'password123'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: User already exists or invalid data
 *       500:
 *         description: Server error
 */
exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    console.log(`[AUTH] Register attempt for email: ${email} from IP: ${req.ip}`);
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            console.log(`[AUTH] User already exists: ${email}`);
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ name, email, password });
        console.log(`[AUTH] User created successfully: ${email}, ID: ${user._id}`);

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            console.log(`[AUTH] Failed to create user: ${email}`);
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(`[AUTH] Register error for ${email}:`, error.message);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log(`[AUTH] Login attempt for email: ${email} from IP: ${req.ip}`);
    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            console.log(`[AUTH] Login successful for: ${email}, ID: ${user._id}`);
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            console.log(`[AUTH] Login failed for: ${email} - Invalid credentials`);
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(`[AUTH] Login error for ${email}:`, error.message);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
exports.googleCallback = (req, res) => {
    console.log(`[AUTH] Google OAuth callback for user ID: ${req.user._id}`);
    const token = generateToken(req.user._id);
    // Successful authentication, redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/login/success?token=${token}`);
};

// @desc    Google OAuth with token
// @route   POST /api/auth/google
exports.googleTokenAuth = async (req, res) => {
    const { token } = req.body;
    console.log(`[AUTH] Google token auth attempt`);
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name } = payload;
        console.log(`[AUTH] Google token verified for email: ${email}, googleId: ${googleId}`);

        // Find or create user
        let user = await User.findOne({ googleId });
        if (!user) {
            user = await User.findOne({ email });
            if (user) {
                // Link googleId
                user.googleId = googleId;
                await user.save();
                console.log(`[AUTH] Linked Google account to existing user: ${email}, ID: ${user._id}`);
            } else {
                // Create new user
                user = await User.create({ name, email, googleId });
                console.log(`[AUTH] Created new user via Google: ${email}, ID: ${user._id}`);
            }
        } else {
            console.log(`[AUTH] Found existing Google user: ${email}, ID: ${user._id}`);
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error(`[AUTH] Google token auth error:`, error.message);
        res.status(400).json({ message: 'Google authentication failed' });
    }
};

// @desc Demo login - find or create a demo user and return a token
// @route POST /api/auth/demo-login
/**
 * @swagger
 * /api/auth/demo-login:
 *   post:
 *     summary: Create or fetch a demo user and return a JWT (dev only)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Demo user created/fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             examples:
 *               demo:
 *                 value:
 *                   _id: 'user_123'
 *                   name: 'Demo User'
 *                   email: 'demo@example.com'
 *                   token: 'jwt_token_here'
 */
exports.demoLogin = async (req, res) => {
    // Only allow demo login in non-production or when explicitly enabled
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DEMO_LOGIN !== 'true') {
        return res.status(403).json({ message: 'Demo login disabled in production' });
    }
    try {
    const demoEmail = process.env.DEMO_EMAIL || 'demo@example.com';
        const demoName = process.env.DEMO_NAME || 'Demo User';
        let user = await User.findOne({ email: demoEmail });
        if (!user) {
            user = await User.create({ name: demoName, email: demoEmail, password: 'demo-password', isAdmin: false, isDemo: true });
            console.log(`[AUTH] Created demo user: ${demoEmail}`);
        } else {
            // Ensure demo user flags
            let changed = false;
            if (user.isAdmin) {
                user.isAdmin = false;
                changed = true;
            }
            if (!user.isDemo) {
                user.isDemo = true;
                changed = true;
            }
            if (changed) await user.save();
        }
        res.json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
    } catch (err) {
        console.error('demoLogin error', err);
        res.status(500).json({ message: 'Demo login failed' });
    }
};

// @desc Seed an admin user (dev-only or when ENABLE_SEED_ADMIN=true)
// @route POST /api/auth/seed-admin
/**
 * @swagger
 * /api/auth/seed-admin:
 *   post:
 *     summary: Seed an admin user (dev only) and return JWT
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Admin user created/ensured
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             examples:
 *               admin:
 *                 value:
 *                   _id: 'admin_123'
 *                   name: 'Admin User'
 *                   email: 'admin@example.com'
 *                   token: 'jwt_admin_token_here'
 */
exports.seedAdmin = async (req, res) => {
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_SEED_ADMIN !== 'true') {
        return res.status(403).json({ message: 'Seeding admin disabled in production' });
    }
    try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
        const adminName = process.env.ADMIN_NAME || 'Admin User';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin-password';
        let user = await User.findOne({ email: adminEmail });
        if (!user) {
            user = await User.create({ name: adminName, email: adminEmail, password: adminPassword, isAdmin: true });
            console.log(`[AUTH] Created admin user: ${adminEmail}`);
        } else {
            user.isAdmin = true;
            await user.save();
            console.log(`[AUTH] Ensured admin user: ${adminEmail}`);
        }
        res.json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
    } catch (err) {
        console.error('seedAdmin error', err);
        res.status(500).json({ message: 'Seeding admin failed' });
    }
};
