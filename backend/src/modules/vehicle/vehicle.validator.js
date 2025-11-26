/**
 * Vehicle Validator
 * Validation middleware cho vehicle requests
 */

import { body, param } from 'express-validator';
import { validate } from '../../middlewares/validator.middleware.js';
import { HTTP_STATUS } from '../../config/app.constants.js';
import { VALIDATION_RULES } from './vehicle.constants.js';

/**
 * Validate create vehicle request
 */
export const validateCreateVehicle = [
  body('id_loai_cong')
    .notEmpty()
    .withMessage('Loại cổng sạc là bắt buộc')
    .isInt({ min: 1 })
    .withMessage('ID loại cổng sạc không hợp lệ'),

  body('hang_xe')
    .notEmpty()
    .withMessage('Hãng xe là bắt buộc')
    .isLength({ min: VALIDATION_RULES.HANG_XE.MIN_LENGTH, max: VALIDATION_RULES.HANG_XE.MAX_LENGTH })
    .withMessage(`Hãng xe phải từ ${VALIDATION_RULES.HANG_XE.MIN_LENGTH} đến ${VALIDATION_RULES.HANG_XE.MAX_LENGTH} ký tự`),

  body('dong_xe')
    .optional()
    .isLength({ max: VALIDATION_RULES.DONG_XE.MAX_LENGTH })
    .withMessage(`Dòng xe không được vượt quá ${VALIDATION_RULES.DONG_XE.MAX_LENGTH} ký tự`),

  body('bien_so')
    .optional()
    .isLength({ max: VALIDATION_RULES.BIEN_SO.MAX_LENGTH })
    .withMessage(`Biển số không được vượt quá ${VALIDATION_RULES.BIEN_SO.MAX_LENGTH} ký tự`),

  body('mau_xe')
    .optional()
    .isLength({ max: VALIDATION_RULES.MAU_XE.MAX_LENGTH })
    .withMessage(`Màu xe không được vượt quá ${VALIDATION_RULES.MAU_XE.MAX_LENGTH} ký tự`),

  body('nam_san_xuat')
    .optional()
    .isInt({ min: VALIDATION_RULES.NAM_SAN_XUAT.MIN, max: VALIDATION_RULES.NAM_SAN_XUAT.MAX })
    .withMessage(`Năm sản xuất phải từ ${VALIDATION_RULES.NAM_SAN_XUAT.MIN} đến ${VALIDATION_RULES.NAM_SAN_XUAT.MAX}`),

  body('dung_luong_pin_kwh')
    .optional()
    .isFloat({ min: VALIDATION_RULES.DUNG_LUONG_PIN.MIN, max: VALIDATION_RULES.DUNG_LUONG_PIN.MAX })
    .withMessage(`Dung lượng pin phải từ ${VALIDATION_RULES.DUNG_LUONG_PIN.MIN} đến ${VALIDATION_RULES.DUNG_LUONG_PIN.MAX} kWh`),

  body('cong_suat_sac_toi_da')
    .optional()
    .isFloat({ min: VALIDATION_RULES.CONG_SUAT_SAC.MIN, max: VALIDATION_RULES.CONG_SUAT_SAC.MAX })
    .withMessage(`Công suất sạc phải từ ${VALIDATION_RULES.CONG_SUAT_SAC.MIN} đến ${VALIDATION_RULES.CONG_SUAT_SAC.MAX} kW`),

  body('soc_hien_tai')
    .optional()
    .isInt({ min: VALIDATION_RULES.SOC.MIN, max: VALIDATION_RULES.SOC.MAX })
    .withMessage(`SOC phải từ ${VALIDATION_RULES.SOC.MIN} đến ${VALIDATION_RULES.SOC.MAX}%`),

  body('la_xe_chinh')
    .optional()
    .isBoolean()
    .withMessage('la_xe_chinh phải là boolean'),

  validate,
];

/**
 * Validate update vehicle request
 */
export const validateUpdateVehicle = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID phương tiện không hợp lệ'),

  body('id_loai_cong')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID loại cổng sạc không hợp lệ'),

  body('hang_xe')
    .optional()
    .isLength({ min: VALIDATION_RULES.HANG_XE.MIN_LENGTH, max: VALIDATION_RULES.HANG_XE.MAX_LENGTH })
    .withMessage(`Hãng xe phải từ ${VALIDATION_RULES.HANG_XE.MIN_LENGTH} đến ${VALIDATION_RULES.HANG_XE.MAX_LENGTH} ký tự`),

  body('dong_xe')
    .optional()
    .isLength({ max: VALIDATION_RULES.DONG_XE.MAX_LENGTH })
    .withMessage(`Dòng xe không được vượt quá ${VALIDATION_RULES.DONG_XE.MAX_LENGTH} ký tự`),

  body('bien_so')
    .optional()
    .isLength({ max: VALIDATION_RULES.BIEN_SO.MAX_LENGTH })
    .withMessage(`Biển số không được vượt quá ${VALIDATION_RULES.BIEN_SO.MAX_LENGTH} ký tự`),

  body('mau_xe')
    .optional()
    .isLength({ max: VALIDATION_RULES.MAU_XE.MAX_LENGTH })
    .withMessage(`Màu xe không được vượt quá ${VALIDATION_RULES.MAU_XE.MAX_LENGTH} ký tự`),

  body('nam_san_xuat')
    .optional()
    .isInt({ min: VALIDATION_RULES.NAM_SAN_XUAT.MIN, max: VALIDATION_RULES.NAM_SAN_XUAT.MAX })
    .withMessage(`Năm sản xuất phải từ ${VALIDATION_RULES.NAM_SAN_XUAT.MIN} đến ${VALIDATION_RULES.NAM_SAN_XUAT.MAX}`),

  body('dung_luong_pin_kwh')
    .optional()
    .isFloat({ min: VALIDATION_RULES.DUNG_LUONG_PIN.MIN, max: VALIDATION_RULES.DUNG_LUONG_PIN.MAX })
    .withMessage(`Dung lượng pin phải từ ${VALIDATION_RULES.DUNG_LUONG_PIN.MIN} đến ${VALIDATION_RULES.DUNG_LUONG_PIN.MAX} kWh`),

  body('cong_suat_sac_toi_da')
    .optional()
    .isFloat({ min: VALIDATION_RULES.CONG_SUAT_SAC.MIN, max: VALIDATION_RULES.CONG_SUAT_SAC.MAX })
    .withMessage(`Công suất sạc phải từ ${VALIDATION_RULES.CONG_SUAT_SAC.MIN} đến ${VALIDATION_RULES.CONG_SUAT_SAC.MAX} kW`),

  body('la_xe_chinh')
    .optional()
    .isBoolean()
    .withMessage('la_xe_chinh phải là boolean'),

  validate,
];

/**
 * Validate vehicle ID param
 */
export const validateVehicleId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID phương tiện không hợp lệ'),

  validate,
];

/**
 * Validate update SOC request
 */
export const validateUpdateSOC = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID phương tiện không hợp lệ'),

  body('soc')
    .notEmpty()
    .withMessage('SOC là bắt buộc')
    .isInt({ min: VALIDATION_RULES.SOC.MIN, max: VALIDATION_RULES.SOC.MAX })
    .withMessage(`SOC phải từ ${VALIDATION_RULES.SOC.MIN} đến ${VALIDATION_RULES.SOC.MAX}%`),

  validate,
];

