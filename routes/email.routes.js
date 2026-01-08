const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email.controller');

/**
 * @swagger
 * /api/email/test:
 *   get:
 *     summary: Send test order confirmation email
 *     description: Trigger a test order confirmation email to ashutoshhome42@gmail.com with dummy order data. No authentication required.
 *     tags: [Email]
 *     responses:
 *       200:
 *         description: Email test result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 recipient:
 *                   type: string
 *                 testOrderId:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.get('/test', emailController.testEmail);

/**
 * @swagger
 * /api/email/status:
 *   get:
 *     summary: Get email service configuration status
 *     description: Check if email service is configured and ready to send emails
 *     tags: [Email]
 *     responses:
 *       200:
 *         description: Email service status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 status:
 *                   type: object
 *                   properties:
 *                     enabled:
 *                       type: boolean
 *                     configured:
 *                       type: boolean
 *                     host:
 *                       type: string
 *                     port:
 *                       type: number
 *                     from:
 *                       type: string
 *                     user:
 *                       type: string
 *                     hasPassword:
 *                       type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.get('/status', emailController.getEmailStatus);

module.exports = router;
