/**
 * Auth Module Constants
 * Configuration values specific to authentication
 */

// ============================
// JWT CONFIGURATION
// ============================
export const JWT_CONFIG = {
  // Default expiry time (overridden by env)
  DEFAULT_EXPIRY: '7d',
  // Token type
  TOKEN_TYPE: 'Bearer',
};

// ============================
// PASSWORD REQUIREMENTS
// ============================
export const PASSWORD_CONFIG = {
  MIN_LENGTH: 6,
  MAX_LENGTH: 128,
  // Regex for strong password (optional)
  // STRONG_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

// ============================
// OTP CONFIGURATION
// ============================
export const OTP_CONFIG = {
  // OTP length (digits)
  LENGTH: 6,
  // OTP expiry time (seconds)
  EXPIRY_SECONDS: 600, // 10 minutes
  // Min/Max values for random generation
  MIN_VALUE: 100000,
  MAX_VALUE: 999999,
};

// ============================
// EMAIL VALIDATION
// ============================
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============================
// USER STATUS
// ============================
export const USER_STATUS = {
  ACTIVE: 'hoat_dong',
  LOCKED: 'khoa',
  INACTIVE: 'ngung_hoat_dong',
};

// ============================
// USER ROLES
// ============================
export const USER_ROLES = {
  USER: 'user',
  COMPANY: 'company',
  ADMIN: 'admin',
};

// ============================
// VALIDATION MESSAGES
// ============================
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELDS: 'Vui lòng điền đầy đủ thông tin',
  INVALID_EMAIL: 'Email không hợp lệ',
  INVALID_PASSWORD: 'Mật khẩu phải có ít nhất 6 ký tự',
  PASSWORD_MISMATCH: 'Mật khẩu xác nhận không khớp',
  INVALID_OTP: 'Mã OTP phải là 6 chữ số',
};

// ============================
// ERROR MESSAGES
// ============================
export const ERROR_MESSAGES = {
  EMAIL_EXISTS: 'Email đã tồn tại',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng',
  ACCOUNT_LOCKED: 'Tài khoản đã bị khóa',
  GOOGLE_ACCOUNT: 'Tài khoản này đăng ký bằng Google. Vui lòng đăng nhập bằng Google.',
  USER_NOT_FOUND: 'Người dùng không tồn tại',
  OTP_NOT_REQUESTED: 'Chưa yêu cầu reset password. Vui lòng yêu cầu mã OTP mới',
  OTP_INCORRECT: 'Mã OTP không đúng',
  OTP_EXPIRED: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới',
};

// ============================
// SUCCESS MESSAGES
// ============================
export const SUCCESS_MESSAGES = {
  REGISTER_SUCCESS: 'Đăng ký thành công',
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  LOGOUT_SUCCESS: 'Đăng xuất thành công',
  OTP_SENT: 'Nếu email tồn tại, bạn sẽ nhận được mã OTP qua email',
  OTP_VALID: 'Mã OTP hợp lệ',
  PASSWORD_RESET_SUCCESS: 'Đặt lại mật khẩu thành công',
};

// ============================
// SECURITY CONFIGURATION
// ============================
export const SECURITY_CONFIG = {
  // Bcrypt salt rounds
  SALT_ROUNDS: 10,
  // Max login attempts before lockout (optional)
  MAX_LOGIN_ATTEMPTS: 5,
  // Lockout duration (minutes)
  LOCKOUT_DURATION: 30,
};

