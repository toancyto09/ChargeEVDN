/**
 * Authentication Middleware
 * JWT token verification and role-based access control
 */

import jwt from 'jsonwebtoken';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/app.constants.js';
import { ApiError } from './errorHandler.middleware.js';

/**
 * Authenticate JWT Token
 */
export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Access token required');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        // Use next(error) instead of throw in callback
        return next(new ApiError(HTTP_STATUS.FORBIDDEN, ERROR_MESSAGES.INVALID_TOKEN));
      }

      req.user = decoded; // { id, email, role }
      next();
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication - doesn't throw error if no token
 * Used for endpoints that work for both authenticated and guest users
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        req.user = null;
      } else {
        req.user = user;
      }
      next();
    });
  } catch (error) {
    req.user = null;
    next();
  }
};

/**
 * Role-based Access Control
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Bạn không có quyền truy cập');
    }

    next();
  };
};

