import jwt from 'jsonwebtoken';
import { generateToken } from './service.js';

/**
 * Google OAuth Success Handler
 * Redirect to frontend with JWT token
 */
export const googleAuthSuccess = (req, res) => {
  try {
    const user = req.user;

    if (!user) {
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

    // Redirect to frontend with token and user data
    // Frontend will save token to localStorage
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/google/callback?token=${token}&user=${encodeURIComponent(
      JSON.stringify(userData)
    )}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('❌ Google auth success handler error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
  }
};

/**
 * Google OAuth Failure Handler
 */
export const googleAuthFailure = (req, res) => {
  console.error('❌ Google authentication failed');
  res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
};
