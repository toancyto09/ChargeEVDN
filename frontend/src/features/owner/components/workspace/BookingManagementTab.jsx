import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Users, Calendar, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { ownerAPI } from '../../../../services/api';
import BookingDetailModal from '../booking/BookingDetailModal';

export default function BookingManagementTab({ stationId }) {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    date_from: '',
    date_to: ''
  });

  useEffect(() => {
    loadData();
  }, [stationId, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = { station_id: stationId };
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.date_from) params.date_from = filters.date_from;
      if (filters.date_to) params.date_to = filters.date_to;

      const [bookingsRes, statsRes] = await Promise.all([
        ownerAPI.getBookings(params),
        ownerAPI.getBookingStats(params)
      ]);

      // Handle different response structures
      const bookingsData = Array.isArray(bookingsRes.data) 
        ? bookingsRes.data 
        : (bookingsRes.data?.data || []);
      const statsData = statsRes.data?.data || statsRes.data || null;
      
      setBookings(bookingsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Không thể tải danh sách đặt chỗ');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (booking) => {
    setSelectedBooking(booking);
  };

  const handleConfirm = async (bookingId) => {
    try {
      await ownerAPI.confirmBooking(bookingId);
      toast.success('Xác nhận đặt chỗ thành công');
      loadData();
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error confirming booking:', error);
      toast.error(error.response?.data?.message || 'Không thể xác nhận đặt chỗ');
    }
  };

  const handleCancel = async (bookingId) => {
    if (!confirm('Bạn có chắc chắn muốn hủy đặt chỗ này?')) return;

    try {
      await ownerAPI.cancelBooking(bookingId);
      toast.success('Hủy đặt chỗ thành công');
      loadData();
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.response?.data?.message || 'Không thể hủy đặt chỗ');
    }
  };

  const statusConfig = {
    cho_xac_nhan: { label: 'Chờ xác nhận', color: 'yellow', icon: Clock },
    da_xac_nhan: { label: 'Đã xác nhận', color: 'blue', icon: CheckCircle },
    dang_su_dung: { label: 'Đang sử dụng', color: 'green', icon: CheckCircle },
    hoan_thanh: { label: 'Hoàn thành', color: 'gray', icon: CheckCircle },
    huy: { label: 'Đã hủy', color: 'red', icon: XCircle }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-yellow-900">{stats.by_status?.cho_xac_nhan || 0}</div>
            <div className="text-sm text-yellow-700">Chờ xác nhận</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-900">{stats.by_status?.da_xac_nhan || 0}</div>
            <div className="text-sm text-blue-700">Đã xác nhận</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-900">{stats.by_status?.dang_su_dung || 0}</div>
            <div className="text-sm text-green-700">Đang sử dụng</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.by_status?.hoan_thanh || 0}</div>
            <div className="text-sm text-gray-700">Hoàn thành</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="cho_xac_nhan">Chờ xác nhận</option>
            <option value="da_xac_nhan">Đã xác nhận</option>
            <option value="dang_su_dung">Đang sử dụng</option>
            <option value="hoan_thanh">Hoàn thành</option>
            <option value="huy">Đã hủy</option>
          </select>
          
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Từ ngày"
          />
          
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Đến ngày"
          />
        </div>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có đặt chỗ nào</h3>
          <p className="text-gray-600">Đặt chỗ sẽ hiển thị ở đây khi có khách hàng đặt</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Khách hàng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Cổng</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Thời gian</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map((booking) => {
                const status = statusConfig[booking.trang_thai] || statusConfig.cho_xac_nhan;
                const StatusIcon = status.icon;
                return (
                  <tr key={booking.id_dat_cho} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{booking.ten_nguoi_dung || 'N/A'}</div>
                      <div className="text-sm text-gray-600">{booking.email_nguoi_dung || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{booking.ma_cong_tram || 'N/A'}</div>
                      <div className="text-xs text-gray-600">{booking.loai_cong || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="text-sm text-gray-900">
                        {new Date(booking.ngay_tao).toLocaleString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 bg-${status.color}-100 text-${status.color}-700 rounded-full text-xs font-medium`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleViewDetail(booking)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        Xem
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <BookingDetailModal
          isOpen={true}
          onClose={() => setSelectedBooking(null)}
          booking={selectedBooking}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}

BookingManagementTab.propTypes = {
  stationId: PropTypes.number.isRequired
};

