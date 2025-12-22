import express from 'express';
import ownerSessionController from './owner.session.controller.js';
import { authenticateToken } from '../../../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * Owner Session Routes
 * All routes protected by owner auth middleware
 */

// Middleware to check owner role
const checkOwnerRole = (req, res, next) => {
  if (req.user.vai_tro !== 'owner' && req.user.role !== 'owner') {
    return res.status(403).json({
      success: false,
      message: 'Chỉ chủ sở hữu trạm mới có quyền truy cập',
    });
  }
  next();
};

// Apply auth + owner check to all routes
router.use(authenticateToken, checkOwnerRole);

// Get all sessions for owner's stations
router.get('/sessions', ownerSessionController.getSessions);

// Get session statistics
router.get('/sessions/stats', ownerSessionController.getStats);

// Get session detail
router.get('/sessions/:id', ownerSessionController.getSessionDetail);

export default router;
