/**
 * Auth Validator
 * Request validation middleware for authentication routes
 */

import {
  EMAIL_REGEX,
  PASSWORD_CONFIG,
  OTP_CONFIG,
  VALIDATION_MESSAGES,
} from './auth.constants.js';
import { HTTP_STATUS } from '../../config/app.constants.js';

/**
 * Validate registration request
 */
export function validateRegister(req, res, next) {
  const { ho_ten, email, mat_khau, confirm_mat_khau } = req.body;

  // Check required fields
  if (!ho_ten || !email || !mat_khau) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: VALIDATION_MESSAGES.REQUIRED_FIELDS,
    });
  }

  // Validate email format
  if (!EMAIL_REGEX.test(email)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: VALIDATION_MESSAGES.INVALID_EMAIL,
    });
  }

  // Validate password length
  if (
    mat_khau.length < PASSWORD_CONFIG.MIN_LENGTH ||
    mat_khau.length > PASSWORD_CONFIG.MAX_LENGTH
  ) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: `Mật khẩu phải có từ ${PASSWORD_CONFIG.MIN_LENGTH} đến ${PASSWORD_CONFIG.MAX_LENGTH} ký tự`,
    });
  }

  // Validate password confirmation (if provided)
  if (confirm_mat_khau && mat_khau !== confirm_mat_khau) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: VALIDATION_MESSAGES.PASSWORD_MISMATCH,
    });
  }

  next();
}

/**
 * Validate login request
 */
export function validateLogin(req, res, next) {
  const { email, mat_khau } = req.body;

  if (!email || !mat_khau) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Vui lòng nhập email và mật khẩu',
    });
  }

  // Validate email format
  if (!EMAIL_REGEX.test(email)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: VALIDATION_MESSAGES.INVALID_EMAIL,
    });
  }

  next();
}

/**
 * Validate forgot password request
 */
export function validateForgotPassword(req, res, next) {
  const { email } = req.body;

  if (!email) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Vui lòng nhập email',
    });
  }

  // Validate email format
  if (!EMAIL_REGEX.test(email)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: VALIDATION_MESSAGES.INVALID_EMAIL,
    });
  }

  next();
}

/**
 * Validate OTP verification request
 */
export function validateVerifyOTP(req, res, next) {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Vui lòng nhập email và mã OTP',
    });
  }

  // Validate email format
  if (!EMAIL_REGEX.test(email)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: VALIDATION_MESSAGES.INVALID_EMAIL,
    });
  }

  // Validate OTP format (6 digits)
  const otpRegex = new RegExp(`^\\d{${OTP_CONFIG.LENGTH}}$`);
  if (!otpRegex.test(otp)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: VALIDATION_MESSAGES.INVALID_OTP,
    });
  }

  next();
}

/**
 * Validate password reset request
 */
export function validateResetPassword(req, res, next) {
  const { email, otp, mat_khau, confirm_mat_khau } = req.body;

  if (!email || !otp || !mat_khau || !confirm_mat_khau) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: VALIDATION_MESSAGES.REQUIRED_FIELDS,
    });
  }

  // Validate email format
  if (!EMAIL_REGEX.test(email)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: VALIDATION_MESSAGES.INVALID_EMAIL,
    });
  }

  // Validate OTP format
  const otpRegex = new RegExp(`^\\d{${OTP_CONFIG.LENGTH}}$`);
  if (!otpRegex.test(otp)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: VALIDATION_MESSAGES.INVALID_OTP,
    });
  }

  // Validate password length
  if (
    mat_khau.length < PASSWORD_CONFIG.MIN_LENGTH ||
    mat_khau.length > PASSWORD_CONFIG.MAX_LENGTH
  ) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: VALIDATION_MESSAGES.INVALID_PASSWORD,
    });
  }

  // Validate password confirmation
  if (mat_khau !== confirm_mat_khau) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: VALIDATION_MESSAGES.PASSWORD_MISMATCH,
    });
  }

  next();
}

