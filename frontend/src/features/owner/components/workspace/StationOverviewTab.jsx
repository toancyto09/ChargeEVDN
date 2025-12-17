import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Building2, MapPin, DollarSign, Star, Calendar, CheckCircle, XCircle, Clock, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { ownerAPI } from '../../../../services/api';
import QRCodeModal from '../station/QRCodeModal';

export default function StationOverviewTab({ stationId }) {
  const [station, setStation] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [stationId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load station info and stats in parallel
      const [stationRes, bookingStatsRes] = await Promise.all([
        ownerAPI.getStation(stationId),
        ownerAPI.getBookingStats({ station_id: stationId }).catch(() => ({ data: null }))
      ]);
      
      const stationData = stationRes.data?.data || stationRes.data;
      setStation(stationData);
      
      // Process stats
      const statsData = bookingStatsRes.data?.data || bookingStatsRes.data;
      if (statsData) {
        setStats({
          total_bookings: statsData.total_bookings || 0,
          total_sessions: 0, // TODO: Add session stats endpoint
          total_revenue: statsData.estimated_revenue || 0
        });
      }
    } catch (error) {
      console.error('Error loading station:', error);
      toast.error('Không thể tải thông tin trạm');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Không tìm thấy thông tin trạm</p>
      </div>
    );
  }

  const statusConfig = {
    approved: { label: 'Đã duyệt', color: 'green', icon: CheckCircle },
    pending: { label: 'Chờ duyệt', color: 'yellow', icon: Clock },
    rejected: { label: 'Bị từ chối', color: 'red', icon: XCircle }
  };

  const status = statusConfig[station.trang_thai_duyet] || statusConfig.pending;
  const StatusIcon = status.icon;

  // Helper to format currency without decimals
  const formatCurrency = (value) => {
    return Math.round(value || 0).toLocaleString('vi-VN');
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{station.ten_tram}</h1>
            <div className="flex items-center gap-2 text-blue-100">
              <MapPin className="w-4 h-4" />
              <span>{station.dia_chi}</span>
            </div>
          </div>
          <button
            onClick={() => setShowQRModal(true)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors flex items-center gap-2"
          >
            <QrCode className="w-5 h-5" />
            QR Code
          </button>
        </div>
      </div>

      {/* Status & Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-${status.color}-100 rounded-lg flex items-center justify-center`}>
              <StatusIcon className={`w-5 h-5 text-${status.color}-600`} />
            </div>
            <div>
              <div className="text-sm text-gray-600">Trạng thái</div>
              <div className={`font-semibold text-${status.color}-600`}>{status.label}</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Giá điện</div>
              <div className="font-semibold text-gray-900">
                {formatCurrency(station.gia_kwh)} đ/kWh
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Đánh giá</div>
              <div className="font-semibold text-gray-900">
                ⭐ {Number(station.stats?.ratings?.diem_trung_binh || 0).toFixed(1)} ({station.stats?.ratings?.so_danh_gia || 0})
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Ngày tạo</div>
              <div className="font-semibold text-gray-900">
                {new Date(station.ngay_tao).toLocaleDateString('vi-VN')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Thống kê</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats?.total_bookings || 0}</div>
            <div className="text-sm text-gray-600">Tổng đặt chỗ</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats?.total_sessions || 0}</div>
            <div className="text-sm text-gray-600">Tổng phiên sạc</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats?.total_revenue)} đ
            </div>
            <div className="text-sm text-gray-600">Tổng doanh thu</div>
          </div>
        </div>
      </div>

      {/* Rejection Reason */}
      {station.trang_thai_duyet === 'rejected' && station.ly_do_tu_choi && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-red-900 mb-2">Lý do từ chối</h3>
          <p className="text-sm text-red-700">{station.ly_do_tu_choi}</p>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <QRCodeModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          station={station}
        />
      )}
    </div>
  );
}

StationOverviewTab.propTypes = {
  stationId: PropTypes.number.isRequired
};

