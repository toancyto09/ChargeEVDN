/**
 * AI Module Validators
 * Request validation for AI recommendation endpoints
 */

import { HTTP_STATUS } from '../../config/app.constants.js';
import { ApiError } from '../../middlewares/errorHandler.middleware.js';
import {
  validateLatitude,
  validateLongitude,
  validateNumberRange,
} from '../../middlewares/validator.middleware.js';
import { VALIDATION } from './ai.constants.js';

/**
 * Validate AI Recommendations Request
 */
export function validateAIRecommendationsRequest(req, res, next) {
  const { lat, lng, soc, maxPrice, radius, limit } = req.query;
  const errors = [];

  // Required fields
  if (!lat || !lng) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Thiếu tọa độ (lat, lng) để tính toán AI',
      { lat, lng }
    );
  }

  // Validate coordinates
  if (!validateLatitude(lat)) {
    errors.push(`Vĩ độ không hợp lệ: ${lat}`);
  }
  if (!validateLongitude(lng)) {
    errors.push(`Kinh độ không hợp lệ: ${lng}`);
  }

  // Validate SOC if provided
  if (soc !== undefined && soc !== null) {
    try {
      validateNumberRange(soc, VALIDATION.SOC_MIN, VALIDATION.SOC_MAX, 'SOC (pin)');
    } catch (error) {
      errors.push(error.message);
    }
  }

  // Validate maxPrice if provided
  if (maxPrice !== undefined && maxPrice !== null) {
    try {
      validateNumberRange(
        maxPrice,
        VALIDATION.PRICE_MIN,
        VALIDATION.PRICE_MAX,
        'Giá tối đa'
      );
    } catch (error) {
      errors.push(error.message);
    }
  }

  // Validate radius if provided
  if (radius !== undefined && radius !== null) {
    try {
      validateNumberRange(
        radius,
        VALIDATION.RADIUS_MIN,
        VALIDATION.RADIUS_MAX,
        'Bán kính'
      );
    } catch (error) {
      errors.push(error.message);
    }
  }

  // Validate limit if provided
  if (limit !== undefined && limit !== null) {
    try {
      validateNumberRange(limit, VALIDATION.LIMIT_MIN, VALIDATION.LIMIT_MAX, 'Giới hạn');
    } catch (error) {
      errors.push(error.message);
    }
  }

  if (errors.length > 0) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Dữ liệu không hợp lệ', { errors });
  }

  next();
}

/**
 * Validate Station ID for explanation endpoint
 */
export function validateStationId(req, res, next) {
  const { stationId } = req.params;

  if (!stationId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Thiếu ID trạm sạc');
  }

  const idNum = parseInt(stationId, 10);
  if (isNaN(idNum) || idNum <= 0) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'ID trạm sạc không hợp lệ', {
      stationId,
    });
  }

  req.params.stationId = idNum;
  next();
}

