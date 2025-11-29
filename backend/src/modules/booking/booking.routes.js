import express from 'express';
import bookingController from './booking.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * Booking Routes
 * All routes require authentication
 */

// Get available time slots for a connector
router.get('/connector/:id/slots', authenticateToken, bookingController.getAvailableSlots);

// Create a new booking
router.post('/', authenticateToken, bookingController.createBooking);

// Get user's bookings
router.get('/', authenticateToken, bookingController.getUserBookings);

// Get booking by ID
router.get('/:id', authenticateToken, bookingController.getBookingById);

// Extend booking expiry (for late arrivals)
router.post('/:id/extend', authenticateToken, bookingController.extendBooking);

// Cancel booking
router.delete('/:id', authenticateToken, bookingController.cancelBooking);

export default router;

