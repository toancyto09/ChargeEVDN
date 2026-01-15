import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, Calendar, MapPin, DollarSign, Clock, TrendingUp, 
  Filter, Search, Download, ChevronRight, Battery, Info 
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * Payment History Page - Premium Design
 * Shows all user's charging sessions and payments
 */
const PaymentHistoryPage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, week, month
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Vui lòng đăng nhập');
        navigate('/login');
        return;
      }

      // Get user profile first to get userId
      const profileResponse = await fetch('http://localhost:8080/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const profileData = await profileResponse.json();
      
      if (!profileData.success) {
        toast.error('Vui lòng đăng nhập lại');
        navigate('/login');
        return;
      }

      const userId = profileData.data.id_nguoi_dung;

      // Fetch all sessions for this user that are completed
      // userId is extracted from token on backend
      const response = await fetch(`http://localhost:8080/api/sessions?status=completed`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Parse numeric fields to ensure they're numbers, not strings
        const parsedSessions = (data.data || []).map(session => ({
          ...session,
          dien_nang_kwh: parseFloat(session.dien_nang_kwh) || 0,
          don_gia_kwh: parseFloat(session.don_gia_kwh) || 0,
          so_phut_cho: parseInt(session.so_phut_cho) || 0,
          tong_chi_phi: parseFloat(session.tong_chi_phi) || 0,
          chi_phi_sac: parseFloat(session.chi_phi_sac) || 0,
          chi_phi_cho: parseFloat(session.chi_phi_cho) || 0,
          soc_truoc: session.soc_truoc ? parseInt(session.soc_truoc) : null,
          soc_sau: session.soc_sau ? parseInt(session.soc_sau) : null
        }));

        // Sort by date, newest first
        const sortedSessions = parsedSessions.sort((a, b) => 
          new Date(b.thoi_gian_ket_thuc) - new Date(a.thoi_gian_ket_thuc)
        );
        setSessions(sortedSessions);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      toast.error('Không thể tải lịch sử thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (start, end) => {
    const diff = new Date(end) - new Date(start);
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getTotalStats = () => {
    const total = sessions.reduce((acc, s) => ({
      amount: acc.amount + parseFloat(s.tong_chi_phi || s.chi_phi_sac || 0),
      energy: acc.energy + parseFloat(s.dien_nang_kwh || 0),
      sessions: acc.sessions + 1
    }), { amount: 0, energy: 0, sessions: 0 });
    
    return total;
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.ten_tram?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return matchesSearch && new Date(session.thoi_gian_ket_thuc) >= weekAgo;
    } else if (filter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return matchesSearch && new Date(session.thoi_gian_ket_thuc) >= monthAgo;
    }
    
    return matchesSearch;
  });

  const stats = getTotalStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg font-semibold">Đang tải lịch sử...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-4 px-3 md:px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Header with Back Button */}
        <div className="mb-4 md:mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 text-gray-500 hover:text-emerald-600 mb-3 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
          
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
            Lịch sử thanh toán 💳
          </h1>
          <p className="text-gray-500 text-sm">
            Theo dõi các phiên sạc của bạn
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-3 md:p-4 text-white shadow-lg">
            <DollarSign className="w-5 h-5 opacity-80 mb-1" />
            <p className="text-[10px] md:text-xs opacity-90">Tổng chi</p>
            <p className="text-sm md:text-lg font-bold truncate">
              {formatCurrency(stats.amount)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-3 md:p-4 text-white shadow-lg">
            <Zap className="w-5 h-5 opacity-80 mb-1" />
            <p className="text-[10px] md:text-xs opacity-90">Điện năng</p>
            <p className="text-sm md:text-lg font-bold">
              {stats.energy.toFixed(1)} <span className="text-[10px] md:text-xs font-normal">kWh</span>
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-3 md:p-4 text-white shadow-lg">
            <Calendar className="w-5 h-5 opacity-80 mb-1" />
            <p className="text-[10px] md:text-xs opacity-90">Số lần</p>
            <p className="text-sm md:text-lg font-bold">
              {stats.sessions} <span className="text-[10px] md:text-xs font-normal">lần</span>
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-3xl shadow-xl p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên trạm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none font-medium text-sm md:text-base"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 md:px-6 py-3 rounded-xl font-semibold transition whitespace-nowrap text-sm md:text-base ${
                  filter === 'all' 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilter('week')}
                className={`px-4 md:px-6 py-3 rounded-xl font-semibold transition whitespace-nowrap text-sm md:text-base ${
                  filter === 'week' 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                7 ngày
              </button>
              <button
                onClick={() => setFilter('month')}
                className={`px-4 md:px-6 py-3 rounded-xl font-semibold transition whitespace-nowrap text-sm md:text-base ${
                  filter === 'month' 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                30 ngày
              </button>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        {filteredSessions.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Chưa có lịch sử thanh toán
            </h3>
            <p className="text-gray-600 mb-6">
              Bắt đầu sạc xe để xem lịch sử ở đây
            </p>
            <button
              onClick={() => navigate('/map')}
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold hover:shadow-xl transition"
            >
              Tìm trạm sạc
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map((session, index) => (
              <div
                key={session.id_phien_sac}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-4 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Session Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm text-gray-900 truncate">
                          #{session.id_phien_sac} - {session.ten_tram || 'Trạm sạc'}
                        </h3>
                        <p className="text-gray-500 text-xs">
                          {formatDate(session.thoi_gian_ket_thuc)} • {formatTime(session.thoi_gian_ket_thuc)}
                        </p>
                      </div>
                    </div>

                    {/* Details Row */}
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-cyan-600 font-medium">
                        ⚡ {(session.dien_nang_kwh || 0).toFixed(1)} kWh
                      </span>
                      <span className="text-purple-600 font-medium">
                        🕐 {session.thoi_gian_bat_dau && session.thoi_gian_ket_thuc
                          ? calculateDuration(session.thoi_gian_bat_dau, session.thoi_gian_ket_thuc)
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>

                  {/* Right: Amount */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-emerald-600">
                      {formatCurrency(session.tong_chi_phi || session.chi_phi_sac || 0)}
                    </p>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      ✓ Đã TT
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Export Button
        {filteredSessions.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => toast.success('Tính năng đang phát triển!')}
              className="inline-flex items-center gap-2 px-5 py-2 bg-white border border-gray-200 rounded-xl font-medium text-sm hover:shadow-md transition"
            >
              <Download className="w-4 h-4" />
              Xuất báo cáo
            </button>
          </div>
        )} */}

      </div>
    </div>
  );
};

export default PaymentHistoryPage;
