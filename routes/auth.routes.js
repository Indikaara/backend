const express = require('express');
const passport = require('passport');
const router = express.Router();
const { registerUser, loginUser, googleCallback, googleTokenAuth, demoLogin, seedAdmin } = require('../controllers/auth.controller');

// Local auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.post('/google', googleTokenAuth);

// Demo login route (creates/returns a demo user and token)
router.post('/demo-login', demoLogin);
router.post('/seed-admin', seedAdmin);

router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login', session: false }), 
    googleCallback
);

module.exports = router;
