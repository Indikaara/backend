const WebhookEvent = require('../models/webhookEvent.model');

// GET /api/admin/webhooks
// Query params: page, limit, provider, hashValid (true/false)
/**
 * @swagger
 * /api/admin/webhooks:
 *   get:
 *     summary: List webhook events (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: provider
 *         schema:
 *           type: string
 *       - in: query
 *         name: hashValid
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Paginated webhook events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 events:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/WebhookEvent'
 *             examples:
 *               sample:
 *                 value:
 *                   page: 1
 *                   limit: 20
 *                   total: 1
 *                   events:
 *                     - _id: 'evt_123'
 *                       provider: 'payu'
 *                       status: 'success'
 *                       hashValid: true
 */
exports.getWebhookEvents = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page || '1'));
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '20')));
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.provider) filter.provider = req.query.provider;
        if (req.query.hashValid !== undefined) filter.hashValid = req.query.hashValid === 'true';

        const [events, total] = await Promise.all([
            WebhookEvent.find(filter).sort({ receivedAt: -1 }).skip(skip).limit(limit).lean(),
            WebhookEvent.countDocuments(filter),
        ]);

        res.json({ page, limit, total, events });
    } catch (error) {
        console.error('getWebhookEvents error', error);
        res.status(500).json({ message: 'Server error' });
    }
};
