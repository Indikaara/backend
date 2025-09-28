const { User } = require('../models/user.model');
const { logger } = require('../config/logger');

// @desc    Get current user's profile
// @route   GET /api/users/me
/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password -googleId');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        logger.error('getMe error', { error: err.message, stack: err.stack });
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update current user's profile
// @route   PUT /api/users/me
/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Update current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated user profile
 *       400:
 *         description: Email already in use
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
exports.updateMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, email, password } = req.body;
        if (name) user.name = name;
        if (email && email !== user.email) {
            // Ensure email is unique
            const existing = await User.findOne({ email });
            if (existing) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            user.email = email;
        }
        if (password) user.password = password; // will be hashed by pre-save hook

        await user.save();
        res.json({ _id: user._id, name: user.name, email: user.email });
    } catch (err) {
        logger.error('updateMe error', { error: err.message, stack: err.stack });
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin: Get user by id
// @route GET /api/users/:id
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -googleId');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        logger.error('getUserById error', { error: err.message, stack: err.stack });
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin: Get list of users
// @route GET /api/users
exports.listUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -googleId');
        res.json(users);
    } catch (err) {
        logger.error('listUsers error', { error: err.message, stack: err.stack });
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin: Delete user
// @route DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        await user.remove();
        res.json({ message: 'User removed' });
    } catch (err) {
        logger.error('deleteUser error', { error: err.message, stack: err.stack });
        res.status(500).json({ message: 'Server error' });
    }
};
