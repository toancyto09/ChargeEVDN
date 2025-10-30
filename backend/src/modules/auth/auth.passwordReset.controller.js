/**
 * Auth Password Reset Controller
 * Handles password reset flow with OTP
 */

import * as passwordResetService from './auth.passwordReset.service.js';
import { HTTP_STATUS } from '../../config/app.constants.js';
import { SUCCESS_MESSAGES } from './auth.constants.js';
import { asyncHandler } from '../../middlewares/errorHandler.middleware.js';
import logger from '../../utils/logger.js';

/**
 * POST /api/auth/forgot-password
 * Request OTP for password reset
 */
export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;

  logger.request('Forgot Password', req.method, { email });

  const result = await passwordResetService.requestPasswordReset(email);

  res.status(HTTP_STATUS.OK).json(result);
});

/**
 * POST /api/auth/verify-otp
 * Verify OTP code
 */
export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  logger.request('Verify OTP', req.method, { email });

  const result = await passwordResetService.verifyOTP(email, otp);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: SUCCESS_MESSAGES.OTP_VALID,
    data: {
      email: result.email,
      ho_ten: result.ho_ten,
    },
  });
});

/**
 * POST /api/auth/reset-password
 * Reset password with OTP
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, mat_khau } = req.body;

  logger.request('Reset Password', req.method, { email });

  const result = await passwordResetService.resetPasswordWithOTP(
    email,
    otp,
    mat_khau
  );

  res.status(HTTP_STATUS.OK).json(result);
});

