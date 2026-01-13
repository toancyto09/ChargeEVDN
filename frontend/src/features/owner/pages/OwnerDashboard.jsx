import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, TrendingUp, Users, Zap, DollarSign, LogOut, Settings, ArrowRight, MapPin, CheckCircle, Clock, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import PageLayout from '../../../components/layout/PageLayout';
import { authAPI, ownerAPI } from '../../../services/api';

/**
 * OwnerDashboard
 * Dashboard for station owners (doanh nghiệp)
 */
export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stations, setStations] = useState([]);
  const [stats, setStats] = useState({
    totalStations: 0,
    totalBookings: 0,
    activeSessions: 0,
    monthlyRevenue: 0
  });

  useEffect(() => {
    loadOwnerInfo();
    loadStations();
  }, []);

  const loadOwnerInfo = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.data.success) {
        const userData = response.data.data;
        
        // Verify owner role
        if (userData.vai_tro !== 'owner') {
          navigate('/dashboard');
          return;
        }
        
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading owner info:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadStations = async () => {
    try {
      const [stationsRes, bookingStatsRes, sessionStatsRes] = await Promise.all([
        ownerAPI.getStations(),
        ownerAPI.getBookingStats({}), // All stations
        ownerAPI.getSessionStats({})  // All stations
      ]);
      
      // Handle different response structures
      const stationsData = Array.isArray(stationsRes.data) 
        ? stationsRes.data 
        : (stationsRes.data?.data || []);
      
      setStations(stationsData);
      
      // Get real stats from APIs
      const bookingStats = bookingStatsRes.data?.data || bookingStatsRes.data || {};
      const sessionStats = sessionStatsRes.data?.data || sessionStatsRes.data || {};
      
      setStats({
        totalStations: stationsData.length,
        totalBookings: bookingStats.total_bookings || 0,
        activeSessions: sessionStats.by_status?.dang_sac || 0,
        monthlyRevenue: sessionStats.total_revenue || 0
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set default empty stats on error
      setStats({
        totalStations: 0,
        totalBookings: 0,
        activeSessions: 0,
        monthlyRevenue: 0
      });
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
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Dashboard Doanh nghiệp</h1>
                <p className="text-blue-100 mt-1">
                  Chào mừng, {user?.ho_ten || 'Chủ trạm'}
                </p>
                <p className="text-blue-200 text-sm mt-1">{user?.email}</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/owner/company')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-lg transition-all border border-white/20 hover:border-white/40"
              >
                <Settings size={18} />
                <span className="hidden sm:inline">Cài đặt</span>
              </button>
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

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Stations */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalStations}</h3>
            <p className="text-sm text-gray-600">Trạm sạc</p>
          </div>

          {/* Total Bookings */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalBookings}</h3>
            <p className="text-sm text-gray-600">Lượt đặt chỗ</p>
          </div>

          {/* Active Sessions */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-sm text-yellow-600 font-medium">Live</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.activeSessions}</h3>
            <p className="text-sm text-gray-600">Đang sạc</p>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {Math.round(stats.monthlyRevenue || 0).toLocaleString('vi-VN')} đ
            </h3>
            <p className="text-sm text-gray-600">Doanh thu tháng</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Quản lý nhanh
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => navigate('/owner/stations')}
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200 rounded-xl transition-all group"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                  Quản lý trạm sạc
                </h3>
                <p className="text-sm text-gray-600">
                  Xem và chỉnh sửa trạm
                </p>
              </div>
            </button>

            <button 
              onClick={() => navigate('/owner/bookings')}
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-2 border-green-200 rounded-xl transition-all group"
            >
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                  Quản lý Đặt chỗ
                </h3>
                <p className="text-sm text-gray-600">
                  Xem lịch đặt chỗ
                </p>
              </div>
            </button>

            <button className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-2 border-purple-200 rounded-xl transition-all group">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                  Báo cáo
                </h3>
                <p className="text-sm text-gray-600">
                  Xem thống kê doanh thu
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Stations Table */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Danh sách trạm sạc của tôi
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Quản lý và theo dõi tất cả các trạm sạc
            </p>
          </div>

          {stations.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có trạm nào</h3>
              <p className="text-gray-600 mb-6">Thêm trạm sạc đầu tiên của bạn để bắt đầu</p>
              <button
                onClick={() => navigate('/owner/stations')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Thêm trạm sạc
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Trạm
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Cổng sạc
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Đánh giá
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stations.map((station) => (
                    <tr key={station.id_tram} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{station.ten_tram}</div>
                            <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              <span className="line-clamp-1">{station.dia_chi}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {Math.round(station.gia_kwh || 0).toLocaleString('vi-VN')} đ/kWh
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {station.trang_thai_duyet === 'approved' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Đã duyệt
                          </span>
                        ) : station.trang_thai_duyet === 'pending' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                            <Clock className="w-3 h-3" />
                            Chờ duyệt
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            <XCircle className="w-3 h-3" />
                            Bị từ chối
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-sm">
                          <div className="font-semibold text-gray-900">
                            {(Number(station.cong_trong) || 0) + (Number(station.cong_dang_dung) || 0)}/{station.tong_cong || 0}
                          </div>
                          <div className="text-xs text-gray-600">hoạt động</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-sm">
                          <div className="font-semibold text-gray-900">
                            ⭐ {Number(station.diem_trung_binh || 0).toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-600">
                            ({station.so_danh_gia || 0} đánh giá)
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/owner/stations/${station.id_tram}`)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Quản lý
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

