import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import pool from '../../config/db.js';
import { sendOTPEmail } from '../../utils/emailService.js';
/**
 * Generate 6-digit OTP
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Request password reset - Generate OTP and save to user record
 * @param {string} email - User's email
 * @returns {object} - Success message and OTP (for dev/testing)
 */
export const requestPasswordReset = async (email) => {
  // Find user by email
  const userResult = await pool.query(
    'SELECT id_nguoi_dung, ho_ten, email, trang_thai FROM nguoi_dung WHERE email = $1',
    [email]
  );

  // Security: Always return success even if email doesn't exist
  // This prevents email enumeration attacks
  if (userResult.rows.length === 0) {
    return {
      success: true,
      message: 'Nếu email tồn tại, bạn sẽ nhận được mã OTP qua email',
    };
  }

  const user = userResult.rows[0];

  // Check if account is locked
  if (user.trang_thai === 'khoa') {
    throw new Error('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên');
  }

  // Generate OTP
  const otp = generateOTP();
  const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  // Save OTP to user record
  await pool.query(
    'UPDATE nguoi_dung SET reset_otp = $1, reset_otp_expiry = $2 WHERE id_nguoi_dung = $3',
    [otp, expiryTime, user.id_nguoi_dung]
  );

  try {
    await sendOTPEmail(user.email, user.ho_ten, otp);
    console.log('✅ OTP email sent to:', user.email);
  } catch (emailError) {
    console.error('❌ Failed to send email:', emailError.message);
    // Continue even if email fails (vẫn lưu OTP vào DB)
  }

  return {
    success: true,
    message: 'Nếu email tồn tại, bạn sẽ nhận được mã OTP qua email',
    // REMOVE THIS IN PRODUCTION! Only for development/testing
    ...(process.env.NODE_ENV === 'development' && {
      otp,
      email: user.email,
    }),
  };
};

/**
 * Verify OTP code
 * @param {string} email - User's email
 * @param {string} otp - 6-digit OTP code
 * @returns {object} - User info if OTP is valid
 */
export const verifyOTP = async (email, otp) => {
  if (!email || !otp) {
    throw new Error('Vui lòng nhập đầy đủ thông tin');
  }

  // Find user
  const result = await pool.query(
    `SELECT id_nguoi_dung, ho_ten, email, trang_thai, reset_otp, reset_otp_expiry
     FROM nguoi_dung 
     WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error('Email không tồn tại');
  }

  const user = result.rows[0];

  // Check if OTP exists
  if (!user.reset_otp) {
    throw new Error('Chưa yêu cầu reset password. Vui lòng yêu cầu mã OTP mới');
  }

  // Check if OTP matches
  if (user.reset_otp !== otp) {
    throw new Error('Mã OTP không đúng');
  }

  // Check if OTP is expired
  if (new Date() > new Date(user.reset_otp_expiry)) {
    throw new Error('Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới');
  }

  // Check if account is locked
  if (user.trang_thai === 'khoa') {
    throw new Error('Tài khoản đã bị khóa');
  }

  return {
    id_nguoi_dung: user.id_nguoi_dung,
    email: user.email,
    ho_ten: user.ho_ten,
  };
};

/**
 * Reset password with OTP
 * @param {string} email - User's email
 * @param {string} otp - 6-digit OTP code
 * @param {string} newPassword - New password
 * @returns {object} - Success message
 */
export const resetPasswordWithOTP = async (email, otp, newPassword) => {
  // Validate password
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
  }

  // Verify OTP first
  const userData = await verifyOTP(email, otp);

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update password and clear OTP
  await pool.query(
    'UPDATE nguoi_dung SET mat_khau = $1, reset_otp = NULL, reset_otp_expiry = NULL WHERE id_nguoi_dung = $2',
    [hashedPassword, userData.id_nguoi_dung]
  );

  // Log activity
  await pool.query(
    `INSERT INTO nhat_ky_he_thong (id_nguoi_dung, hanh_dong, chi_tiet)
     VALUES ($1, $2, $3)`,
    [
      userData.id_nguoi_dung,
      'password_reset_otp',
      JSON.stringify({
        email: userData.email,
        timestamp: new Date().toISOString(),
      }),
    ]
  );

  console.log('✅ Password reset successful for:', userData.email);

  return {
    success: true,
    message: 'Đặt lại mật khẩu thành công',
  };
};

/**
 * Clean up expired OTPs (optional cron job)
 */
export const cleanupExpiredOTPs = async () => {
  const result = await pool.query(
    'UPDATE nguoi_dung SET reset_otp = NULL, reset_otp_expiry = NULL WHERE reset_otp_expiry < NOW()'
  );

  console.log(`🧹 Cleaned up ${result.rowCount} expired OTPs`);
  return result.rowCount;
};
