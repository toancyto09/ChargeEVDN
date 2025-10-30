/**
 * Auth Service
 * Business logic for authentication
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../../config/db.js';
import logger from '../../utils/logger.js';
import {
  ERROR_MESSAGES,
  USER_STATUS,
  SECURITY_CONFIG,
  JWT_CONFIG,
} from './auth.constants.js';
import { ApiError } from '../../middlewares/errorHandler.middleware.js';
import { HTTP_STATUS } from '../../config/app.constants.js';

/**
 * Generate JWT Token
 * @param {number} id - User ID
 * @param {string} email - User email
 * @param {string} role - User role
 * @returns {string} JWT token
 */
export const generateToken = (id, email, role) => {
  return jwt.sign(
    { id, email, role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || JWT_CONFIG.DEFAULT_EXPIRY,
    }
  );
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Object} User data and token
 */
export const registerUser = async (userData) => {
  const { ho_ten, email, mat_khau, so_dien_thoai } = userData;

  // Check if email exists
  const userExists = await pool.query(
    'SELECT * FROM nguoi_dung WHERE email = $1',
    [email]
  );

  if (userExists.rows.length > 0) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.EMAIL_EXISTS);
  }

  // Hash password
  const salt = await bcrypt.genSalt(SECURITY_CONFIG.SALT_ROUNDS);
  const hashedPassword = await bcrypt.hash(mat_khau, salt);

  // Insert user
  const result = await pool.query(
    `INSERT INTO nguoi_dung (ho_ten, email, mat_khau, so_dien_thoai, vai_tro, trang_thai)
     VALUES ($1, $2, $3, $4, 'user', $5)
     RETURNING id_nguoi_dung, ho_ten, email, vai_tro, trang_thai, ngay_tao`,
    [ho_ten, email, hashedPassword, so_dien_thoai, USER_STATUS.ACTIVE]
  );

  const user = result.rows[0];

  // Generate JWT token
  const token = generateToken(user.id_nguoi_dung, user.email, user.vai_tro);

  logger.info(`User registered: ${user.email}`);

  // Only return essential user fields (security best practice)
  const userResponse = {
    id_nguoi_dung: user.id_nguoi_dung,
    ho_ten: user.ho_ten,
    email: user.email,
    vai_tro: user.vai_tro,
    trang_thai: user.trang_thai,
  };

  return { user: userResponse, token };
};

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} mat_khau - User password
 * @returns {Object} User data and token
 */
export const loginUser = async (email, mat_khau) => {
  // Find user
  const result = await pool.query(
    'SELECT * FROM nguoi_dung WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_MESSAGES.INVALID_CREDENTIALS
    );
  }

  const user = result.rows[0];

  // Check account status
  if (user.trang_thai === USER_STATUS.LOCKED) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, ERROR_MESSAGES.ACCOUNT_LOCKED);
  }

  // Check if user has password (not Google OAuth user)
  if (!user.mat_khau) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.GOOGLE_ACCOUNT);
  }

  // Verify password
  const isMatch = await bcrypt.compare(mat_khau, user.mat_khau);

  if (!isMatch) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_MESSAGES.INVALID_CREDENTIALS
    );
  }

  // Generate token
  const token = generateToken(user.id_nguoi_dung, user.email, user.vai_tro);

  logger.info(`User logged in: ${user.email}`);

  // Only return essential user fields (security best practice)
  const userResponse = {
    id_nguoi_dung: user.id_nguoi_dung,
    ho_ten: user.ho_ten,
    email: user.email,
    vai_tro: user.vai_tro,
    trang_thai: user.trang_thai,
  };

  return { user: userResponse, token };
};

/**
 * Get user profile by ID
 * @param {number} userId - User ID
 * @returns {Object} User profile data
 */
export const getUserProfile = async (userId) => {
  const result = await pool.query(
    `SELECT id_nguoi_dung, ho_ten, email, so_dien_thoai, gioi_tinh, 
            ngay_sinh, vai_tro, trang_thai, ngay_tao
     FROM nguoi_dung WHERE id_nguoi_dung = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND);
  }

  return result.rows[0];
};

