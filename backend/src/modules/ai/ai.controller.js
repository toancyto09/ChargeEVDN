/**
 * AI Controller
 * Handles AI recommendation requests
 */

import * as aiService from './ai.service.js';
import logger from '../../utils/logger.js';
import { HTTP_STATUS } from '../../config/app.constants.js';
import { asyncHandler } from '../../middlewares/errorHandler.middleware.js';
import {
  parseFloatWithDefault,
  parseIntWithDefault,
} from '../../utils/helpers.js';
import { DEFAULTS } from './ai.constants.js';

/**
 * GET /api/ai/recommendations
 * Get AI-powered charging station recommendations
 */
export const getRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user?.id || null; // Optional: from JWT (guest users have null)
  
  const {
    lat,
    lng,
    soc,
    maxPrice,
    radius,
    limit,
  } = req.query;

  // Parse parameters with defaults
  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);
  const socValue = parseIntWithDefault(soc, DEFAULTS.SOC);
  const maxPriceValue = parseIntWithDefault(maxPrice, DEFAULTS.MAX_PRICE);
  const radiusValue = parseFloatWithDefault(radius, DEFAULTS.RADIUS);
  const limitValue = parseIntWithDefault(limit, DEFAULTS.LIMIT);

  console.log('🔵 AI CONTROLLER: GET /api/ai/recommendations');
  console.log('🔵 AI CONTROLLER: Params:', {
    userId,
    lat: userLat,
    lng: userLng,
    soc: socValue,
    maxPrice: maxPriceValue,
    radius: radiusValue,
    limit: limitValue,
  });
  
  logger.request('AI Recommendations', req.method, {
    userId,
    lat: userLat,
    lng: userLng,
    soc: socValue,
  });

  // Get recommendations
  const result = await aiService.getAIRecommendations({
    userId,
    userLat,
    userLng,
    soc: socValue,
    maxPrice: maxPriceValue,
    radiusKm: radiusValue,
    limit: limitValue,
  });

  console.log('✅ AI CONTROLLER: Returning', result.data?.length || 0, 'recommendations');
  console.log('✅ AI CONTROLLER: Metadata:', result.metadata);

  res.status(HTTP_STATUS.OK).json(result);
});

/**
 * GET /api/ai/recommendations/explain/:stationId
 * Get detailed explanation for a specific station recommendation
 */
export const explainRecommendation = asyncHandler(async (req, res) => {
  const { stationId } = req.params;
  const { lat, lng, soc } = req.query;

  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);
  const socValue = parseIntWithDefault(soc, DEFAULTS.SOC);

  logger.request('AI Explain', req.method, { stationId });

  // Get all recommendations to find the specific station
  const result = await aiService.getAIRecommendations({
    userId: req.user?.id || null,
    userLat,
    userLng,
    soc: socValue,
    maxPrice: 999999, // No price limit for explanation
    radiusKm: 100,    // Wide radius
    limit: 1000,      // Get all possible stations
  });

  const station = result.data?.find((s) => s.id_tram === parseInt(stationId));

  if (!station) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Không tìm thấy trạm sạc',
    });
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      station,
      explanation: {
        ai_score: station.ai_score,
        reasons: station.reasons || [],
        soc_context: socValue < 20 ? 'critical' : socValue < 50 ? 'low' : 'normal',
        chargeTime: station.chargeTimeMinutes,
      },
    },
  });
});

