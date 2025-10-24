import * as passwordResetService from './passwordResetService.js';

/**
 * Request OTP for password reset
 * POST /api/auth/forgot-password
 */
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email không hợp lệ',
      });
    }

    const result = await passwordResetService.requestPasswordReset(email);

    res.json(result);
  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Có lỗi xảy ra',
    });
  }
};

/**
 * Verify OTP code
 * POST /api/auth/verify-otp
 */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và mã OTP',
      });
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Mã OTP phải là 6 chữ số',
      });
    }

    const result = await passwordResetService.verifyOTP(email, otp);

    res.json({
      success: true,
      message: 'Mã OTP hợp lệ',
      data: {
        email: result.email,
        ho_ten: result.ho_ten,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Reset password with OTP
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, mat_khau, confirm_mat_khau } = req.body;

    if (!email || !otp || !mat_khau || !confirm_mat_khau) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin',
      });
    }

    if (mat_khau !== confirm_mat_khau) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu xác nhận không khớp',
      });
    }

    if (mat_khau.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự',
      });
    }

    const result = await passwordResetService.resetPasswordWithOTP(
      email,
      otp,
      mat_khau
    );

    res.json(result);
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
