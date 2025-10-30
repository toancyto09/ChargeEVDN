/**
 * Station Routes
 * API endpoints for charging stations
 */

import { Router } from 'express';
import * as stationController from './station.controller.js';
import { asyncHandler } from '../../middlewares/errorHandler.middleware.js';
import {
  validateGetStationsRequest,
  validateStationIdParam,
} from './station.validator.js';

const router = Router();

/**
 * @route   GET /api/stations
 * @desc    Get all charging stations with optional filtering
 * @access  Public
 * @query   lat, lng, radius, maxPrice, minRating, connector, status
 * 
 * Example: /api/stations?lat=15.524&lng=108.528&radius=10&maxPrice=5000&minRating=4
 */
router.get(
  '/',
  asyncHandler(validateGetStationsRequest),
  stationController.getAllStations
);

/**
 * @route   GET /api/stations/:id
 * @desc    Get station by ID
 * @access  Public
 * @params  id (station ID)
 * 
 * Example: /api/stations/1
 */
router.get(
  '/:id',
  asyncHandler(validateStationIdParam),
  stationController.getStationById
);

export default router;

