/**
 * Station Module Validators
 * Request validation for station endpoints
 */

import { HTTP_STATUS, VALIDATION_RULES } from '../../config/app.constants.js';
import { ApiError } from '../../middlewares/errorHandler.middleware.js';
import {
  validateLatitude,
  validateLongitude,
  validateNumberRange,
} from '../../middlewares/validator.middleware.js';

/**
 * Validate Get Stations Request
 */
export function validateGetStationsRequest(req, res, next) {
  const { lat, lng, radius, maxPrice, minRating } = req.query;
  const errors = [];

  // Coordinates are optional for general station listing
  // But if provided, they must be valid
  if (lat && !validateLatitude(lat)) {
    errors.push(`Vĩ độ không hợp lệ: ${lat}`);
  }
  if (lng && !validateLongitude(lng)) {
    errors.push(`Kinh độ không hợp lệ: ${lng}`);
  }

  // Validate radius if provided
  if (radius !== undefined && radius !== null) {
    try {
      validateNumberRange(
        radius,
        VALIDATION_RULES.RADIUS_MIN,
        VALIDATION_RULES.RADIUS_MAX,
        'Bán kính'
      );
    } catch (error) {
      errors.push(error.message);
    }
  }

  // Validate maxPrice if provided
  if (maxPrice !== undefined && maxPrice !== null) {
    try {
      validateNumberRange(
        maxPrice,
        VALIDATION_RULES.PRICE_MIN,
        VALIDATION_RULES.PRICE_MAX,
        'Giá tối đa'
      );
    } catch (error) {
      errors.push(error.message);
    }
  }

  // Validate minRating if provided
  if (minRating !== undefined && minRating !== null) {
    try {
      validateNumberRange(
        minRating,
        VALIDATION_RULES.RATING_MIN,
        VALIDATION_RULES.RATING_MAX,
        'Đánh giá tối thiểu'
      );
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
 * Validate Station ID parameter
 */
export function validateStationIdParam(req, res, next) {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Thiếu ID trạm sạc');
  }

  const idNum = parseInt(id, 10);
  if (isNaN(idNum) || idNum <= 0) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'ID trạm sạc không hợp lệ', { id });
  }

  req.params.id = idNum;
  next();
}

