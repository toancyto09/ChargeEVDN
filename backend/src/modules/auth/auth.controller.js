/**
 * Auth Controller
 * Handles authentication requests (register, login, profile, logout)
 */

import * as authService from './auth.service.js';
import { HTTP_STATUS } from '../../config/app.constants.js';
import { SUCCESS_MESSAGES } from './auth.constants.js';
import { asyncHandler } from '../../middlewares/errorHandler.middleware.js';
import logger from '../../utils/logger.js';

/**
 * POST /api/auth/register
 * Register a new user
 */
export const register = asyncHandler(async (req, res) => {
  const { ho_ten, email, mat_khau, so_dien_thoai } = req.body;

  logger.request('Register', req.method, { email });

  const result = await authService.registerUser({
    ho_ten,
    email,
    mat_khau,
    so_dien_thoai,
  });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: SUCCESS_MESSAGES.REGISTER_SUCCESS,
    data: result,
  });
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
export const login = asyncHandler(async (req, res) => {
  const { email, mat_khau } = req.body;

  logger.request('Login', req.method, { email });

  const result = await authService.loginUser(email, mat_khau);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
    data: result,
  });
});

/**
 * GET /api/auth/profile
 * Get current user profile (requires authentication)
 */
export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id_nguoi_dung || req.user.userId || req.user.id;
  const user = await authService.getUserProfile(userId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: user,
  });
});

/**
 * POST /api/auth/logout
 * Logout user (client-side mostly, token removal)
 */
export const logout = asyncHandler(async (req, res) => {
  logger.request('Logout', req.method, { userId: req.user?.id });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
  });
});

