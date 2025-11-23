/**
 * Profile Validator
 * Validation middleware cho profile APIs
 */

import { body, validationResult } from 'express-validator';
import { ApiError } from '../../middlewares/errorHandler.middleware.js';
import { HTTP_STATUS } from '../../config/app.constants.js';
import {
  ERROR_MESSAGES,
  VALIDATION_RULES,
  GENDER_OPTIONS,
} from './profile.constants.js';

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, errorMessages.join(', '));
  }
  next();
};

/**
 * Validate update profile request
 */
export const validateUpdateProfile = [
  body('ho_ten')
    .optional()
    .trim()
    .isLength({ min: VALIDATION_RULES.HO_TEN.MIN_LENGTH, max: VALIDATION_RULES.HO_TEN.MAX_LENGTH })
    .withMessage(ERROR_MESSAGES.INVALID_HO_TEN)
    .matches(VALIDATION_RULES.HO_TEN.PATTERN)
    .withMessage(ERROR_MESSAGES.INVALID_HO_TEN),

  body('so_dien_thoai')
    .optional()
    .trim()
    .matches(VALIDATION_RULES.SO_DIEN_THOAI.PATTERN)
    .withMessage(ERROR_MESSAGES.INVALID_SO_DIEN_THOAI),

  body('gioi_tinh')
    .optional()
    .isIn(GENDER_OPTIONS)
    .withMessage(ERROR_MESSAGES.INVALID_GIOI_TINH),

  body('ngay_sinh')
    .optional()
    .isISO8601()
    .withMessage('Ngày sinh phải có định dạng YYYY-MM-DD')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      
      if (birthDate >= today) {
        throw new Error('Ngày sinh phải trong quá khứ');
      }
      
      return true;
    }),

  handleValidationErrors,
];

/**
 * Validate change password request
 */
export const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Mật khẩu hiện tại không được để trống'),

  body('newPassword')
    .notEmpty()
    .withMessage('Mật khẩu mới không được để trống')
    .isLength({ min: VALIDATION_RULES.PASSWORD.MIN_LENGTH, max: VALIDATION_RULES.PASSWORD.MAX_LENGTH })
    .withMessage(ERROR_MESSAGES.INVALID_PASSWORD)
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('Mật khẩu mới không được trùng với mật khẩu cũ');
      }
      return true;
    }),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Xác nhận mật khẩu không được để trống')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Xác nhận mật khẩu không khớp');
      }
      return true;
    }),

  handleValidationErrors,
];

