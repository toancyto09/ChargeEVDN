/**
 * Profile Module Constants
 * Định nghĩa các hằng số cho quản lý hồ sơ cá nhân
 */

// Allowed fields for profile update
export const ALLOWED_UPDATE_FIELDS = [
  'ho_ten',
  'so_dien_thoai',
  'gioi_tinh',
  'ngay_sinh',
  'duong_dan_anh_dai_dien',
];

// Gender options
export const GENDER_OPTIONS = ['nam', 'nu', 'khac'];

// Validation rules
export const VALIDATION_RULES = {
  HO_TEN: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-ZÀ-ỹ\s]+$/,
  },
  SO_DIEN_THOAI: {
    PATTERN: /^[0-9]{10,11}$/,
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 50,
  },
};

// Error messages
export const ERROR_MESSAGES = {
  PROFILE_NOT_FOUND: 'Không tìm thấy thông tin người dùng',
  INVALID_HO_TEN: 'Họ tên không hợp lệ (2-100 ký tự, chỉ chữ cái)',
  INVALID_SO_DIEN_THOAI: 'Số điện thoại không hợp lệ (10-11 số)',
  INVALID_GIOI_TINH: 'Giới tính không hợp lệ (nam/nu/khac)',
  INVALID_NGAY_SINH: 'Ngày sinh không hợp lệ (phải >= 18 tuổi)',
  PHONE_ALREADY_EXISTS: 'Số điện thoại đã được sử dụng',
  CURRENT_PASSWORD_INCORRECT: 'Mật khẩu hiện tại không đúng',
  INVALID_PASSWORD: 'Mật khẩu phải có ít nhất 6 ký tự',
  PASSWORD_SAME_AS_OLD: 'Mật khẩu mới không được trùng với mật khẩu cũ',
  UPLOAD_FAILED: 'Upload ảnh đại diện thất bại',
  INVALID_FILE_TYPE: 'Chỉ chấp nhận file ảnh (jpg, jpeg, png, webp)',
  FILE_TOO_LARGE: 'Kích thước file không được vượt quá 5MB',
};

// Success messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Cập nhật thông tin thành công',
  PASSWORD_CHANGED: 'Đổi mật khẩu thành công',
  AVATAR_UPLOADED: 'Cập nhật ảnh đại diện thành công',
};

// File upload config
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  UPLOAD_DIR: 'uploads/avatars',
};

// Age restriction
export const MIN_AGE = 18;

