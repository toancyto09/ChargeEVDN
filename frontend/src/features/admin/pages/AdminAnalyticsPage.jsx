import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Users, Zap, DollarSign, ArrowLeft, RefreshCw,
  Calendar, Download, BarChart3, MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import PageLayout from '../../../components/layout/PageLayout';
import { adminAPI } from '../../../services/api';

export default function AdminAnalyticsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState(30); // days
  
  // Data states
  const [overview, setOverview] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [sessionsData, setSessionsData] = useState([]);
  const [topStations, setTopStations] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [businessRevenue, setBusinessRevenue] = useState([]);

  useEffect(() => {
    loadAllData();
    
    // Auto refresh every 60 seconds
    const interval = setInterval(() => {
      loadAllData();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [dateRange]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      const [overviewRes, revenueRes, usersRes, sessionsRes, stationsRes, transactionsRes, businessRes] = await Promise.all([
        adminAPI.getAnalyticsOverview(),
        adminAPI.getRevenueChart({ 
          startDate: startDate.toISOString(), 
          endDate: endDate.toISOString() 
        }),
        adminAPI.getUserGrowthChart({ 
          startDate: startDate.toISOString(), 
          endDate: endDate.toISOString() 
        }),
        adminAPI.getSessionsChart({ 
          startDate: startDate.toISOString(), 
          endDate: endDate.toISOString() 
        }),
        adminAPI.getTopStations({ limit: 5 }),
        adminAPI.getRecentTransactions({ limit: 5 }),
        adminAPI.getRevenueByBusiness({ limit: 10 }),
      ]);

      setOverview(overviewRes.data?.data || {});
      setRevenueData(revenueRes.data?.data || []);
      setUserGrowthData(usersRes.data?.data || []);
      setSessionsData(sessionsRes.data?.data || []);
      setTopStations(stationsRes.data?.data || []);
      setRecentTransactions(transactionsRes.data?.data || []);
      setBusinessRevenue(businessRes.data?.data || []);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Không thể tải dữ liệu analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
    toast.success('Đã làm mới dữ liệu');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
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
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-8 h-8" />
                  <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                </div>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>
          </div>
          <p className="text-blue-100 ml-14">Thống kê và phân tích dữ liệu hệ thống</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Date Range Filter */}
        <div className="mb-6 flex items-center gap-4">
          <Calendar className="w-5 h-5 text-gray-600" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={7}>7 ngày qua</option>
            <option value={30}>30 ngày qua</option>
            <option value={90}>90 ngày qua</option>
            <option value={365}>1 năm qua</option>
          </select>
          <button
            onClick={() => toast.info('Tính năng export đang phát triển')}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <span className={`text-sm font-medium ${overview?.revenue_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {overview?.revenue_growth >= 0 ? '↑' : '↓'} {Math.abs(overview?.revenue_growth || 0)}%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(overview?.total_revenue || 0)}
            </h3>
            <p className="text-sm text-gray-600">Tổng doanh thu</p>
          </div>

          {/* Total Sessions */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <span className={`text-sm font-medium ${overview?.sessions_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {overview?.sessions_growth >= 0 ? '↑' : '↓'} {Math.abs(overview?.sessions_growth || 0)}%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{overview?.total_sessions || 0}</h3>
            <p className="text-sm text-gray-600">Tổng phiên sạc</p>
          </div>

          {/* Active Users */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{overview?.active_users || 0}</h3>
            <p className="text-sm text-gray-600">Người dùng hoạt động</p>
          </div>

          {/* Total Stations */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{overview?.total_stations || 0}</h3>
            <p className="text-sm text-gray-600">Trạm sạc hoạt động</p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Doanh thu theo ngày</h2>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)} 
                  labelFormatter={formatDate}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  name="Doanh thu"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Không có dữ liệu doanh thu trong khoảng thời gian này
            </div>
          )}
        </div>

        {/* User Growth & Sessions Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* User Growth */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Người dùng mới</h2>
            {userGrowthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis />
                  <Tooltip labelFormatter={formatDate} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.6} 
                    name="Tổng"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Không có dữ liệu người dùng mới
              </div>
            )}
          </div>

          {/* Sessions Chart */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Phiên sạc</h2>
            {sessionsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={sessionsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis />
                  <Tooltip labelFormatter={formatDate} />
                  <Legend />
                  <Bar dataKey="completed" fill="#10b981" name="Hoàn thành" />
                  <Bar dataKey="total" fill="#6b7280" name="Tổng" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Không có dữ liệu phiên sạc
              </div>
            )}
          </div>
        </div>

        {/* Top Stations */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top 5 trạm sạc</h2>
          {topStations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Tên trạm</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Phiên sạc</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Doanh thu</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Đánh giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {topStations.map((station, index) => (
                    <tr key={station.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{station.name}</div>
                        <div className="text-xs text-gray-600">{station.business || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">
                        {station.sessions}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-green-600">
                        {formatCurrency(station.revenue)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">
                        {station.rating > 0 ? (
                          <span>⭐ {station.rating.toFixed(1)} ({station.reviews})</span>
                        ) : (
                          <span className="text-gray-400">Chưa có</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Không có dữ liệu trạm sạc
            </div>
          )}
        </div>

        {/* Revenue by Business */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Doanh thu theo doanh nghiệp</h2>
            <span className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
              Hoa hồng: 10%
            </span>
          </div>
          {businessRevenue.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Doanh nghiệp</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Trạm</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Phiên sạc</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Doanh thu</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Hoa hồng (10%)</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Chi trả owner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {businessRevenue.map((business, index) => (
                    <tr key={business.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{business.business_name}</div>
                        <div className="text-xs text-gray-600">{business.owner_name}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">
                        {business.total_stations}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">
                        {business.total_sessions}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                        {formatCurrency(business.total_revenue)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-blue-600">
                        {formatCurrency(business.platform_commission)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-green-600">
                        {formatCurrency(business.owner_payout)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                  <tr className="font-semibold">
                    <td colSpan={4} className="px-4 py-3 text-sm text-gray-900">TỔNG CỘNG</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900">
                      {formatCurrency(businessRevenue.reduce((sum, b) => sum + b.total_revenue, 0))}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-blue-600">
                      {formatCurrency(businessRevenue.reduce((sum, b) => sum + b.platform_commission, 0))}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-green-600">
                      {formatCurrency(businessRevenue.reduce((sum, b) => sum + b.owner_payout, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Không có dữ liệu doanh nghiệp
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Giao dịch gần đây</h2>
          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{transaction.user_name}</div>
                    <div className="text-sm text-gray-600">{transaction.station_name}</div>
                    <div className="text-xs text-gray-500">{transaction.user_email}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      {formatCurrency(transaction.amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(transaction.date).toLocaleString('vi-VN')}
                    </div>
                    <span className={`inline-block mt-1 text-xs px-2 py-1 rounded-full ${
                      transaction.status === 'success' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {transaction.status === 'success' ? 'Thành công' : 'Đang xử lý'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Không có giao dịch gần đây
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
