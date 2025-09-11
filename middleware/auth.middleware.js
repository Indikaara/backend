const passport = require('passport');

// This middleware uses the 'jwt' strategy to protect routes
// It will attach the authenticated user to req.user
const protect = passport.authenticate('jwt', { session: false });

module.exports = { protect };
