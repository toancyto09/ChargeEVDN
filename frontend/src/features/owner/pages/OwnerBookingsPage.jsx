import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Calendar, 
  Filter, 
  Search, 
  ChevronRight,
  Clock,
  User,
  MapPin,
  Zap,
  XCircle,
  CheckCircle,
  AlertCircle,
  BarChart3,
  ArrowLeft
} from 'lucide-react';
import { ownerAPI } from '../../../services/api';
import { useOwnerStation } from '../contexts/OwnerStationContext';
import PageLayout from '../../../components/layout/PageLayout';
import StationSelector from '../components/shared/StationSelector';
import BookingDetailModal from '../components/booking/BookingDetailModal';

/**
 * Owner Bookings Page
 * Manage bookings for owner's stations
 */
export default function OwnerBookingsPage() {
  const { selectedStationId, stations } = useOwnerStation();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Filters
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Pagination
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false,
  });

  useEffect(() => {
    loadStats();
  }, [selectedStationId, startDate, endDate]);

  useEffect(() => {
    loadBookings();
  }, [selectedStationId, selectedStatus, startDate, endDate]);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const params = {};
      if (selectedStationId) params.stationId = selectedStationId;
      if (startDate) params.date_from = startDate;
      if (endDate) params.date_to = endDate;

      const response = await ownerAPI.getBookingStats(params);
      // Handle different response structures
      const statsData = response.data?.data || response.data || null;
      setStats(statsData);
    } catch (error) {
      console.error('Load stats error:', error);
      toast.error('Không thể tải thống kê');
    } finally {
      setStatsLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      const params = {
        limit: pagination.limit,
        offset: pagination.offset,
      };
      
      if (selectedStationId) params.stationId = selectedStationId;
      if (selectedStatus) params.status = selectedStatus;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await ownerAPI.getBookings(params);
      
      if (response.data.success) {
        setBookings(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Load bookings error:', error);
      toast.error('Không thể tải danh sách đặt chỗ');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (bookingId) => {
    if (!bookingId || isNaN(bookingId)) {
      console.error('Invalid booking ID:', bookingId);
      toast.error('ID đặt chỗ không hợp lệ');
      return;
    }

    try {
      const response = await ownerAPI.getBookingDetail(bookingId);
      if (response.data.success) {
        setSelectedBooking(response.data.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Load booking detail error:', error);
      toast.error('Không thể tải chi tiết đặt chỗ');
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    if (!confirm('Xác nhận đặt chỗ này? Khách hàng sẽ được thông báo.')) {
      return;
    }

    try {
      const response = await ownerAPI.confirmBooking(bookingId);
      if (response.data.success) {
        toast.success('Đã xác nhận đặt chỗ thành công');
        loadBookings();
        loadStats();
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Confirm booking error:', error);
      toast.error(error.response?.data?.message || 'Không thể xác nhận đặt chỗ');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Bạn có chắc muốn hủy đặt chỗ này? Khách hàng sẽ được thông báo.')) {
      return;
    }

    try {
      const response = await ownerAPI.cancelBooking(bookingId);
      if (response.data.success) {
        toast.success('Đã hủy đặt chỗ thành công');
        loadBookings();
        loadStats();
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Cancel booking error:', error);
      toast.error(error.response?.data?.message || 'Không thể hủy đặt chỗ');
    }
  };

  const handleResetFilters = () => {
    setSelectedStation('');
    setSelectedStatus('');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      cho_xac_nhan: { 
        label: 'Chờ xác nhận', 
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertCircle 
      },
      da_xac_nhan: { 
        label: 'Đã xác nhận', 
        color: 'bg-blue-100 text-blue-800',
        icon: CheckCircle 
      },
      dang_su_dung: { 
        label: 'Đang sử dụng', 
        color: 'bg-green-100 text-green-800',
        icon: Zap 
      },
      hoan_thanh: { 
        label: 'Hoàn thành', 
        color: 'bg-gray-100 text-gray-800',
        icon: CheckCircle 
      },
      huy: { 
        label: 'Đã hủy', 
        color: 'bg-red-100 text-red-800',
        icon: XCircle 
      },
    };

    const config = statusConfig[status] || statusConfig.cho_xac_nhan;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredBookings = bookings.filter((booking) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      booking.ten_nguoi_dung?.toLowerCase().includes(search) ||
      booking.email_nguoi_dung?.toLowerCase().includes(search) ||
      booking.ten_tram?.toLowerCase().includes(search) ||
      booking.ma_xac_nhan?.toLowerCase().includes(search)
    );
  });

  return (
    <PageLayout className="bg-gray-50">
      {/* Header - closer to left edge */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="px-3 py-3 flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Quản lý Đặt chỗ</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        
        {/* Statistics Cards */}
        {!statsLoading && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Tổng đặt chỗ</span>
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.total_bookings}</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Hoàn thành</span>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.by_status.hoan_thanh}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.completion_rate}%</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Đã hủy</span>
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.by_status.huy}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.cancellation_rate}%</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Khách hàng</span>
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.unique_customers}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Bộ lọc</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Station Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạm sạc
              </label>
              <StationSelector />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="cho_xac_nhan">Chờ xác nhận</option>
                <option value="da_xac_nhan">Đã xác nhận</option>
                <option value="dang_su_dung">Đang sử dụng</option>
                <option value="hoan_thanh">Hoàn thành</option>
                <option value="huy">Đã hủy</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Từ ngày
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đến ngày
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên, email, trạm, mã xác nhận..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Đặt lại
            </button>

            <button
              onClick={loadStats}
              className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Cập nhật thống kê
            </button>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              Danh sách đặt chỗ ({filteredBookings.length})
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Không có đặt chỗ nào</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => {
                // Debug log
                if (!booking.id_dat_cho) {
                  console.warn('Booking without ID:', booking);
                }
                
                return (
                  <div
                    key={booking.id_dat_cho || Math.random()}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleViewDetail(booking.id_dat_cho)}
                  >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      {/* Header */}
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {booking.ten_nguoi_dung}
                        </span>
                        {getStatusBadge(booking.trang_thai)}
                      </div>

                      {/* Station & Connector */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{booking.ten_tram}</span>
                        <span>•</span>
                        <Zap className="w-4 h-4" />
                        <span>{booking.ma_cong_tram} ({booking.loai_cong})</span>
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{formatDateTime(booking.thoi_gian_bat_dau)}</span>
                      </div>

                      {/* Vehicle */}
                      <div className="text-sm text-gray-600">
                        🚗 {booking.hang_xe} {booking.dong_xe} • {booking.bien_so}
                      </div>

                      {/* Estimated Cost */}
                      {booking.uoc_tinh_chi_phi && (
                        <div className="text-sm font-medium text-green-600">
                          Ước tính: {booking.uoc_tinh_chi_phi?.toLocaleString('vi-VN')} đ
                        </div>
                      )}
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-2" />
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>

        {/* Pagination info */}
        {pagination.total > 0 && (
          <div className="text-center text-sm text-gray-600">
            Hiển thị {Math.min(pagination.offset + filteredBookings.length, pagination.total)} / {pagination.total} đặt chỗ
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {showDetailModal && selectedBooking && (
        <BookingDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedBooking(null);
          }}
          booking={selectedBooking}
          onConfirm={handleConfirmBooking}
          onCancel={handleCancelBooking}
          onRefresh={loadBookings}
        />
      )}
    </PageLayout>
  );
}

