import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Zap,
  X,
  Loader,
  ArrowUpDown,
  SlidersHorizontal,
  Timer,
  Star,
  Play,
  QrCode,
} from 'lucide-react';
import { toast } from 'sonner';
import { bookingAPI, sessionAPI } from '../../../services/api';
import PageLayout from '../../../components/layout/PageLayout';
import ExpiryCountdown from '../components/ExpiryCountdown';
import ExtendBookingModal from '../components/ExtendBookingModal';
import RatingModal from '../../rating/components/RatingModal';
import CheckInModal from '../components/CheckInModal';
import { useConfirm } from '../../../components/common/ConfirmDialog';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc'); // date_desc, date_asc, price_desc, price_asc
  const [showFilters, setShowFilters] = useState(false);
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const { confirm } = useConfirm();

  useEffect(() => {
    loadBookings();
  }, [filterStatus]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const response = await bookingAPI.getMyBookings(params);

      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Không thể tải danh sách đặt chỗ');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const confirmed = await confirm({
      title: 'Hủy đặt chỗ',
      message: 'Bạn có chắc muốn hủy đặt chỗ này?',
      confirmText: 'Hủy đặt chỗ',
      cancelText: 'Không',
      type: 'danger'
    });
    
    if (!confirmed) return;

    try {
      const response = await bookingAPI.cancel(bookingId);

      if (response.data.success) {
        toast.success('Đã hủy đặt chỗ thành công');
        loadBookings();
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.response?.data?.message || 'Không thể hủy đặt chỗ');
    }
  };

  const handleExtendBooking = (booking) => {
    setSelectedBooking(booking);
    setExtendModalOpen(true);
  };

  const handleExtendSuccess = (updatedBooking) => {
    // Update the booking in the list
    setBookings((prev) =>
      prev.map((b) =>
        b.id_dat_cho === updatedBooking.id_dat_cho ? updatedBooking : b
      )
    );
    loadBookings(); // Reload to get fresh data
  };

  const handleRateBooking = (booking) => {
    setSelectedBooking(booking);
    setRatingModalOpen(true);
  };

  const handleRatingSuccess = () => {
    // Reload bookings to update rating status
    loadBookings();
  };

  const handleStartCharging = (booking) => {
    // Validate if it's time to start charging
    const now = new Date();
    const startTime = new Date(booking.thoi_gian_bat_dau);

    // Allow starting 15 minutes before booking time
    const earlyStart = new Date(startTime.getTime() - 15 * 60 * 1000);
    
    // ✅ FIX: Chỉ cho phép check-in đến 15 phút SAU giờ bắt đầu
    const lateDeadline = new Date(startTime.getTime() + 15 * 60 * 1000);

    if (now < earlyStart) {
      const minutesUntil = Math.floor((earlyStart - now) / 60000);
      toast.error(`Chưa đến giờ sạc. Vui lòng đợi thêm ${minutesUntil} phút.`);
      return;
    }

    if (now > lateDeadline) {
      toast.error('Đã quá thời gian check-in (muộn quá 15 phút). Booking đã hết hạn.');
      return;
    }

    // Show check-in modal
    setSelectedBooking(booking);
    setCheckInModalOpen(true);
  };

  const handleCheckInSuccess = async (booking) => {
    try {
      const response = await sessionAPI.start(booking.id_dat_cho);

      if (response.data.success) {
        // Close modal first
        setCheckInModalOpen(false);
        
        // Show success message
        toast.success('✅ Đã check-in thành công!', {
          duration: 5000,
          description: `Phiên sạc đã bắt đầu. Mã phiên: #${response.data.data.id_phien_sac}. Vui lòng reload trang để cập nhật trạng thái.`
        });
        
        // TODO: Fix reload bookings issue
        // Tạm thời user phải reload trang thủ công
        // setTimeout(() => {
        //   loadBookings();
        // }, 1000);
      }
    } catch (error) {
      console.error('Error starting charging:', error);
      toast.error(error.response?.data?.message || 'Không thể bắt đầu sạc');
      throw error;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      cho_xac_nhan: {
        label: 'Chờ xác nhận',
        class: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      },
      da_xac_nhan: {
        label: 'Đã xác nhận',
        class: 'bg-blue-100 text-blue-800 border-blue-200',
      },
      dang_su_dung: {
        label: 'Đang sạc',
        class: 'bg-green-100 text-green-800 border-green-200',
      },
      hoan_thanh: {
        label: 'Hoàn thành',
        class: 'bg-gray-100 text-gray-800 border-gray-200',
      },
      huy: { label: 'Đã hủy', class: 'bg-red-100 text-red-800 border-red-200' },
    };

    const config = statusConfig[status] || {
      label: status,
      class: 'bg-gray-100 text-gray-800',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.class}`}
      >
        {config.label}
      </span>
    );
  };

  const canCancelBooking = (booking) => {
    return !['hoan_thanh', 'huy'].includes(booking.trang_thai);
  };

  // Sort and filter bookings
  const sortedAndFilteredBookings = useMemo(() => {
    let result = [...bookings];

    // Sort
    switch (sortBy) {
      case 'date_desc':
        // Sort by ngay_tao (thời gian đặt chỗ) - Mới nhất
        result.sort((a, b) => new Date(b.ngay_tao) - new Date(a.ngay_tao));
        break;
      case 'date_asc':
        // Sort by ngay_tao (thời gian đặt chỗ) - Cũ nhất
        result.sort((a, b) => new Date(a.ngay_tao) - new Date(b.ngay_tao));
        break;
      case 'time_desc':
        // Sort by thoi_gian_bat_dau (thời gian sạc) - Gần nhất
        result.sort(
          (a, b) =>
            new Date(b.thoi_gian_bat_dau) - new Date(a.thoi_gian_bat_dau)
        );
        break;
      case 'time_asc':
        // Sort by thoi_gian_bat_dau (thời gian sạc) - Xa nhất
        result.sort(
          (a, b) =>
            new Date(a.thoi_gian_bat_dau) - new Date(b.thoi_gian_bat_dau)
        );
        break;
      case 'price_desc':
        result.sort(
          (a, b) =>
            (parseFloat(b.uoc_tinh_chi_phi) || 0) -
            (parseFloat(a.uoc_tinh_chi_phi) || 0)
        );
        break;
      case 'price_asc':
        result.sort(
          (a, b) =>
            (parseFloat(a.uoc_tinh_chi_phi) || 0) -
            (parseFloat(b.uoc_tinh_chi_phi) || 0)
        );
        break;
      default:
        break;
    }

    return result;
  }, [bookings, sortBy]);

  if (loading) {
    return (
      <PageLayout className="bg-gray-50">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Đặt chỗ của tôi</h1>
              <p className="text-blue-100 text-sm mt-1">
                {sortedAndFilteredBookings.length} đặt chỗ
              </p>
            </div>
            {/* QR Check-in Button */}
            <button
              onClick={() => navigate('/qr-checkin')}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all backdrop-blur-sm border border-white/30"
              title="Quét QR để check-in"
            >
              <QrCode className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">Quét QR</span>
            </button>
            {/* Sort & Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors relative"
            >
              <SlidersHorizontal className="w-6 h-6" />
              {sortBy !== 'date_desc' && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full"></div>
              )}
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
            {[
              { value: 'all', label: 'Tất cả' },
              { value: 'cho_xac_nhan', label: 'Chờ' },
              { value: 'da_xac_nhan', label: 'Đã xác nhận' },
              { value: 'dang_su_dung', label: 'Đang sạc' },
              { value: 'hoan_thanh', label: 'Hoàn thành' },
              { value: 'huy', label: 'Đã hủy' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilterStatus(tab.value)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                  filterStatus === tab.value
                    ? 'bg-white text-blue-600'
                    : 'bg-blue-500/30 text-white hover:bg-blue-500/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort Options - Collapsible */}
          {showFilters && (
            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2 mb-3">
                <ArrowUpDown className="w-4 h-4" />
                <h3 className="font-semibold text-sm">Sắp xếp theo</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'date_desc', label: 'Đặt gần đây', icon: '🆕' },
                  { value: 'date_asc', label: 'Đặt lâu rồi', icon: '📅' },
                  { value: 'time_desc', label: 'Sạc sớm', icon: '⏰↓' },
                  { value: 'time_asc', label: 'Sạc muộn', icon: '⏰↑' },
                  { value: 'price_desc', label: 'Giá cao', icon: '💰↓' },
                  { value: 'price_asc', label: 'Giá thấp', icon: '💰↑' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setShowFilters(false);
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      sortBy === option.value
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <span className="mr-1">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        {sortedAndFilteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có đặt chỗ nào
            </h3>
            <p className="text-gray-600 mb-6">
              Hãy đặt chỗ tại trạm sạc yêu thích của bạn
            </p>
            <button
              onClick={() => navigate('/map')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Tìm trạm sạc
            </button>
          </div>
        ) : (
          sortedAndFilteredBookings.map((booking) => (
            <BookingCard
              key={booking.id_dat_cho}
              booking={booking}
              onCancel={handleCancelBooking}
              onExtend={handleExtendBooking}
              onRate={handleRateBooking}
              onStartCharging={handleStartCharging}
              getStatusBadge={getStatusBadge}
              canCancel={canCancelBooking(booking)}
            />
          ))
        )}
      </div>

      {/* Extend Booking Modal */}
      <ExtendBookingModal
        isOpen={extendModalOpen}
        onClose={() => setExtendModalOpen(false)}
        booking={selectedBooking}
        onExtendSuccess={handleExtendSuccess}
      />

      {/* Rating Modal */}
      <RatingModal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        booking={selectedBooking}
        onRatingSuccess={handleRatingSuccess}
      />

      {/* Check-in Modal */}
      <CheckInModal
        isOpen={checkInModalOpen}
        onClose={() => setCheckInModalOpen(false)}
        booking={selectedBooking}
        onCheckInSuccess={handleCheckInSuccess}
      />
    </PageLayout>
  );
}

function BookingCard({
  booking,
  onCancel,
  onExtend,
  onRate,
  onStartCharging,
  getStatusBadge,
  canCancel,
}) {
  const navigate = useNavigate();

  const startTime = new Date(booking.thoi_gian_bat_dau);
  const endTime = new Date(booking.thoi_gian_ket_thuc);
  const now = new Date();

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const duration =
    Math.round(((endTime - startTime) / (1000 * 60 * 60)) * 10) / 10;

  // ✅ Check if user can start charging
  // Window: startTime - 15 phút đến startTime + 15 phút
  const canStartCharging =
    booking.trang_thai === 'da_xac_nhan' &&
    now >= new Date(startTime.getTime() - 15 * 60 * 1000) &&
    now <= new Date(startTime.getTime() + 15 * 60 * 1000);

  // ✅ NEW: Check if user can extend booking (thông minh hơn)
  // Cho phép gia hạn khi:
  // 1. Sắp đến giờ (15p trước) hoặc đã quá giờ một chút (30p sau)
  // 2. Chưa check-in (vẫn đang confirmed)
  const canExtendBooking =
    booking.trang_thai === 'da_xac_nhan' &&
    now >= new Date(startTime.getTime() - 15 * 60 * 1000) && // Từ 15p trước giờ hẹn
    now <= new Date(startTime.getTime() + 30 * 60 * 1000);   // Đến 30p sau giờ hẹn

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{booking.ten_tram}</h3>
            <p className="text-xs text-gray-600">
              {booking.hang_xe} {booking.dong_xe}
            </p>
          </div>
        </div>
        {getStatusBadge(booking.trang_thai)}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Location */}
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700">{booking.dia_chi}</p>
        </div>

        {/* Date & Time */}
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <p className="text-sm text-gray-700">{formatDate(startTime)}</p>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <p className="text-sm text-gray-700">
            {formatTime(startTime)} - {formatTime(endTime)} ({duration}h)
          </p>
        </div>

        {/* Connector Info & Location - REDESIGNED FOR CLARITY */}
        {/* Only show detailed connector info for ACTIVE bookings (da_xac_nhan) */}
        {booking.ma_cong_tram && booking.trang_thai === 'da_xac_nhan' && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-4 -mx-1 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b border-blue-200">
              <QrCode className="w-5 h-5 text-blue-600" />
              <h4 className="text-sm font-bold text-blue-900">Thông tin cổng sạc của bạn</h4>
            </div>

            {/* Connector Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {/* Mã cổng */}
              <div className="col-span-2 bg-white rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-gray-600 mb-1">Mã cổng sạc</p>
                <p className="text-lg font-bold text-blue-900 font-mono tracking-wide">
                  📍 {booking.ma_cong_tram}
                </p>
              </div>

              {/* Loại cổng */}
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-gray-600 mb-1">Loại cổng</p>
                <p className="font-semibold text-gray-900">{booking.loai_cong}</p>
              </div>

              {/* Công suất */}
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-gray-600 mb-1">Công suất</p>
                <p className="font-semibold text-gray-900">
                  <Zap className="w-3 h-3 inline mr-1 text-yellow-500" />
                  {booking.cong_suat_kwh} kW
                </p>
              </div>
            </div>

            {/* Hướng dẫn */}
            <div className="bg-blue-100 rounded-lg p-3">
              <p className="text-xs text-blue-900 leading-relaxed">
                <strong>💡 Khi đến trạm:</strong> Tìm cổng có gắn biển/sticker mã{' '}
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-blue-300">
                  {booking.ma_cong_tram}
                </span>{' '}
                → Quét QR code trên cổng đó để check-in.
              </p>
            </div>
          </div>
        )}

        {/* Cost */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Ước tính chi phí:</span>
            <span className="text-lg font-bold text-emerald-700">
              {booking.uoc_tinh_chi_phi && parseFloat(booking.uoc_tinh_chi_phi) > 0 ? (
                <>
                  ~{parseFloat(booking.uoc_tinh_chi_phi).toLocaleString('vi-VN')} đ
                </>
              ) : (
                <span className="text-sm text-gray-600 font-normal italic">
                  Tính theo thực tế
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Expiry Countdown */}
        {booking.het_han && booking.trang_thai === 'cho_xac_nhan' && (
          <ExpiryCountdown
            expiryTime={booking.het_han}
            status={booking.trang_thai}
          />
        )}

        {/* Confirmation Code */}
        {booking.ma_xac_nhan && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Mã xác nhận:</span>
              <span className="text-sm font-mono font-bold text-blue-700">
                {booking.ma_xac_nhan}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex flex-wrap gap-2">
        <button
          onClick={() => navigate(`/stations/${booking.id_tram}`)}
          className="flex-1 min-w-[120px] px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-colors"
        >
          Xem trạm
        </button>

        {/* Start Charging button - only for confirmed bookings within time window */}
        {canStartCharging && (
          <button
            onClick={() => onStartCharging(booking)}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium text-sm transition-all shadow-md hover:shadow-lg"
          >
            <Play className="w-4 h-4" />
            Bắt đầu sạc
          </button>
        )}

        {/* Extend button - NEW LOGIC: Hiển thị khi sắp hết giờ hoặc đã muộn một chút */}
        {canExtendBooking && (
          <button
            onClick={() => onExtend(booking)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg font-medium text-sm transition-colors"
            title="Gia hạn thêm 15 phút nếu bạn đang trên đường đến"
          >
            <Timer className="w-4 h-4" />
            Gia hạn
          </button>
        )}

        {canCancel && (
          <button
            onClick={() => onCancel(booking.id_dat_cho)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium text-sm transition-colors"
          >
            <X className="w-4 h-4" />
            Hủy
          </button>
        )}
      </div>
    </div>
  );
}
