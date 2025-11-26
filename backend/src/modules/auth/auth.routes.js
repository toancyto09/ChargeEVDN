/**
 * Auth Routes
 * Authentication and authorization routes
 */

import { Router } from 'express';
import passport from 'passport';
import * as authController from './auth.controller.js';
import * as passwordResetController from './auth.passwordReset.controller.js';
import * as googleAuthController from './auth.google.controller.js';
import * as authValidator from './auth.validator.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = Router();

// ============================
// PUBLIC ROUTES
// ============================

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  authValidator.validateRegister,
  authController.register
);

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', authValidator.validateLogin, authController.login);

// ============================
// PASSWORD RESET ROUTES (OTP-based)
// ============================

/**
 * POST /api/auth/forgot-password
 * Request OTP for password reset
 */
router.post(
  '/forgot-password',
  authValidator.validateForgotPassword,
  passwordResetController.requestPasswordReset
);

/**
 * POST /api/auth/verify-otp
 * Verify OTP code
 */
router.post(
  '/verify-otp',
  authValidator.validateVerifyOTP,
  passwordResetController.verifyOTP
);

/**
 * POST /api/auth/reset-password
 * Reset password with OTP
 */
router.post(
  '/reset-password',
  authValidator.validateResetPassword,
  passwordResetController.resetPassword
);

// ============================
// GOOGLE OAUTH ROUTES
// ============================

/**
 * GET /api/auth/google
 * Initiate Google OAuth flow
 */
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

/**
 * GET /api/auth/google/callback
 * Google OAuth callback
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/api/auth/google/failure',
    session: false,
  }),
  googleAuthController.googleAuthSuccess
);

/**
 * GET /api/auth/google/failure
 * Google OAuth failure handler
 */
router.get('/google/failure', googleAuthController.googleAuthFailure);

// ============================
// PROTECTED ROUTES (requires authentication)
// ============================

/**
 * GET /api/auth/profile
 * Get current user profile
 */
router.get('/profile', authenticateToken, authController.getProfile);

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
router.post('/logout', authenticateToken, authController.logout);

export default router;

