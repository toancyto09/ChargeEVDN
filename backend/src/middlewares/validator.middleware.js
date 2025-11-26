/**
 * Validation Middleware
 * Provides common validation utilities
 */

import { HTTP_STATUS, ERROR_MESSAGES, VALIDATION_RULES } from '../config/app.constants.js';
import { ApiError } from './errorHandler.middleware.js';

/**
 * Validate required fields exist
 */
export function validateRequiredFields(fields) {
  return (req, res, next) => {
    const missingFields = [];

    for (const field of fields) {
      const value = req.body[field];
      if (value === undefined || value === null || value === '') {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_MESSAGES.MISSING_REQUIRED_FIELDS,
        { missingFields }
      );
    }

    next();
  };
}

/**
 * Validate email format
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (Vietnam)
 */
export function validatePhone(phone) {
  const phoneRegex = /^(0|\+84)[0-9]{9}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate latitude
 */
export function validateLatitude(lat) {
  const latNum = parseFloat(lat);
  return (
    !isNaN(latNum) &&
    latNum >= VALIDATION_RULES.LAT_MIN &&
    latNum <= VALIDATION_RULES.LAT_MAX
  );
}

/**
 * Validate longitude
 */
export function validateLongitude(lng) {
  const lngNum = parseFloat(lng);
  return (
    !isNaN(lngNum) &&
    lngNum >= VALIDATION_RULES.LNG_MIN &&
    lngNum <= VALIDATION_RULES.LNG_MAX
  );
}

/**
 * Validate coordinates
 */
export function validateCoordinates(req, res, next) {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Thiếu tọa độ (lat, lng)',
      { lat, lng }
    );
  }

  if (!validateLatitude(lat)) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Vĩ độ không hợp lệ',
      { lat, validRange: `${VALIDATION_RULES.LAT_MIN} to ${VALIDATION_RULES.LAT_MAX}` }
    );
  }

  if (!validateLongitude(lng)) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Kinh độ không hợp lệ',
      { lng, validRange: `${VALIDATION_RULES.LNG_MIN} to ${VALIDATION_RULES.LNG_MAX}` }
    );
  }

  next();
}

/**
 * Validate number range
 */
export function validateNumberRange(value, min, max, fieldName = 'Value') {
  const num = parseFloat(value);
  if (isNaN(num)) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `${fieldName} phải là số`,
      { value, expected: 'number' }
    );
  }
  if (num < min || num > max) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `${fieldName} phải nằm trong khoảng ${min}-${max}`,
      { value: num, min, max }
    );
  }
  return num;
}

/**
 * Validate SOC (State of Charge)
 */
export function validateSOC(soc) {
  if (soc === undefined || soc === null) return VALIDATION_RULES.SOC_MAX / 2; // Default 50%
  return validateNumberRange(
    soc,
    VALIDATION_RULES.SOC_MIN,
    VALIDATION_RULES.SOC_MAX,
    'SOC (pin)'
  );
}

/**
 * Validate pagination params
 */
export function validatePagination(req, res, next) {
  const { page = 1, limit = 20 } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  if (isNaN(pageNum) || pageNum < 1) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Số trang không hợp lệ', { page });
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Giới hạn không hợp lệ', { limit });
  }

  req.pagination = {
    page: pageNum,
    limit: limitNum,
    offset: (pageNum - 1) * limitNum,
  };

  next();
}

/**
 * Sanitize string input
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
}

/**
 * Express-validator error handler middleware
 * Sử dụng với express-validator
 */
import { validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: ERROR_MESSAGES.VALIDATION_ERROR || 'Dữ liệu không hợp lệ',
      errors: errors.array(),
    });
  }
  
  next();
};

