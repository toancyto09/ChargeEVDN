import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../../services/api';
import { toast } from 'sonner';
import { User, LogOut, Car, MapPin, Calendar, Star, Settings } from 'lucide-react';
import { isTokenExpired } from '../../../utils/tokenHelper';
import SOCIndicator from '../components/SOCIndicator';
import PageLayout from '../../../components/layout/PageLayout';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    vehicles: 0,
    bookings: 0,
    nearbyStations: 0,
    reviews: 0,
  });
  const [mainVehicle, setMainVehicle] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserProfile();
    loadStats();
  }, []);

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Check token exists
      if (!token) {
        navigate('/login');
        return;
      }

      // Check token expiry before making API call
      if (isTokenExpired(token)) {
        localStorage.removeItem('token');
        toast.warning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login');
        return;
      }

      const response = await authAPI.getProfile();
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      
      // Nếu là lỗi 401/403, interceptor đã xử lý (xóa token + redirect)
      // Không cần hiển thị toast error nữa
      const status = error.response?.status;
      if (status !== 401 && status !== 403) {
        toast.error('Không thể tải thông tin người dùng');
      }
      
      // Interceptor sẽ tự redirect, không cần navigate ở đây
      // navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Load vehicles count
      const vehiclesResponse = await fetch('http://localhost:8080/api/vehicles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const vehiclesData = await vehiclesResponse.json();
      
      if (vehiclesData.success) {
        setStats(prev => ({
          ...prev,
          vehicles: vehiclesData.data.length,
        }));
        
        // Get main vehicle for SOC indicator
        const main = vehiclesData.data.find(v => v.la_xe_chinh) || vehiclesData.data[0];
        setMainVehicle(main);
      }

      // TODO: Load other stats when APIs are ready
      // - Bookings count
      // - Nearby stations count
      // - Reviews count
    } catch (error) {
      console.error('Failed to load stats:', error);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <PageLayout className="bg-gray-50">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="py-6 md:py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* User Info */}
              <Link 
                to="/profile"
                className="flex items-center gap-4 group"
              >
                <div className="relative">
                  {user?.duong_dan_anh_dai_dien && user.duong_dan_anh_dai_dien !== 'null' ? (
                    <img
                      src={`http://localhost:8080${user.duong_dan_anh_dai_dien}`}
                      alt={user.ho_ten}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-white/30 group-hover:border-white/60 transition-all shadow-lg"
                      onError={(e) => {
                        // Nếu ảnh load lỗi, ẩn img và hiện fallback
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : null}
                  {(!user?.duong_dan_anh_dai_dien || user?.duong_dan_anh_dai_dien === 'null') && (
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30 group-hover:border-white/60 transition-all shadow-lg">
                      <span className="text-2xl md:text-3xl font-bold text-white">
                        {user?.ho_ten?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold group-hover:text-blue-100 transition-colors">
                    Xin chào, {user?.ho_ten || 'Người dùng'}!
                  </h1>
                  <p className="text-blue-100 text-sm mt-1">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full font-medium">
                      {user?.vai_tro === 'user' && '👤 Người dùng'}
                      {user?.vai_tro === 'owner' && '🏢 Chủ trạm'}
                      {user?.vai_tro === 'admin' && '⚙️ Quản trị viên'}
                    </span>
                  </div>
                </div>
              </Link>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-lg transition-all border border-white/20 hover:border-white/40"
                >
                  <Settings size={18} />
                  <span className="hidden sm:inline">Cài đặt</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-6 md:py-8">
        {/* Welcome Message */}
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Dashboard
          </h2>
          <p className="text-gray-600">
            Quản lý hoạt động sạc xe điện của bạn
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatCard
            icon={<Car className="w-6 h-6" />}
            title="Phương tiện"
            value={stats.vehicles}
            gradient="from-blue-500 to-blue-600"
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            title="Đặt chỗ"
            value={stats.bookings}
            gradient="from-green-500 to-green-600"
            iconBg="bg-green-100"
            iconColor="text-green-600"
          />
          <StatCard
            icon={<MapPin className="w-6 h-6" />}
            title="Trạm gần"
            value={stats.nearbyStations}
            gradient="from-purple-500 to-purple-600"
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
          />
          <StatCard
            icon={<Star className="w-6 h-6" />}
            title="Đánh giá"
            value={stats.reviews}
            gradient="from-yellow-500 to-yellow-600"
            iconBg="bg-yellow-100"
            iconColor="text-yellow-600"
          />
        </div>

        {/* SOC Indicator - Show if user has vehicles */}
        {mainVehicle && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Xe của bạn
            </h3>
            <SOCIndicator vehicle={mainVehicle} />
          </div>
        )}

        {/* Action Cards */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Chức năng chính
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <ActionCard
              icon="🗺️"
              title="Tìm trạm sạc"
              description="Tìm trạm sạc gần nhất dựa trên vị trí của bạn"
              gradient="from-blue-500 to-blue-600"
              onClick={() => toast.info('Chức năng đang phát triển')}
            />
            <ActionCard
              icon="📅"
              title="Đặt chỗ mới"
              description="Đặt chỗ trước để không phải chờ đợi"
              gradient="from-green-500 to-green-600"
              onClick={() => toast.info('Chức năng đang phát triển')}
            />
            <ActionCard
              icon="🚗"
              title="Quản lý xe"
              description="Thêm và quản lý phương tiện của bạn"
              gradient="from-red-500 to-red-600"
              onClick={() => navigate('/vehicles')}
            />
            <ActionCard
              icon="📊"
              title="Lịch sử sạc"
              description="Xem lịch sử các phiên sạc đã hoàn thành"
              gradient="from-purple-500 to-purple-600"
              onClick={() => toast.info('Chức năng đang phát triển')}
            />
            <ActionCard
              icon="💳"
              title="Thanh toán"
              description="Quản lý thanh toán và hóa đơn"
              gradient="from-indigo-500 to-indigo-600"
              onClick={() => navigate('/payment/history')}
            />
            <ActionCard
              icon="⭐"
              title="Đánh giá"
              description="Xem và viết đánh giá về các trạm"
              gradient="from-yellow-500 to-yellow-600"
              onClick={() => toast.info('Chức năng đang phát triển')}
            />
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">ℹ️</span>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Dashboard đang phát triển
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Các chức năng sẽ được bổ sung dần. Cảm ơn bạn đã kiên nhẫn!
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

// Stat Card Component
function StatCard({ icon, title, value, gradient, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100">
      <div className={`bg-gradient-to-r ${gradient} p-4 md:p-5`}>
        <div className={`${iconBg} ${iconColor} w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <p className="text-white/90 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl md:text-4xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

// Action Card Component
function ActionCard({ icon, title, description, gradient, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 text-left w-full group overflow-hidden"
    >
      <div className={`bg-gradient-to-r ${gradient} p-4 md:p-5`}>
        <div className="text-4xl md:text-5xl mb-3 group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <div className="p-4 md:p-5">
        <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>
    </button>
  );
}
