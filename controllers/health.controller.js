const mongoose = require('mongoose');

// @desc    Health check for app, DB, and OAuth
// @route   GET /api/health
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                 uptime:
 *                   type: number
 *                 services:
 *                   type: object
 *                   properties:
 *                     app:
 *                       type: string
 *                     database:
 *                       type: string
 *                     oauth:
 *                       type: string
 *       500:
 *         description: Health check failed
 */
exports.healthCheck = async (req, res) => {
    const health = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
            app: 'OK',
            database: 'UNKNOWN',
            oauth: 'UNKNOWN'
        }
    };

    // Check Database
    try {
        if (mongoose.connection.readyState === 1) {
            health.services.database = 'OK';
        } else {
            health.services.database = 'DISCONNECTED';
            health.status = 'DEGRADED';
        }
    } catch (error) {
        health.services.database = 'ERROR';
        health.status = 'ERROR';
    }

    // Check OAuth (Google) credentials
    try {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        if (clientId && clientSecret && clientId !== 'your_google_client_id.apps.googleusercontent.com' && clientSecret !== 'your_google_client_secret') {
            health.services.oauth = 'OK';
        } else {
            health.services.oauth = 'NOT_CONFIGURED';
            health.status = 'DEGRADED';
        }
    } catch (error) {
        health.services.oauth = 'ERROR';
        health.status = 'ERROR';
    }

    // Set overall status
    const allOk = Object.values(health.services).every(service => service === 'OK');
    if (!allOk && health.status === 'OK') {
        health.status = 'DEGRADED';
    }

    const statusCode = health.status === 'ERROR' ? 500 : health.status === 'DEGRADED' ? 200 : 200;
    res.status(statusCode).json(health);
};
