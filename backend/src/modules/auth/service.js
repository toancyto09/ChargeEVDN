import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../../config/db.js';

// Register User
export const registerUser = async (userData) => {
  const { ho_ten, email, mat_khau, so_dien_thoai } = userData;

  // Check if email exists
  const userExists = await pool.query(
    'SELECT * FROM nguoi_dung WHERE email = $1',
    [email]
  );

  if (userExists.rows.length > 0) {
    throw new Error('Email đã tồn tại');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(mat_khau, salt);

  // Insert user
  const result = await pool.query(
    `INSERT INTO nguoi_dung (ho_ten, email, mat_khau, so_dien_thoai, vai_tro, trang_thai)
     VALUES ($1, $2, $3, $4, 'user', 'hoat_dong')
     RETURNING id_nguoi_dung, ho_ten, email, vai_tro, ngay_tao`,
    [ho_ten, email, hashedPassword, so_dien_thoai]
  );

  const user = result.rows[0];

  // Generate JWT token
  const token = generateToken(user.id_nguoi_dung, user.email, user.vai_tro);

  // Only return essential user fields (security best practice)
  const userResponse = {
    id_nguoi_dung: user.id_nguoi_dung,
    ho_ten: user.ho_ten,
    email: user.email,
    vai_tro: user.vai_tro,
    trang_thai: user.trang_thai,
  };

  return { user: userResponse, token };
};

// Login User
export const loginUser = async (email, mat_khau) => {
  // Find user
  const result = await pool.query('SELECT * FROM nguoi_dung WHERE email = $1', [
    email,
  ]);

  if (result.rows.length === 0) {
    throw new Error('Email hoặc mật khẩu không đúng');
  }

  const user = result.rows[0];

  // Check account status
  if (user.trang_thai === 'khoa') {
    throw new Error('Tài khoản đã bị khóa');
  }

  // Check if user has password (not Google OAuth user)
  if (!user.mat_khau) {
    throw new Error(
      'Tài khoản này đăng ký bằng Google. Vui lòng đăng nhập bằng Google.'
    );
  }

  // Verify password
  const isMatch = await bcrypt.compare(mat_khau, user.mat_khau);

  if (!isMatch) {
    throw new Error('Email hoặc mật khẩu không đúng');
  }

  // Generate token
  const token = generateToken(user.id_nguoi_dung, user.email, user.vai_tro);

  // Only return essential user fields (security best practice)
  const userResponse = {
    id_nguoi_dung: user.id_nguoi_dung,
    ho_ten: user.ho_ten,
    email: user.email,
    vai_tro: user.vai_tro,
    trang_thai: user.trang_thai,
  };

  return { user: userResponse, token };
};

// Get User Profile
export const getUserProfile = async (userId) => {
  const result = await pool.query(
    `SELECT id_nguoi_dung, ho_ten, email, so_dien_thoai, gioi_tinh, 
            ngay_sinh, vai_tro, trang_thai, ngay_tao
     FROM nguoi_dung WHERE id_nguoi_dung = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Người dùng không tồn tại');
  }

  return result.rows[0];
};

// Generate JWT Token
export const generateToken = (id, email, role) => {
  return jwt.sign({ id, email, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};
