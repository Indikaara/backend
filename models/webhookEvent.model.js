const mongoose = require('mongoose');

const webhookEventSchema = new mongoose.Schema({
    provider: { type: String, required: true },
    payload: { type: Object, required: false },
    headers: { type: Object, required: false },
    ip: { type: String, required: false },
    rawBody: { type: String, required: false },
    hashValid: { type: Boolean, required: false },
    status: { type: String, required: false },
    failureReason: { type: String, required: false },
    receivedAt: { type: Date, default: Date.now },
});

const WebhookEvent = mongoose.model('WebhookEvent', webhookEventSchema);
module.exports = WebhookEvent;
