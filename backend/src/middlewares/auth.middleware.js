/**
 * Authentication Middleware
 * JWT token verification and role-based access control
 */

import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/app.constants.js';
import { ApiError } from './errorHandler.middleware.js';

/**
 * Authenticate JWT Token and verify user status
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Access token required');
    }

    // Verify JWT token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return next(new ApiError(HTTP_STATUS.FORBIDDEN, ERROR_MESSAGES.INVALID_TOKEN));
      }

      // Check user status in database
      try {
        const userId = decoded.id_nguoi_dung || decoded.userId || decoded.id;
        const result = await pool.query(
          'SELECT id_nguoi_dung, email, vai_tro, trang_thai FROM nguoi_dung WHERE id_nguoi_dung = $1',
          [userId]
        );

        if (result.rows.length === 0) {
          return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Tài khoản không tồn tại'));
        }

        const user = result.rows[0];

        // Check if account is locked
        if (user.trang_thai === 'khoa') {
          return next(new ApiError(HTTP_STATUS.FORBIDDEN, 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên'));
        }

        // Check if account is pending verification
        if (user.trang_thai === 'cho_xac_thuc') {
          return next(new ApiError(HTTP_STATUS.FORBIDDEN, 'Tài khoản chưa được xác thực. Vui lòng kiểm tra email'));
        }

        // Add user info to request
        req.user = {
          id_nguoi_dung: user.id_nguoi_dung,
          userId: user.id_nguoi_dung, // For backward compatibility
          email: user.email,
          vai_tro: user.vai_tro,
          role: user.vai_tro, // For backward compatibility
          trang_thai: user.trang_thai
        };

        next();
      } catch (dbError) {
        console.error('Database error in auth middleware:', dbError);
        return next(new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Lỗi xác thực người dùng'));
      }
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
