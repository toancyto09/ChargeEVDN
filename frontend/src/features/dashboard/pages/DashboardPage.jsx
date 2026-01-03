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
      {/* Header - Theme emerald đậm */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* User Info */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  {user?.duong_dan_anh_dai_dien && user.duong_dan_anh_dai_dien !== 'null' ? (
                    <img
                      src={`http://localhost:8080${user.duong_dan_anh_dai_dien}`}
                      alt={user.ho_ten}
                      className="w-16 h-16 rounded-full object-cover border-3 border-white/40 shadow-lg"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : null}
                  {(!user?.duong_dan_anh_dai_dien || user?.duong_dan_anh_dai_dien === 'null') && (
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-3 border-white/40 shadow-lg">
                      <span className="text-2xl font-bold text-white">
                        {user?.ho_ten?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold">
                    Xin chào, {user?.ho_ten || 'Người dùng'}!
                  </h1>
                  <p className="text-white/90 text-sm mt-0.5">{user?.email}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/30"
                >
                  <Settings size={18} />
                  <span className="hidden sm:inline">Hồ sơ</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/30"
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={<Car className="w-6 h-6" />}
            title="Phương tiện"
            value={stats.vehicles}
            color="green"
          />
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            title="Đặt chỗ"
            value={stats.bookings}
            color="green"
          />
          {/* <StatCard
            icon={<MapPin className="w-6 h-6" />}
            title="Trạm gần"
            value={stats.nearbyStations}
            color="green"
          /> */}
        </div>

        {/* SOC Indicator */}
        {mainVehicle && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Xe chính
            </h3>
            <SOCIndicator vehicle={mainVehicle} />
          </div>
        )}

        {/* Action Cards - CHỈ CHỨC NĂNG HOẠT ĐỘNG */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Chức năng
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionCard
              icon={<Car className="w-7 h-7" />}
              title="Quản lý xe"
              description="Thêm, sửa, xóa phương tiện"
              onClick={() => navigate('/vehicles')}
            />
            <ActionCard
              icon={<Calendar className="w-7 h-7" />}
              title="Đặt chỗ của tôi"
              description="Xem và quản lý đặt chỗ"
              onClick={() => navigate('/bookings')}
            />
            <ActionCard
              icon={<User className="w-7 h-7" />}
              title="Lịch sử thanh toán"
              description="Xem lịch sử giao dịch"
              onClick={() => navigate('/payment/history')}
            />
            <ActionCard
              icon={<Settings className="w-7 h-7" />}
              title="Hồ sơ cá nhân"
              description="Cập nhật thông tin"
              onClick={() => navigate('/profile')}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

// Stat Card Component - Emerald đậm, text dễ đọc
function StatCard({ icon, title, value, color }) {
  const colorClasses = {
    green: {
      bg: 'bg-emerald-600', // Đậm hơn cho contrast tốt
      iconBg: 'bg-white/20',
      iconColor: 'text-white',
    },
  };

  const classes = colorClasses[color] || colorClasses.green;

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden">
      <div className={`${classes.bg} p-4`}>
        <div className={`${classes.iconBg} ${classes.iconColor} w-10 h-10 rounded-lg flex items-center justify-center mb-2 shadow-sm`}>
          {icon}
        </div>
        <p className="text-white font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

// Action Card Component - Clean, chỉ icon Lucide
function ActionCard({ icon, title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-200 hover:border-emerald-500 transition-all text-left w-full group p-5"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}
