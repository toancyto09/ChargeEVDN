/**
 * Profile Controller
 * Xử lý các request liên quan đến quản lý hồ sơ cá nhân
 */

import { asyncHandler } from '../../middlewares/errorHandler.middleware.js';
import { HTTP_STATUS } from '../../config/app.constants.js';
import { SUCCESS_MESSAGES } from './profile.constants.js';
import * as profileService from './profile.service.js';

/**
 * @route   GET /api/profile
 * @desc    Lấy thông tin profile của user đang đăng nhập
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const profile = await profileService.getProfile(userId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Lấy thông tin profile thành công',
    data: profile,
  });
});

/**
 * @route   PUT /api/profile
 * @desc    Cập nhật thông tin profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updateData = req.body;

  const updatedProfile = await profileService.updateProfile(userId, updateData);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: SUCCESS_MESSAGES.PROFILE_UPDATED,
    data: updatedProfile,
  });
});

/**
 * @route   PUT /api/profile/password
 * @desc    Đổi mật khẩu
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  await profileService.changePassword(userId, currentPassword, newPassword);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: SUCCESS_MESSAGES.PASSWORD_CHANGED,
  });
});

/**
 * @route   POST /api/profile/avatar
 * @desc    Upload ảnh đại diện
 * @access  Private
 */
export const uploadAvatar = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Check if file was uploaded
  if (!req.file) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Vui lòng chọn file ảnh để upload',
    });
  }

  // Get file path (relative to public folder)
  const avatarPath = `/uploads/avatars/${req.file.filename}`;

  const updatedProfile = await profileService.updateAvatar(userId, avatarPath);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: SUCCESS_MESSAGES.AVATAR_UPLOADED,
    data: {
      id_nguoi_dung: updatedProfile.id_nguoi_dung,
      ho_ten: updatedProfile.ho_ten,
      duong_dan_anh_dai_dien: updatedProfile.duong_dan_anh_dai_dien,
    },
  });
});

