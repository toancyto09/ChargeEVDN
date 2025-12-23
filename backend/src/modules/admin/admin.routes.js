import express from 'express';
import stationRoutes from './station/admin.station.routes.js';

const router = express.Router();

/**
 * Admin API Routes
 * Base path: /api/admin
 */

// Station approval routes
router.use('/stations', stationRoutes);

export default router;
