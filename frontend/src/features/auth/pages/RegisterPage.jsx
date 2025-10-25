'use client';

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../../services/api';
import { Logo } from '../../../components/common/Logo';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  Shield,
  Zap,
} from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    ho_ten: '',
    email: '',
    mat_khau: '',
    confirmPassword: '',
    so_dien_thoai: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.ho_ten.trim()) {
      newErrors.ho_ten = 'Vui lòng nhập họ và tên';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.mat_khau) {
      newErrors.mat_khau = 'Vui lòng nhập mật khẩu';
    } else if (formData.mat_khau.length < 6) {
      newErrors.mat_khau = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.mat_khau !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...dataToSend } = formData;
      const response = await authAPI.register(dataToSend);

      if (response.data.success) {
        toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Section - Benefits */}
        <div className="hidden lg:flex flex-col justify-center space-y-8">
          <div>
            <div className="mb-6">
              <Logo className="mx-auto" />
            </div>
            <p className="text-lg text-slate-600 text-center">
              Tham gia cộng đồng sạc xe điện xanh
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  Đăng ký miễn phí
                </h3>
                <p className="text-sm text-slate-600">
                  Tạo tài khoản và bắt đầu sử dụng ngay lập tức
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  Bảo mật tuyệt đối
                </h3>
                <p className="text-sm text-slate-600">
                  Thông tin của bạn được mã hóa và bảo vệ an toàn
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserPlus className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  Cộng đồng lớn mạnh
                </h3>
                <p className="text-sm text-slate-600">
                  Kết nối với hàng nghìn người dùng xe điện
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Register Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="bg-white rounded-2xl p-8 border border-green-200 shadow-lg">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="lg:hidden mb-6">
                <Logo className="mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Đăng ký
              </h2>
              <p className="text-slate-600 text-sm">
                Tạo tài khoản để bắt đầu sử dụng ChargeEVDN
              </p>
            </div>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Họ tên */}
              <div>
                <label
                  htmlFor="ho_ten"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="ho_ten"
                    name="ho_ten"
                    type="text"
                    required
                    value={formData.ho_ten}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      errors.ho_ten
                        ? 'border-red-300 bg-red-50'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                {errors.ho_ten && (
                  <div className="flex items-center gap-1 mt-1.5 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.ho_ten}
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      errors.email
                        ? 'border-red-300 bg-red-50'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                    placeholder="user@example.com"
                  />
                </div>
                {errors.email && (
                  <div className="flex items-center gap-1 mt-1.5 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Số điện thoại */}
              <div>
                <label
                  htmlFor="so_dien_thoai"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="so_dien_thoai"
                    name="so_dien_thoai"
                    type="tel"
                    value={formData.so_dien_thoai}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all hover:border-slate-300"
                    placeholder="0901234567"
                  />
                </div>
              </div>

              {/* Mật khẩu */}
              <div>
                <label
                  htmlFor="mat_khau"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="mat_khau"
                    name="mat_khau"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.mat_khau}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      errors.mat_khau
                        ? 'border-red-300 bg-red-50'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.mat_khau ? (
                  <div className="flex items-center gap-1 mt-1.5 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.mat_khau}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">
                    Tối thiểu 6 ký tự
                  </p>
                )}
              </div>

              {/* Xác nhận mật khẩu */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      errors.confirmPassword
                        ? 'border-red-300 bg-red-50'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="flex items-center gap-1 mt-1.5 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="w-5 h-5 mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="terms" className="text-xs text-slate-600">
                  Tôi đồng ý với{' '}
                  <a
                    href="#"
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Điều khoản sử dụng
                  </a>{' '}
                  và{' '}
                  <a
                    href="#"
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Chính sách bảo mật
                  </a>
                </label>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang đăng ký...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Đăng ký
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-4 flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-500">hoặc</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Google Sign Up Button */}
            <a
              href={`${import.meta.env.VITE_API_BASE || 'http://localhost:8080'}/api/auth/google`}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg font-medium text-slate-700 transition-all duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Đăng ký với Google</span>
            </a>

            {/* Divider */}
            <div className="my-4 flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Login link */}
            <div className="text-center text-xs">
              <span className="text-slate-600">Đã có tài khoản? </span>
              <Link
                to="/login"
                className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
              >
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
