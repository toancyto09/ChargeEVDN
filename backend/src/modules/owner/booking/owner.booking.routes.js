import express from 'express';
import ownerBookingController from './owner.booking.controller.js';
import { authenticateToken } from '../../../middlewares/auth.middleware.js';
import { checkOwnerRole } from '../owner.middleware.js';

const router = express.Router();

/**
 * Owner Booking Routes
 * Base path: /api/owner/bookings
 * All routes require authentication and owner role
 * 
 * IMPORTANT: Specific routes must come BEFORE dynamic routes (/:id)
 */

// Get booking statistics (must be before /:id)
router.get('/bookings/stats', authenticateToken, checkOwnerRole, ownerBookingController.getStats);

// Get bookings calendar view (must be before /:id)
router.get('/bookings/calendar', authenticateToken, checkOwnerRole, ownerBookingController.getCalendar);

// Get all bookings for owner's stations
router.get('/bookings', authenticateToken, checkOwnerRole, ownerBookingController.getBookings);

// Confirm booking (specific action, before /:id)
router.post('/bookings/:id/confirm', authenticateToken, checkOwnerRole, ownerBookingController.confirmBooking);

// Cancel booking (specific action, before /:id)
router.post('/bookings/:id/cancel', authenticateToken, checkOwnerRole, ownerBookingController.cancelBooking);

// Get booking detail (dynamic route, must be last)
router.get('/bookings/:id', authenticateToken, checkOwnerRole, ownerBookingController.getBookingDetail);

export default router;

