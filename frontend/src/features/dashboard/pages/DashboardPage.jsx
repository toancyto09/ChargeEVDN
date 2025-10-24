import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../../services/api';
import { Logo } from '../../../components/common/Logo';
import { toast } from 'sonner';
import { User, LogOut, Car, MapPin, Calendar, Star } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await authAPI.getProfile();
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Không thể tải thông tin người dùng');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      toast.success('Đăng xuất thành công');
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Logo size="lg" className="mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Mobile-First Dashboard Container */}
      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8 max-w-6xl">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {user?.ho_ten || 'Người dùng'}
                </h1>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                    {user?.vai_tro === 'user' && '👤 Người dùng'}
                    {user?.vai_tro === 'owner' && '🏢 Chủ trạm'}
                    {user?.vai_tro === 'admin' && '⚙️ Quản trị viên'}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      user?.trang_thai === 'hoat_dong'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {user?.trang_thai === 'hoat_dong'
                      ? '✓ Hoạt động'
                      : '✗ Khóa'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium w-full sm:w-auto btn-touch"
            >
              <LogOut size={16} />
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Quick Stats - Mobile Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <StatCard
            icon={<Car className="w-5 h-5 sm:w-6 sm:h-6" />}
            title="Phương tiện"
            value="0"
            bgColor="bg-blue-50"
            textColor="text-blue-600"
          />
          <StatCard
            icon={<Calendar className="w-5 h-5 sm:w-6 sm:h-6" />}
            title="Đặt chỗ"
            value="0"
            bgColor="bg-green-50"
            textColor="text-green-600"
          />
          <StatCard
            icon={<MapPin className="w-5 h-5 sm:w-6 sm:h-6" />}
            title="Trạm gần"
            value="0"
            bgColor="bg-purple-50"
            textColor="text-purple-600"
          />
          <StatCard
            icon={<Star className="w-5 h-5 sm:w-6 sm:h-6" />}
            title="Đánh giá"
            value="0"
            bgColor="bg-yellow-50"
            textColor="text-yellow-600"
          />
        </div>

        {/* Action Cards - Mobile-First */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ActionCard
            icon="🗺️"
            title="Tìm trạm sạc"
            description="Tìm trạm sạc gần nhất dựa trên vị trí của bạn"
            onClick={() => toast.info('Chức năng đang phát triển')}
          />
          <ActionCard
            icon="📅"
            title="Đặt chỗ mới"
            description="Đặt chỗ trước để không phải chờ đợi"
            onClick={() => toast.info('Chức năng đang phát triển')}
          />
          <ActionCard
            icon="🚗"
            title="Quản lý xe"
            description="Thêm và quản lý phương tiện của bạn"
            onClick={() => toast.info('Chức năng đang phát triển')}
          />
          <ActionCard
            icon="📊"
            title="Lịch sử sạc"
            description="Xem lịch sử các phiên sạc đã hoàn thành"
            onClick={() => toast.info('Chức năng đang phát triển')}
          />
          <ActionCard
            icon="💳"
            title="Thanh toán"
            description="Quản lý thanh toán và hóa đơn"
            onClick={() => toast.info('Chức năng đang phát triển')}
          />
          <ActionCard
            icon="⭐"
            title="Đánh giá"
            description="Xem và viết đánh giá về các trạm"
            onClick={() => toast.info('Chức năng đang phát triển')}
          />
        </div>

        {/* Info Section */}
        <div className="mt-6 sm:mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 text-center">
            ℹ️ Dashboard đang trong quá trình phát triển. Các chức năng sẽ được
            bổ sung dần.
          </p>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, title, value, bgColor, textColor }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 hover:shadow-lg transition-shadow">
      <div
        className={`${bgColor} ${textColor} w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-2`}
      >
        {icon}
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground mb-1">{title}</p>
      <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

// Action Card Component
function ActionCard({ icon, title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg hover:border-primary/20 border border-transparent transition-all text-left w-full touch-manipulation group"
    >
      <div className="text-3xl sm:text-4xl mb-3 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </button>
  );
}
