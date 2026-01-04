import { useState, useEffect } from 'react';
import { 
  Zap, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  MapPin,
  Leaf,
  BarChart3,
  Clock
} from 'lucide-react';
import { sessionAPI } from '../../../services/api';
import PageLayout from '../../../components/layout/PageLayout';

export default function StatisticsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalEnergy: 0, // kWh
    totalCost: 0, // VND
    totalDuration: 0, // minutes
    co2Saved: 0, // kg
    favoriteStation: null,
    thisMonthSessions: 0,
    lastMonthSessions: 0,
    thisMonthEnergy: 0,
    lastMonthEnergy: 0
  });

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      // Don't pass status parameter to get ALL sessions
      const response = await sessionAPI.getMySessions();
      
      if (response.data.success) {
        const allSessions = response.data.data || [];
        
        // Use all sessions for statistics
        calculateStats(allSessions);
        setSessions(allSessions);
      } else {
        console.error('❌ API returned success: false');
      }
    } catch (error) {
      console.error('❌ Failed to load statistics:', error);
      console.error('❌ Error details:', error.response || error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (sessions) => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    let totalEnergy = 0;
    let totalCost = 0;
    let totalDuration = 0;
    let thisMonthSessions = 0;
    let lastMonthSessions = 0;
    let thisMonthEnergy = 0;
    let lastMonthEnergy = 0;
    const stationCount = {};

    sessions.forEach(session => {
      // Match backend field names: dien_nang_kwh, tong_chi_phi
      const energy = parseFloat(session.dien_nang_kwh || 0);
      const cost = parseFloat(session.tong_chi_phi || 0);
      
      totalEnergy += energy;
      totalCost += cost;

      // Calculate duration
      if (session.thoi_gian_bat_dau && session.thoi_gian_ket_thuc) {
        const start = new Date(session.thoi_gian_bat_dau);
        const end = new Date(session.thoi_gian_ket_thuc);
        totalDuration += (end - start) / (1000 * 60); // minutes
      }

      // Count by station
      const stationName = session.ten_tram || 'Unknown';
      stationCount[stationName] = (stationCount[stationName] || 0) + 1;

      // Month comparison
      const sessionDate = new Date(session.thoi_gian_bat_dau);
      const sessionMonth = sessionDate.getMonth();
      const sessionYear = sessionDate.getFullYear();

      if (sessionYear === thisYear && sessionMonth === thisMonth) {
        thisMonthSessions++;
        thisMonthEnergy += energy;
      } else if (sessionYear === lastMonthYear && sessionMonth === lastMonth) {
        lastMonthSessions++;
        lastMonthEnergy += energy;
      }
    });

    // Find favorite station
    let favoriteStation = null;
    let maxCount = 0;
    Object.entries(stationCount).forEach(([name, count]) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteStation = { name, count };
      }
    });

    // Calculate CO2 saved (1 kWh EV saves ~0.5 kg CO2 vs gasoline car)
    const co2Saved = totalEnergy * 0.5;

    setStats({
      totalSessions: sessions.length,
      totalEnergy: Math.round(totalEnergy * 10) / 10,
      totalCost: Math.round(totalCost),
      totalDuration: Math.round(totalDuration),
      co2Saved: Math.round(co2Saved * 10) / 10,
      favoriteStation,
      thisMonthSessions,
      lastMonthSessions,
      thisMonthEnergy: Math.round(thisMonthEnergy * 10) / 10,
      lastMonthEnergy: Math.round(lastMonthEnergy * 10) / 10
    });
  };

  const getPercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  if (loading) {
    return (
      <PageLayout title="Thống kê">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thống kê...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  const energyChange = getPercentageChange(stats.thisMonthEnergy, stats.lastMonthEnergy);
  const sessionChange = getPercentageChange(stats.thisMonthSessions, stats.lastMonthSessions);

  return (
    <PageLayout title="Thống kê">
      <div className="max-w-6xl mx-auto px-4 py-6 pb-24">
        {/* Header Card */}
        <div className="mb-6 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <BarChart3 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">Thống kê sử dụng</h1>
              <p className="text-emerald-100 text-sm">
                Tổng quan hoạt động sạc xe của bạn
              </p>
            </div>
          </div>
        </div>

        {/* No Data State */}
        {stats.totalSessions === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md">
            <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có dữ liệu
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn chưa có phiên sạc nào hoàn thành.<br />
              Hãy đặt chỗ và sạc xe để xem thống kê!
            </p>
          </div>
        ) : (
          <>
            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                icon={Zap}
                label="Tổng điện năng"
                value={stats.totalEnergy}
                unit="kWh"
                color="bg-yellow-500"
                iconBg="bg-yellow-50"
                iconColor="text-yellow-600"
              />
              <StatCard
                icon={DollarSign}
                label="Tổng chi phí"
                value={stats.totalCost.toLocaleString('vi-VN')}
                unit="đ"
                color="bg-green-500"
                iconBg="bg-green-50"
                iconColor="text-green-600"
              />
              <StatCard
                icon={Calendar}
                label="Số lần sạc"
                value={stats.totalSessions}
                unit="lần"
                color="bg-blue-500"
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
              />
              <StatCard
                icon={Leaf}
                label="CO₂ tiết kiệm"
                value={stats.co2Saved}
                unit="kg"
                color="bg-emerald-500"
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
              />
            </div>

            {/* Comparison Cards */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <ComparisonCard
                title="Điện năng tháng này"
                current={stats.thisMonthEnergy}
                previous={stats.lastMonthEnergy}
                unit="kWh"
                icon={Zap}
                change={energyChange}
              />
              <ComparisonCard
                title="Số lần sạc tháng này"
                current={stats.thisMonthSessions}
                previous={stats.lastMonthSessions}
                unit="lần"
                icon={TrendingUp}
                change={sessionChange}
              />
            </div>

            {/* Favorite Station Card */}
            {stats.favoriteStation && (
              <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Trạm yêu thích</h3>
                    <p className="text-sm text-gray-500">Bạn đến nhiều nhất</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                  <p className="text-lg font-semibold text-purple-900 mb-1">
                    {stats.favoriteStation.name}
                  </p>
                  <p className="text-sm text-purple-600">
                    Đã sạc {stats.favoriteStation.count} lần tại đây
                  </p>
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-blue-900 mb-2">Thời gian sạc</h3>
                  <p className="text-blue-700 text-sm mb-3">
                    Tổng thời gian: <span className="font-semibold">
                      {Math.floor(stats.totalDuration / 60)}h {stats.totalDuration % 60}ph
                    </span>
                  </p>
                  <p className="text-blue-600 text-xs">
                    💡 Mẹo: Sạc vào giờ thấp điểm (22h-6h) để tiết kiệm chi phí
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, unit, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{unit}</p>
      </div>
    </div>
  );
}

// Comparison Card Component
function ComparisonCard({ title, current, previous, unit, icon: Icon, change }) {
  const isPositive = change > 0;
  const isZero = change === 0;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-indigo-600" />
        </div>
        <h3 className="font-bold text-gray-900">{title}</h3>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <p className="text-3xl font-bold text-gray-900">{current}</p>
            <p className="text-gray-500">{unit}</p>
          </div>
          <p className="text-sm text-gray-500">
            Tháng trước: {previous} {unit}
          </p>
        </div>
        
        {!isZero && (
          <div className={`px-3 py-1.5 rounded-full ${
            isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <p className="text-sm font-semibold">
              {isPositive ? '+' : ''}{change}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
