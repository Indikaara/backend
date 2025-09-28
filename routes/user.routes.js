const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const isAdmin = require('../middleware/admin.middleware');
const { getMe, updateMe, getUserById, listUsers, deleteUser } = require('../controllers/user.controller');

// Current user
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

// Admin routes
router.get('/', protect, isAdmin, listUsers);
router.get('/:id', protect, isAdmin, getUserById);
router.delete('/:id', protect, isAdmin, deleteUser);

module.exports = router;
