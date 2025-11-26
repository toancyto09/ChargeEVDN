/**
 * Profile Service
 * Business logic cho quản lý hồ sơ cá nhân
 */

import { pool } from '../../config/db.js';
import bcrypt from 'bcryptjs';
import { ApiError } from '../../middlewares/errorHandler.middleware.js';
import { HTTP_STATUS } from '../../config/app.constants.js';
import {
  ERROR_MESSAGES,
  ALLOWED_UPDATE_FIELDS,
  MIN_AGE,
} from './profile.constants.js';
import logger from '../../utils/logger.js';

/**
 * Lấy thông tin profile của user
 */
export const getProfile = async (userId) => {
  try {
    const query = `
      SELECT 
        id_nguoi_dung,
        ho_ten,
        email,
        so_dien_thoai,
        gioi_tinh,
        ngay_sinh,
        vai_tro,
        trang_thai,
        duong_dan_anh_dai_dien,
        ngay_tao
      FROM nguoi_dung
      WHERE id_nguoi_dung = $1
    `;

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.PROFILE_NOT_FOUND);
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Error in getProfile service:', error);
    throw error;
  }
};

/**
 * Cập nhật thông tin profile
 */
export const updateProfile = async (userId, updateData) => {
  try {
    // Filter only allowed fields
    const allowedData = {};
    ALLOWED_UPDATE_FIELDS.forEach((field) => {
      if (updateData[field] !== undefined) {
        allowedData[field] = updateData[field];
      }
    });

    if (Object.keys(allowedData).length === 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Không có dữ liệu để cập nhật');
    }

    // Check if phone number already exists (if updating phone)
    if (allowedData.so_dien_thoai) {
      const phoneCheck = await pool.query(
        'SELECT id_nguoi_dung FROM nguoi_dung WHERE so_dien_thoai = $1 AND id_nguoi_dung != $2',
        [allowedData.so_dien_thoai, userId]
      );

      if (phoneCheck.rows.length > 0) {
        throw new ApiError(HTTP_STATUS.CONFLICT, ERROR_MESSAGES.PHONE_ALREADY_EXISTS);
      }
    }

    // Validate age if updating ngay_sinh
    if (allowedData.ngay_sinh) {
      const birthDate = new Date(allowedData.ngay_sinh);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (
        age < MIN_AGE ||
        (age === MIN_AGE && monthDiff < 0) ||
        (age === MIN_AGE && monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.INVALID_NGAY_SINH);
      }
    }

    // Build dynamic UPDATE query
    const fields = Object.keys(allowedData);
    const values = Object.values(allowedData);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

    const query = `
      UPDATE nguoi_dung
      SET ${setClause}
      WHERE id_nguoi_dung = $1
      RETURNING 
        id_nguoi_dung,
        ho_ten,
        email,
        so_dien_thoai,
        gioi_tinh,
        ngay_sinh,
        vai_tro,
        trang_thai,
        duong_dan_anh_dai_dien,
        ngay_tao
    `;

    const result = await pool.query(query, [userId, ...values]);

    if (result.rows.length === 0) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.PROFILE_NOT_FOUND);
    }

    logger.info(`Profile updated for user ${userId}`);
    return result.rows[0];
  } catch (error) {
    logger.error('Error in updateProfile service:', error);
    throw error;
  }
};

/**
 * Đổi mật khẩu
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    // Get current password hash
    const userQuery = await pool.query(
      'SELECT mat_khau FROM nguoi_dung WHERE id_nguoi_dung = $1',
      [userId]
    );

    if (userQuery.rows.length === 0) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.PROFILE_NOT_FOUND);
    }

    const user = userQuery.rows[0];

    // Check if user has password (not Google OAuth only)
    if (!user.mat_khau) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Tài khoản đăng nhập bằng Google không thể đổi mật khẩu'
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.mat_khau);
    if (!isPasswordValid) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_MESSAGES.CURRENT_PASSWORD_INCORRECT
      );
    }

    // Check if new password is same as old
    const isSamePassword = await bcrypt.compare(newPassword, user.mat_khau);
    if (isSamePassword) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.PASSWORD_SAME_AS_OLD);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE nguoi_dung SET mat_khau = $1 WHERE id_nguoi_dung = $2',
      [hashedPassword, userId]
    );

    logger.info(`Password changed for user ${userId}`);
    return true;
  } catch (error) {
    logger.error('Error in changePassword service:', error);
    throw error;
  }
};

/**
 * Cập nhật avatar
 */
export const updateAvatar = async (userId, avatarPath) => {
  try {
    const query = `
      UPDATE nguoi_dung
      SET duong_dan_anh_dai_dien = $1
      WHERE id_nguoi_dung = $2
      RETURNING 
        id_nguoi_dung,
        ho_ten,
        email,
        duong_dan_anh_dai_dien
    `;

    const result = await pool.query(query, [avatarPath, userId]);

    if (result.rows.length === 0) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.PROFILE_NOT_FOUND);
    }

    logger.info(`Avatar updated for user ${userId}`);
    return result.rows[0];
  } catch (error) {
    logger.error('Error in updateAvatar service:', error);
    throw error;
  }
};

