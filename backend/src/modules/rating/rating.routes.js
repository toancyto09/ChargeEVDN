import express from 'express';
import ratingController from './rating.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * Rating Routes
 * All routes require authentication
 */

// Create a new rating
router.post('/', authenticateToken, ratingController.createRating);

// Get user's ratings
router.get('/my', authenticateToken, ratingController.getMyRatings);

// Check if user can rate a booking
router.get('/can-rate/:bookingId', authenticateToken, ratingController.canRateBooking);

// Get ratings for a station
router.get('/station/:id', ratingController.getStationRatings);

// Get average rating for a station
router.get('/station/:id/average', ratingController.getStationAverage);

export default router;

