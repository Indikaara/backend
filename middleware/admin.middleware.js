// Middleware to ensure the authenticated user is an admin
module.exports = (req, res, next) => {
    try {
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        return next();
    } catch (err) {
        console.error('admin.middleware error', err);
        return res.status(500).json({ message: 'Server error' });
    }
};
