import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../../services/api';
import { Logo } from '../../../components/common/Logo';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, CheckCircle, Hash } from 'lucide-react';

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Verify OTP, 2: Enter new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({
    mat_khau: '',
    confirm_mat_khau: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    // Get email from sessionStorage if available
    const savedEmail = sessionStorage.getItem('reset_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Step 1: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!email || !otp) {
      toast.error('Vui lòng nhập email và mã OTP');
      return;
    }

    if (otp.length !== 6) {
      toast.error('Mã OTP phải có 6 chữ số');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.verifyOTP({ email, otp });

      if (response.data.success) {
        setStep(2);
        toast.success('Mã OTP hợp lệ! Vui lòng nhập mật khẩu mới');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Mã OTP không đúng');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.mat_khau !== formData.confirm_mat_khau) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.mat_khau.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.resetPassword({
        email,
        otp,
        mat_khau: formData.mat_khau,
        confirm_mat_khau: formData.confirm_mat_khau,
      });

      if (response.data.success) {
        setResetSuccess(true);
        // Clear sessionStorage
        sessionStorage.removeItem('reset_email');
        toast.success('Đặt lại mật khẩu thành công!');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg border border-green-200 p-6 sm:p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Đặt lại mật khẩu thành công!
            </h2>
            <p className="text-gray-600 mb-6">
              Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.
            </p>

            <Link
              to="/login"
              className="block w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg btn-touch"
            >
              Đăng nhập ngay
            </Link>

            <p className="mt-4 text-sm text-gray-500">
              Tự động chuyển sau 3 giây...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Verify OTP form
  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 px-4">
        <div className="max-w-md w-full space-y-8">
          {/* Logo */}
          <div className="text-center">
            <Logo size="xl" className="mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900">
              Xác thực mã OTP
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Nhập mã đã được gửi đến
            </p>
            <p className="mt-1 text-base font-semibold text-primary break-all px-4">
              {email || 'email của bạn'}
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOTP}>
            <div className="space-y-4">
              {/* OTP Code */}
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Mã OTP (6 chữ số) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    maxLength="6"
                    pattern="\d{6}"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="block w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-center text-2xl tracking-widest font-mono transition-all"
                    placeholder="000000"
                    autoFocus
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Mã OTP có hiệu lực trong 10 phút
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full flex justify-center py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 shadow-md hover:shadow-lg btn-touch"
            >
              {loading ? 'Đang xác thực...' : 'Xác thực mã OTP'}
            </button>

            <div className="text-center text-sm">
              <Link
                to="/login"
                className="text-gray-600 hover:text-primary font-medium"
              >
                Quay lại đăng nhập
              </Link>
              <p className="mt-2 text-xs text-gray-500">
                Chưa nhận được mã?{' '}
                <Link
                  to="/forgot-password"
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Yêu cầu mã mới
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Step 2: New password form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Logo size="xl" className="mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Đặt mật khẩu mới</h2>
          <p className="mt-2 text-sm text-gray-600">
            Nhập mật khẩu mới cho tài khoản: <br />
            <span className="font-medium text-primary">{email}</span>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
          <div className="space-y-4">
            {/* New Password */}
            <div>
              <label
                htmlFor="mat_khau"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  id="mat_khau"
                  name="mat_khau"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.mat_khau}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Tối thiểu 6 ký tự</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirm_mat_khau"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  id="confirm_mat_khau"
                  name="confirm_mat_khau"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirm_mat_khau}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 shadow-md hover:shadow-lg btn-touch"
          >
            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>

          <div className="text-center text-sm">
            <Link
              to="/login"
              className="text-gray-600 hover:text-primary font-medium"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
