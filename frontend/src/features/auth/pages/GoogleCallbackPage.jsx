import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

/**
 * Google OAuth Callback Handler Page
 * This page receives the token from backend after Google authentication
 */
export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = () => {
      // Get token and user data from URL params
      const token = searchParams.get('token');
      const userDataStr = searchParams.get('user');
      const error = searchParams.get('error');

      // Handle error
      if (error) {
        let errorMessage = 'Đăng nhập Google thất bại';

        if (error === 'authentication_failed') {
          errorMessage = 'Xác thực Google thất bại';
        } else if (error === 'google_auth_failed') {
          errorMessage = 'Không thể đăng nhập bằng Google';
        } else if (error === 'server_error') {
          errorMessage = 'Lỗi server. Vui lòng thử lại';
        }

        toast.error(errorMessage);
        navigate('/login');
        return;
      }

      // Handle success
      if (token) {
        try {
          // Save token to localStorage
          localStorage.setItem('token', token);

          // Parse user data if available (for display purposes only)
          if (userDataStr) {
            const userData = JSON.parse(decodeURIComponent(userDataStr));
            console.log('✅ Google login successful:', userData);
          }

          toast.success('Đăng nhập Google thành công!');

          // Redirect to dashboard
          navigate('/dashboard');
        } catch (error) {
          console.error('Error parsing user data:', error);
          toast.error('Có lỗi xảy ra. Vui lòng thử lại');
          navigate('/login');
        }
      } else {
        toast.error('Không nhận được token. Vui lòng thử lại');
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-green-200 p-8 max-w-md w-full text-center">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          Đang xử lý đăng nhập...
        </h2>
        <p className="text-slate-600 text-sm">Vui lòng chờ trong giây lát</p>
      </div>
    </div>
  );
}
