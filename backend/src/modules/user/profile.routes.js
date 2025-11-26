/**
 * Profile Routes
 * Định nghĩa các routes cho quản lý hồ sơ cá nhân
 */

import express from 'express';
import * as profileController from './profile.controller.js';
import { validateUpdateProfile, validateChangePassword } from './profile.validator.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { uploadAvatar, handleMulterError } from '../../middlewares/upload.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/profile
 * @desc    Lấy thông tin profile của user đang đăng nhập
 * @access  Private
 */
router.get('/', authenticateToken, profileController.getProfile);

/**
 * @route   PUT /api/profile
 * @desc    Cập nhật thông tin profile
 * @access  Private
 */
router.put(
  '/',
  authenticateToken,
  validateUpdateProfile,
  profileController.updateProfile
);

/**
 * @route   PUT /api/profile/password
 * @desc    Đổi mật khẩu
 * @access  Private
 */
router.put(
  '/password',
  authenticateToken,
  validateChangePassword,
  profileController.changePassword
);

/**
 * @route   POST /api/profile/avatar
 * @desc    Upload ảnh đại diện
 * @access  Private
 */
router.post(
  '/avatar',
  authenticateToken,
  uploadAvatar,
  handleMulterError,
  profileController.uploadAvatar
);

export default router;

