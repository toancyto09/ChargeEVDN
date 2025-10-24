import { Router } from 'express';
import passport from 'passport';
import * as authController from './controller.js';
import * as passwordResetController from './passwordResetController.js';
import * as googleAuthController from './googleAuthController.js';
import { authenticateToken } from '../../middlewares/auth.js';

const router = Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Password reset routes (public) - OTP-based
router.post('/forgot-password', passwordResetController.requestPasswordReset);
router.post('/verify-otp', passwordResetController.verifyOTP);
router.post('/reset-password', passwordResetController.resetPassword);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/api/auth/google/failure',
    session: false,
  }),
  googleAuthController.googleAuthSuccess
);

router.get('/google/failure', googleAuthController.googleAuthFailure);

// Protected routes
router.get('/me', authenticateToken, authController.getProfile);
router.post('/logout', authenticateToken, authController.logout);

export default router;
