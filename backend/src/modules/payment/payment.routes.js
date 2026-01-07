import express from 'express';
import paymentController from './payment.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { auditLog } from '../../middlewares/auditLog.middleware.js';

const router = express.Router();

/**
 * Payment Routes
 * All routes for payment operations
 * NOTE: Payment ONLY happens AFTER charging session completes
 */

// Create payment from session (requires authentication)
router.post('/create', authenticateToken, auditLog.paymentCreate, paymentController.createPayment);

// VNPay callback (no authentication required - called by VNPay)
// This endpoint handles both success and failure automatically
router.get('/vnpay/callback', paymentController.handleVNPayCallback);

// Get payment by session ID (requires authentication)
router.get('/session/:sessionId', authenticateToken, paymentController.getPaymentBySession);

// Get payment by payment ID (requires authentication)
router.get('/:paymentId', authenticateToken, paymentController.getPaymentById);

export default router;

