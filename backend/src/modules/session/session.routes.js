import express from 'express';
import sessionController from './session.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * Session Routes
 * All routes for charging session operations
 */

// Get user sessions with filters (requires authentication)
router.get('/', authenticateToken, sessionController.getUserSessions);

// Get unpaid sessions for current user (requires authentication)
// Must be BEFORE /:id route to avoid conflict
router.get('/unpaid', authenticateToken, sessionController.getUnpaidSessions);

// Start a charging session (requires authentication)
router.post('/start', authenticateToken, sessionController.startSession);

// Finish a charging session (requires authentication)
router.post('/:id/finish', authenticateToken, sessionController.finishSession);

// Get session details by ID (requires authentication)
router.get('/:id', authenticateToken, sessionController.getSessionById);

export default router;
