import express from 'express';
import paymentController from './payment.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * Payment Routes
 * All routes for payment operations
 * NOTE: Payment ONLY happens AFTER charging session completes
 */

// Create payment from session (requires authentication)
router.post('/create', authenticateToken, paymentController.createPayment);

// VNPay callback (no authentication required - called by VNPay)
router.get('/vnpay/callback', paymentController.handleVNPayCallback);

// Get payment by session ID (requires authentication)
router.get('/session/:sessionId', authenticateToken, paymentController.getPaymentBySession);

// Get payment by payment ID (requires authentication)
router.get('/:paymentId', authenticateToken, paymentController.getPaymentById);

export default router;

