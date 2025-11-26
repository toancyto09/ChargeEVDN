import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../../services/api';
import { Logo } from '../../../components/common/Logo';
import { toast } from 'sonner';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [otpCode, setOtpCode] = useState(''); // For development only
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword({ email });

      if (response.data.success) {
        setSubmitted(true);
        toast.success('Mã OTP đã được gửi vào email!');

        // For development: store OTP and email
        if (response.data.otp) {
          setOtpCode(response.data.otp);
          // Store email in sessionStorage for next page
          sessionStorage.setItem('reset_email', email);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    // Navigate to reset password page
    navigate('/reset-password');
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 px-4">
        <div className="max-w-md w-full">
          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-green-200 p-6 sm:p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Kiểm tra email của bạn
            </h2>
            <p className="text-gray-600 mb-4">
              Chúng tôi đã gửi mã OTP (6 chữ số) tới email:
            </p>
            <p className="text-primary font-medium mb-6">{email}</p>
            <p className="text-sm text-gray-500 mb-6">
              Mã OTP sẽ hết hạn sau <strong>10 phút</strong>. Nếu không thấy
              email, hãy kiểm tra thư mục spam.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleContinue}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg btn-touch"
              >
                Nhập mã OTP
              </button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-gray-600 hover:text-primary font-medium"
              >
                <ArrowLeft size={16} />
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Logo size="xl" className="mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Quên mật khẩu?</h2>
          <p className="mt-2 text-sm text-gray-600">
            Nhập email đăng ký để nhận mã OTP đặt lại mật khẩu
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email đăng ký <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="user@example.com"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Mã OTP (6 chữ số) sẽ được gửi vào email này
            </p>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 shadow-md hover:shadow-lg btn-touch"
            >
              {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
            </button>

            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors btn-touch"
            >
              <ArrowLeft size={16} />
              Quay lại đăng nhập
            </Link>
          </div>
        </form>

        {/* Help text */}
        <div className="text-center text-xs text-gray-500">
          <p>
            Chưa có tài khoản?{' '}
            <Link
              to="/register"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
