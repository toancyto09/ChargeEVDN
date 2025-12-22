import express from 'express';
import stationRoutes from './station/owner.station.routes.js';
import connectorRoutes from './connector/owner.connector.routes.js';
import bookingRoutes from './booking/owner.booking.routes.js';
import sessionRoutes from './session/owner.session.routes.js';
import ratingRoutes from './rating/owner.rating.routes.js';

const router = express.Router();

/**
 * Owner API Routes
 * Base path: /api/owner
 */

// Station management routes
router.use('/stations', stationRoutes);

// Connector management routes
router.use('/connectors', connectorRoutes);

// Booking management routes
router.use('/bookings', bookingRoutes);

// Session management routes
router.use('/sessions', sessionRoutes);

// Rating management routes
router.use('/ratings', ratingRoutes);

export default router;
