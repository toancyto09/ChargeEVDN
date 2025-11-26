/**
 * Auth Password Reset Service
 * Business logic for password reset with OTP
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import pool from '../../config/db.js';
import logger from '../../utils/logger.js';
import { sendOTPEmail } from '../../utils/emailService.js';
import {
  OTP_CONFIG,
  PASSWORD_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  USER_STATUS,
  SECURITY_CONFIG,
} from './auth.constants.js';
import { ApiError } from '../../middlewares/errorHandler.middleware.js';
import { HTTP_STATUS } from '../../config/app.constants.js';

/**
 * Generate 6-digit OTP
 * @returns {string} OTP code
 */
const generateOTP = () => {
  return crypto
    .randomInt(OTP_CONFIG.MIN_VALUE, OTP_CONFIG.MAX_VALUE)
    .toString();
};

/**
 * Request password reset - Generate OTP and save to user record
 * @param {string} email - User's email
 * @returns {object} Success message and OTP (for dev/testing)
 */
export const requestPasswordReset = async (email) => {
  // Find user by email
  const userResult = await pool.query(
    'SELECT id_nguoi_dung, ho_ten, email, trang_thai FROM nguoi_dung WHERE email = $1',
    [email]
  );

  // Security: Always return success even if email doesn't exist
  // This prevents email enumeration attacks
  if (userResult.rows.length === 0) {
    return {
      success: true,
      message: SUCCESS_MESSAGES.OTP_SENT,
    };
  }

  const user = userResult.rows[0];

  // Check if account is locked
  if (user.trang_thai === USER_STATUS.LOCKED) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, ERROR_MESSAGES.ACCOUNT_LOCKED);
  }

  // Generate OTP
  const otp = generateOTP();
  const expiryTime = new Date(Date.now() + OTP_CONFIG.EXPIRY_SECONDS * 1000);

  // Save OTP to user record
  await pool.query(
    'UPDATE nguoi_dung SET ma_xac_thuc = $1, han_ma_xac_thuc = $2 WHERE id_nguoi_dung = $3',
    [otp, expiryTime, user.id_nguoi_dung]
  );

  try {
    await sendOTPEmail(user.email, user.ho_ten, otp);
    logger.info(`OTP email sent to: ${user.email}`);
  } catch (emailError) {
    logger.error('Failed to send OTP email:', emailError.message);
    // Continue even if email fails (OTP still saved in DB)
  }

  return {
    success: true,
    message: SUCCESS_MESSAGES.OTP_SENT,
    // REMOVE THIS IN PRODUCTION! Only for development/testing
    ...(process.env.NODE_ENV === 'development' && {
      otp,
      email: user.email,
    }),
  };
};

/**
 * Verify OTP code
 * @param {string} email - User's email
 * @param {string} otp - 6-digit OTP code
 * @returns {object} User info if OTP is valid
 */
export const verifyOTP = async (email, otp) => {
  // Find user
  const result = await pool.query(
    `SELECT id_nguoi_dung, ho_ten, email, trang_thai, ma_xac_thuc, han_ma_xac_thuc
     FROM nguoi_dung 
     WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND);
  }

  const user = result.rows[0];

  // Check if OTP exists
  if (!user.ma_xac_thuc) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      ERROR_MESSAGES.OTP_NOT_REQUESTED
    );
  }

  // Check if OTP matches
  if (user.ma_xac_thuc !== otp) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.OTP_INCORRECT);
  }

  // Check if OTP is expired
  if (new Date() > new Date(user.han_ma_xac_thuc)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.OTP_EXPIRED);
  }

  // Check if account is locked
  if (user.trang_thai === USER_STATUS.LOCKED) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, ERROR_MESSAGES.ACCOUNT_LOCKED);
  }

  return {
    id_nguoi_dung: user.id_nguoi_dung,
    email: user.email,
    ho_ten: user.ho_ten,
  };
};

/**
 * Reset password with OTP
 * @param {string} email - User's email
 * @param {string} otp - 6-digit OTP code
 * @param {string} newPassword - New password
 * @returns {object} Success message
 */
export const resetPasswordWithOTP = async (email, otp, newPassword) => {
  // Validate password
  if (
    !newPassword ||
    newPassword.length < PASSWORD_CONFIG.MIN_LENGTH ||
    newPassword.length > PASSWORD_CONFIG.MAX_LENGTH
  ) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Mật khẩu phải có từ ${PASSWORD_CONFIG.MIN_LENGTH} đến ${PASSWORD_CONFIG.MAX_LENGTH} ký tự`
    );
  }

  // Verify OTP first
  const userData = await verifyOTP(email, otp);

  // Hash new password
  const salt = await bcrypt.genSalt(SECURITY_CONFIG.SALT_ROUNDS);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update password and clear OTP
  await pool.query(
    'UPDATE nguoi_dung SET mat_khau = $1, ma_xac_thuc = NULL, han_ma_xac_thuc = NULL WHERE id_nguoi_dung = $2',
    [hashedPassword, userData.id_nguoi_dung]
  );

  // Log activity
  await pool.query(
    `INSERT INTO nhat_ky_he_thong (id_nguoi_dung, hanh_dong, chi_tiet)
     VALUES ($1, $2, $3)`,
    [
      userData.id_nguoi_dung,
      'password_reset_otp',
      JSON.stringify({
        email: userData.email,
        timestamp: new Date().toISOString(),
      }),
    ]
  );

  logger.info(`Password reset successful for: ${userData.email}`);

  return {
    success: true,
    message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS,
  };
};

/**
 * Clean up expired OTPs (optional cron job)
 * @returns {number} Number of cleaned up OTPs
 */
export const cleanupExpiredOTPs = async () => {
  const result = await pool.query(
    'UPDATE nguoi_dung SET ma_xac_thuc = NULL, han_ma_xac_thuc = NULL WHERE han_ma_xac_thuc < NOW()'
  );

  logger.info(`Cleaned up ${result.rowCount} expired OTPs`);
  return result.rowCount;
};

