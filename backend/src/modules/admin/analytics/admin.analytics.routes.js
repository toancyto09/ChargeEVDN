import express from 'express';
import adminAnalyticsController from './admin.analytics.controller.js';
import { authenticateToken } from '../../../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * Admin Analytics Routes
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

// Overview statistics
router.get('/overview', adminAnalyticsController.getOverview);

// Revenue chart
router.get('/revenue', adminAnalyticsController.getRevenueChart);

// User growth chart
router.get('/users', adminAnalyticsController.getUserGrowthChart);

// Sessions chart
router.get('/sessions', adminAnalyticsController.getSessionsChart);

// Top stations
router.get('/top-stations', adminAnalyticsController.getTopStations);

// Booking status distribution
router.get('/booking-status', adminAnalyticsController.getBookingStatus);

// Recent transactions
router.get('/recent-transactions', adminAnalyticsController.getRecentTransactions);

// Revenue by business
router.get('/revenue-by-business', adminAnalyticsController.getRevenueByBusiness);

export default router;
