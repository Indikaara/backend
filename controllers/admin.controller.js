const WebhookEvent = require('../models/webhookEvent.model');

// GET /api/admin/webhooks
// Query params: page, limit, provider, hashValid (true/false)
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
