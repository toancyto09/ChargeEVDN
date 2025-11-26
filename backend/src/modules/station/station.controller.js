/**
 * Station Controller
 * Handles station-related requests
 */

import * as stationService from './station.service.js';
import logger from '../../utils/logger.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../../config/app.constants.js';
import { asyncHandler, ApiError } from '../../middlewares/errorHandler.middleware.js';

/**
 * GET /api/stations
 * Get all stations with optional filtering
 */
export const getAllStations = asyncHandler(async (req, res) => {
  console.log('🔵 BACKEND STATION CONTROLLER: GET /api/stations');
  console.log('🔵 BACKEND STATION CONTROLLER: Query params:', req.query);
  logger.request('GET', req.originalUrl);

  const stations = await stationService.getStations(req.query);

  console.log('✅ BACKEND STATION CONTROLLER: Returning', stations.length, 'stations');

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: stations,
    count: stations.length,
  });
});

/**
 * GET /api/stations/:id
 * Get station by ID
 */
export const getStationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  logger.request('GET', req.originalUrl);

  const station = await stationService.getStationById(id);

  if (!station) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.STATION_NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: station,
  });
});

