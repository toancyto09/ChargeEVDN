import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, TrendingUp, Users, Zap, DollarSign, LogOut, Settings } from 'lucide-react';
import { toast } from 'sonner';
import PageLayout from '../../../components/layout/PageLayout';
import { authAPI } from '../../../services/api';

/**
 * OwnerDashboard
 * Dashboard for station owners (doanh nghiệp)
 */
export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOwnerInfo();
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
                onClick={() => navigate('/profile')}
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
              <span className="text-sm text-green-600 font-medium">+0%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
            <p className="text-sm text-gray-600">Trạm sạc</p>
          </div>

          {/* Total Bookings */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+0%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
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
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
            <p className="text-sm text-gray-600">Đang sạc</p>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+0%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0 đ</h3>
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

            <button className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-2 border-green-200 rounded-xl transition-all group">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                  Đặt chỗ
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

        {/* Coming Soon Notice */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            🚧 Đang phát triển
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Dashboard doanh nghiệp đang được phát triển với đầy đủ tính năng quản lý trạm sạc, 
            theo dõi đặt chỗ, thống kê doanh thu và nhiều tính năng khác.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Authentication</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-gray-600">Đang phát triển</span>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

