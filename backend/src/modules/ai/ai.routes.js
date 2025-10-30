/**
 * AI Routes
 * API endpoints for AI recommendation engine
 */

import { Router } from 'express';
import * as aiController from './ai.controller.js';
import { optionalAuth } from '../../middlewares/auth.middleware.js';
import {
  validateAIRecommendationsRequest,
  validateStationId,
} from './ai.validator.js';
import { asyncHandler } from '../../middlewares/errorHandler.middleware.js';

const router = Router();

/**
 * @route   GET /api/ai/recommendations
 * @desc    Get AI-powered charging station recommendations
 * @access  Public (works for both authenticated and guest users)
 * @query   lat, lng (required), soc, maxPrice, radius, limit
 * 
 * Example: /api/ai/recommendations?lat=15.524&lng=108.528&soc=30&maxPrice=8000&radius=15
 */
router.get(
  '/recommendations',
  optionalAuth,  // Allow both authenticated and guest users
  asyncHandler(validateAIRecommendationsRequest),
  aiController.getRecommendations
);

/**
 * @route   GET /api/ai/recommendations/explain/:stationId
 * @desc    Get detailed explanation for a specific station recommendation
 * @access  Public
 * @params  stationId (required)
 * @query   lat, lng, soc
 * 
 * Example: /api/ai/recommendations/explain/1?lat=15.524&lng=108.528&soc=30
 */
router.get(
  '/recommendations/explain/:stationId',
  optionalAuth,
  asyncHandler(validateStationId),
  asyncHandler(validateAIRecommendationsRequest),
  aiController.explainRecommendation
);

export default router;

