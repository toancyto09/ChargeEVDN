import express from 'express';
import stationRoutes from './station/admin.station.routes.js';
import userRoutes from './user/admin.user.routes.js';
import analyticsRoutes from './analytics/admin.analytics.routes.js';

const router = express.Router();

/**
 * Admin API Routes
 * Base path: /api/admin
 */

// Station approval routes
router.use('/stations', stationRoutes);

// User management routes
router.use('/users', userRoutes);

// Analytics routes
router.use('/analytics', analyticsRoutes);

export default router;
