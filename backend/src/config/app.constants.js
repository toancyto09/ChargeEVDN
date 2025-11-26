/**
 * Application-wide Constants
 * Centralized configuration values and magic numbers
 */

// ============================
// HTTP STATUS CODES
// ============================
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// ============================
// ERROR MESSAGES
// ============================
export const ERROR_MESSAGES = {
  // Auth
  UNAUTHORIZED: 'Bạn cần đăng nhập để thực hiện hành động này',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không chính xác',
  EMAIL_ALREADY_EXISTS: 'Email đã được sử dụng',
  USER_NOT_FOUND: 'Không tìm thấy người dùng',
  INVALID_TOKEN: 'Token không hợp lệ hoặc đã hết hạn',
  
  // Validation
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ',
  MISSING_REQUIRED_FIELDS: 'Thiếu các trường bắt buộc',
  
  // Database
  DATABASE_ERROR: 'Lỗi cơ sở dữ liệu',
  QUERY_FAILED: 'Truy vấn thất bại',
  
  // Server
  INTERNAL_ERROR: 'Lỗi máy chủ nội bộ',
  SERVICE_UNAVAILABLE: 'Dịch vụ tạm thời không khả dụng',
  
  // Resources
  STATION_NOT_FOUND: 'Không tìm thấy trạm sạc',
  BOOKING_NOT_FOUND: 'Không tìm thấy đặt chỗ',
  VEHICLE_NOT_FOUND: 'Không tìm thấy phương tiện',
};

// ============================
// SUCCESS MESSAGES
// ============================
export const SUCCESS_MESSAGES = {
  // Auth
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  LOGOUT_SUCCESS: 'Đăng xuất thành công',
  REGISTER_SUCCESS: 'Đăng ký thành công',
  PASSWORD_RESET_EMAIL_SENT: 'Email đặt lại mật khẩu đã được gửi',
  PASSWORD_RESET_SUCCESS: 'Đặt lại mật khẩu thành công',
  
  // CRUD
  CREATED_SUCCESS: 'Tạo thành công',
  UPDATED_SUCCESS: 'Cập nhật thành công',
  DELETED_SUCCESS: 'Xóa thành công',
  
  // Resources
  BOOKING_CREATED: 'Đặt chỗ thành công',
  BOOKING_CANCELLED: 'Hủy đặt chỗ thành công',
};

// ============================
// VALIDATION RULES
// ============================
export const VALIDATION_RULES = {
  // User
  EMAIL_MIN_LENGTH: 5,
  EMAIL_MAX_LENGTH: 255,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  PHONE_LENGTH: 10,
  
  // Geolocation
  LAT_MIN: -90,
  LAT_MAX: 90,
  LNG_MIN: -180,
  LNG_MAX: 180,
  
  // Station
  PRICE_MIN: 0,
  PRICE_MAX: 100000,
  RATING_MIN: 0,
  RATING_MAX: 5,
  RADIUS_MIN: 1,
  RADIUS_MAX: 100,
  
  // AI
  SOC_MIN: 0,
  SOC_MAX: 100,
  LIMIT_MIN: 1,
  LIMIT_MAX: 100,
  LIMIT_DEFAULT: 10,
};

// ============================
// PAGINATION
// ============================
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// ============================
// JWT
// ============================
export const JWT = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  RESET_TOKEN_EXPIRY: '1h',
};

// ============================
// USER ROLES
// ============================
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  COMPANY: 'company',
};

// ============================
// STATION STATUS
// ============================
export const STATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// ============================
// VEHICLE STATUS
// ============================
export const VEHICLE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DELETED: 'deleted',
};

// ============================
// BOOKING STATUS
// ============================
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

// ============================
// CONNECTOR TYPES (Examples)
// ============================
export const CONNECTOR_TYPES = {
  TYPE2: 'Type2',
  CCS2: 'CCS2',
  CHADEMO: 'CHAdeMO',
  TYPE1: 'Type1',
  CCS1: 'CCS1',
};

// ============================
// DEFAULT VALUES
// ============================
export const DEFAULTS = {
  VEHICLE_BATTERY_KWH: 60,
  VEHICLE_MAX_POWER: 50,
  VEHICLE_CONNECTOR: CONNECTOR_TYPES.TYPE2,
  AI_SOC: 50,
  AI_RADIUS: 20,
  AI_MAX_PRICE: 10000,
};
