import express from 'express';
import adminAuditLogController from './admin.auditLog.controller.js';
import { authenticateToken } from '../../../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * Admin Audit Log Routes
 * All routes protected by admin auth middleware
 */

// Middleware to check admin role
const checkAdminRole = (req, res, next) => {
  const userRole = req.user.vai_tro || req.user.role;
  
  if (userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Chỉ quản trị viên mới có quyền truy cập',
    });
  }
  next();
};

// Apply auth + admin check to all routes
router.use(authenticateToken, checkAdminRole);

// Get audit logs with filters
router.get('/', adminAuditLogController.getLogs);

// Get statistics
router.get('/statistics', adminAuditLogController.getStatistics);

// Get activity timeline
router.get('/timeline', adminAuditLogController.getTimeline);

export default router;
