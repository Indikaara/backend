const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models/user.model');
const { logger } = require('./logger');

module.exports = (passport) => {
    // JWT Strategy Configuration
    passport.use(new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
        jsonWebTokenOptions: {
            maxAge: '7d' // Token expiry
        }
    }, async (jwt_payload, done) => {
        try {
            if (!jwt_payload || !jwt_payload.userId) {
                logger.warn('Invalid JWT payload', { payload: jwt_payload });
                return done(null, false);
            }

            const user = await User.findById(jwt_payload.userId);
            
            if (user) {
                logger.debug('JWT authentication successful', { 
                    userId: user._id,
                    email: user.email 
                });
                return done(null, user);
            }

            logger.warn('User not found for JWT', { 
                userId: jwt_payload.userId 
            });
            return done(null, false);
        } catch (err) {
            logger.error('JWT authentication error', {
                error: err.message,
                stack: err.stack,
                payload: jwt_payload
            });
            return done(err, false);
        }
    }));

    // Google OAuth Strategy
    passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `/api/auth/google/callback`, // Make sure this matches your Google console settings
            proxy: true
        },
        async (accessToken, refreshToken, profile, done) => {
            const newUser = {
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
            };

            try {
                let user = await User.findOne({ googleId: profile.id });
                if (user) {
                    done(null, user);
                } else {
                    // Check if user exists with this email
                    user = await User.findOne({ email: newUser.email });
                    if (user) {
                        // Link Google ID to existing account
                        user.googleId = newUser.googleId;
                        await user.save();
                        done(null, user);
                    } else {
                        // Create a new user
                        user = await User.create(newUser);
                        done(null, user);
                    }
                }
            } catch (err) {
                console.error(err);
                done(err, false);
            }
        }
    ));
};
