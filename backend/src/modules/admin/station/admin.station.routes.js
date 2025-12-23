import express from 'express';
import adminStationController from './admin.station.controller.js';
import { authenticateToken } from '../../../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * Admin Station Routes
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

// Get all stations (with filter)
router.get('/', adminStationController.getStations);

// Get station statistics
router.get('/stats', adminStationController.getStats);

// Get station detail
router.get('/:id', adminStationController.getStationDetail);

// Approve station
router.post('/:id/approve', adminStationController.approveStation);

// Reject station
router.post('/:id/reject', adminStationController.rejectStation);

export default router;
