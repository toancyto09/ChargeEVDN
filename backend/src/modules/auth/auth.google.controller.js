/**
 * Auth Google Controller
 * Handles Google OAuth authentication flow
 */

import { generateToken } from './auth.service.js';
import logger from '../../utils/logger.js';

/**
 * Google OAuth Success Handler
 * Redirect to frontend with JWT token after successful Google auth
 * GET /api/auth/google/callback
 */
export const googleAuthSuccess = (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      logger.error('Google auth failed: No user data');
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=authentication_failed`
      );
    }

    // Generate JWT token
    const token = generateToken(user.id_nguoi_dung, user.email, user.vai_tro);

    // Prepare user data (only essential fields)
    const userData = {
      id_nguoi_dung: user.id_nguoi_dung,
      ho_ten: user.ho_ten,
      email: user.email,
      vai_tro: user.vai_tro,
      trang_thai: user.trang_thai,
    };

    logger.info(`Google auth success: ${user.email}`);

    // Redirect to frontend with token and user data
    // Frontend will save token to localStorage
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/google/callback?token=${token}&user=${encodeURIComponent(
      JSON.stringify(userData)
    )}`;

    res.redirect(redirectUrl);
  } catch (error) {
    logger.error('Google auth success handler error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
  }
};

/**
 * Google OAuth Failure Handler
 * Redirect to frontend login page with error
 * GET /api/auth/google/failure
 */
export const googleAuthFailure = (req, res) => {
  logger.error('Google authentication failed');
  res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
};

