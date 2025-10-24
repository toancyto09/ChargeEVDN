import * as authService from './service.js';

// Register
export const register = async (req, res) => {
  try {
    const { ho_ten, email, mat_khau, so_dien_thoai } = req.body;

    // Validation
    if (!ho_ten || !email || !mat_khau) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin',
      });
    }

    const result = await authService.registerUser({
      ho_ten,
      email,
      mat_khau,
      so_dien_thoai,
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, mat_khau } = req.body;

    if (!email || !mat_khau) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và mật khẩu',
      });
    }

    const result = await authService.loginUser(email, mat_khau);

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Profile
export const getProfile = async (req, res) => {
  try {
    const user = await authService.getUserProfile(req.user.id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// Logout (client-side mostly)
export const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Đăng xuất thành công',
  });
};
