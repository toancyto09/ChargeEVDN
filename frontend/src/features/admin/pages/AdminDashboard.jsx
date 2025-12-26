import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Users, Building2, TrendingUp, LogOut, CheckCircle, 
  Clock, XCircle, MapPin, Star, Activity, ArrowRight, Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import PageLayout from '../../../components/layout/PageLayout';
import { authAPI, adminAPI } from '../../../services/api';

/**
 * AdminDashboard
 * Dashboard for system administrators with real data
 */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: { total: 0, byRole: {} },
    stations: { total: 0, byStatus: {} },
    businesses: 0,
    revenue: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.data.success) {
        const userData = response.data.data;
        
        // Verify admin role
        if (userData.vai_tro !== 'admin' && userData.role !== 'admin') {
          toast.error('Bạn không có quyền truy cập trang này');
          navigate('/login');
          return;
        }
        
        setUser(userData);

        // Load stats
        await loadStats();
      }
    } catch (error) {
      console.error('Error loading admin info:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get station stats
      const stationStatsRes = await adminAPI.getStationStats();
      const stationStats = stationStatsRes.data?.data || stationStatsRes.data || {};

      // TODO: Get user stats when API is ready
      // const userStatsRes = await adminAPI.getUserStats();
      
      setStats({
        users: {
          total: 0, // Will update when user API is ready
          byRole: { user: 0, owner: 0, admin: 0 }
        },
        stations: {
          total: stationStats.total_stations || 0,
          byStatus: stationStats.by_status || {}
        },
        businesses: 0, // Will update when business API is ready
        revenue: 0 // Will update when revenue API is ready
      });
    } catch (error) {
      console.error('Error loading stats:', error);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8" />
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              </div>
              <p className="text-red-100">
                Chào mừng, {user?.ho_ten || 'Administrator'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.users.total}</h3>
            <p className="text-sm text-gray-600">Người dùng</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
              <span>User: {stats.users.byRole.user || 0}</span>
              <span>•</span>
              <span>Owner: {stats.users.byRole.owner || 0}</span>
            </div>
          </div>

          {/* Total Businesses */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.businesses}</h3>
            <p className="text-sm text-gray-600">Doanh nghiệp</p>
          </div>

          {/* Pending Stations */}
          <div 
            onClick={() => navigate('/admin/stations')}
            className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                Cần xử lý
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stats.stations.byStatus.pending || 0}
            </h3>
            <p className="text-sm text-gray-600">Trạm chờ duyệt</p>
            <div className="mt-3 text-xs text-gray-500">
              Tổng: {stats.stations.total} trạm
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {Math.round(stats.revenue || 0).toLocaleString('vi-VN')} đ
            </h3>
            <p className="text-sm text-gray-600">Tổng doanh thu</p>
          </div>
        </div>

        {/* Station Status Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div 
            onClick={() => navigate('/admin/stations?status=approved')}
            className="bg-white rounded-xl shadow-md border border-gray-200 p-5 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Trạm đã duyệt</p>
                <h3 className="text-3xl font-bold text-green-600">
                  {stats.stations.byStatus.approved || 0}
                </h3>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <div 
            onClick={() => navigate('/admin/stations?status=pending')}
            className="bg-white rounded-xl shadow-md border border-gray-200 p-5 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Trạm chờ duyệt</p>
                <h3 className="text-3xl font-bold text-yellow-600">
                  {stats.stations.byStatus.pending || 0}
                </h3>
              </div>
              <Clock className="w-12 h-12 text-yellow-600" />
            </div>
          </div>

          <div 
            onClick={() => navigate('/admin/stations?status=rejected')}
            className="bg-white rounded-xl shadow-md border border-gray-200 p-5 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Trạm từ chối</p>
                <h3 className="text-3xl font-bold text-red-600">
                  {stats.stations.byStatus.rejected || 0}
                </h3>
              </div>
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Quản lý nhanh
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => navigate('/admin/stations')}
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 border-2 border-yellow-200 rounded-xl transition-all group"
            >
              <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-yellow-700 transition-colors">
                  Duyệt Trạm Sạc
                </h3>
                <p className="text-sm text-gray-600">
                  Phê duyệt trạm mới
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all" />
            </button>

            <button 
              onClick={() => navigate('/admin/users')}
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 rounded-xl transition-all group"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                  Quản lý Người dùng
                </h3>
                <p className="text-sm text-gray-600">
                  Xem & quản lý tài khoản
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </button>

            <button 
              onClick={() => toast.info('Chức năng đang phát triển')}
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-2 border-purple-200 rounded-xl transition-all group"
            >
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                  Báo cáo Hệ thống
                </h3>
                <p className="text-sm text-gray-600">
                  Thống kê & phân tích
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>

        {/* System Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* System Status */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-600" />
              Trạng thái hệ thống
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Backend API</span>
                </div>
                <span className="text-sm text-green-600 font-semibold">Hoạt động</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Database</span>
                </div>
                <span className="text-sm text-green-600 font-semibold">Hoạt động</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Payment Gateway</span>
                </div>
                <span className="text-sm text-green-600 font-semibold">Hoạt động</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-red-600" />
              Thông tin nhanh
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Tổng trạm sạc</span>
                <span className="text-lg font-bold text-gray-900">{stats.stations.total}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Tổng người dùng</span>
                <span className="text-lg font-bold text-gray-900">{stats.users.total}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Doanh nghiệp</span>
                <span className="text-lg font-bold text-gray-900">{stats.businesses}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </PageLayout>
  );
}
