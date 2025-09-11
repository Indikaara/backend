const express = require('express');
const passport = require('passport');
const router = express.Router();
const { registerUser, loginUser, googleCallback } = require('../controllers/auth.controller');

// Local auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login', session: false }), 
    googleCallback
);

module.exports = router;
