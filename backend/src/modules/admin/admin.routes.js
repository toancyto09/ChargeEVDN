import express from 'express';
import stationRoutes from './station/admin.station.routes.js';
import userRoutes from './user/admin.user.routes.js';

const router = express.Router();

/**
 * Admin API Routes
 * Base path: /api/admin
 */

// Station approval routes
router.use('/stations', stationRoutes);

// User management routes
router.use('/users', userRoutes);

export default router;
