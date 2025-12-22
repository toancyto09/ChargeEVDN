import express from 'express';
import ownerRatingController from './owner.rating.controller.js';
import { authenticateToken } from '../../../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * Owner Rating Routes
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

// Get all ratings for owner's stations
router.get('/ratings', ownerRatingController.getRatings);

// Get rating statistics
router.get('/ratings/stats', ownerRatingController.getStats);

// Get rating detail
router.get('/ratings/:id', ownerRatingController.getRatingDetail);

export default router;
