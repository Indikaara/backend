const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// Helper function to generate token
const generateToken = (id) => {
    console.log(`[AUTH] Generating JWT token for user ID: ${id}`);
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
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
    console.log(`[AUTH] Register attempt for email: ${email}`);
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
    console.log(`[AUTH] Login attempt for email: ${email}`);
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
