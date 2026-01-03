import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Zap, Clock, Battery, DollarSign, MapPin, Calendar } from 'lucide-react';

/**
 * ChargingSessionCard Component
 * Displays a charging session with real-time monitoring
 */
export default function ChargingSessionCard({ session, onViewDetails }) {
  const [duration, setDuration] = useState('');
  const [isActive, setIsActive] = useState(session.trang_thai === 'dang_sac');

  // Calculate duration in real-time for active sessions
  useEffect(() => {
    if (!isActive || !session.thoi_gian_bat_dau) return;

    const updateDuration = () => {
      const start = new Date(session.thoi_gian_bat_dau);
      const now = new Date();
      const diff = now - start;

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setDuration(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateDuration();
    const interval = setInterval(updateDuration, 1000);

    return () => clearInterval(interval);
  }, [isActive, session.thoi_gian_bat_dau]);

  // Format date/time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '0 đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Status badge
  const getStatusBadge = () => {
    const statusMap = {
      dang_sac: { label: 'Đang sạc', className: 'bg-green-100 text-green-800', icon: Zap },
      hoan_thanh: { label: 'Hoàn thành', className: 'bg-blue-100 text-blue-800', icon: Battery },
      bi_gian_doan: { label: 'Bị gián đoạn', className: 'bg-red-100 text-red-800', icon: Zap },
    };

    const status = statusMap[session.trang_thai] || { 
      label: session.trang_thai, 
      className: 'bg-gray-100 text-gray-800',
      icon: Zap
    };
    const Icon = status.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.className}`}>
        <Icon className="w-3 h-3" />
        {status.label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-3 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-base sm:text-lg line-clamp-1">
              {session.ten_tram || 'Trạm sạc'}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="line-clamp-1">{session.dia_chi || 'N/A'}</span>
            </p>
          </div>
          <div className="ml-2">
            {getStatusBadge()}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Active Session - Show live duration */}
        {isActive && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800">Thời gian sạc:</span>
              <span className="text-2xl font-bold text-green-700 font-mono tabular-nums">
                {duration}
              </span>
            </div>
            <div className="mt-2 h-2 bg-green-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </div>
        )}

        {/* Session Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {/* Start Time */}
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Bắt đầu</p>
              <p className="font-medium text-gray-900">
                {formatDateTime(session.thoi_gian_bat_dau)}
              </p>
            </div>
          </div>

          {/* End Time */}
          {session.thoi_gian_ket_thuc && (
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Kết thúc</p>
                <p className="font-medium text-gray-900">
                  {formatDateTime(session.thoi_gian_ket_thuc)}
                </p>
              </div>
            </div>
          )}

          {/* Energy Consumed */}
          {session.dien_nang_kwh && (
            <div className="flex items-start gap-2">
              <Battery className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Điện năng</p>
                <p className="font-medium text-gray-900">
                  {parseFloat(session.dien_nang_kwh).toFixed(2)} kWh
                </p>
              </div>
            </div>
          )}

          {/* SOC Change */}
          {session.soc_truoc !== null && session.soc_sau !== null && (
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">SOC</p>
                <p className="font-medium text-gray-900">
                  {session.soc_truoc}% → {session.soc_sau}%
                  <span className="text-green-600 ml-1">
                    (+{session.soc_sau - session.soc_truoc}%)
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Total Cost */}
          {session.tong_tien && (
            <div className="col-span-2 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3 mt-1">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Tổng chi phí</span>
              </div>
              <span className="text-lg font-bold text-blue-700">
                {formatCurrency(session.tong_tien)}
              </span>
            </div>
          )}

          {/* Payment Status */}
          {session.trang_thai === 'hoan_thanh' && (
            <div className="col-span-2">
              {session.payment_status === 'success' ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                  <span className="text-sm font-medium text-green-800">✓ Đã thanh toán</span>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center">
                  <span className="text-sm font-medium text-yellow-800">⚠ Chưa thanh toán</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* View Details Button */}
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(session)}
            className="w-full mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm"
          >
            Xem chi tiết
          </button>
        )}
      </div>
    </div>
  );
}

ChargingSessionCard.propTypes = {
  session: PropTypes.shape({
    id_phien_sac: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    ten_tram: PropTypes.string,
    dia_chi: PropTypes.string,
    trang_thai: PropTypes.string.isRequired,
    thoi_gian_bat_dau: PropTypes.string,
    thoi_gian_ket_thuc: PropTypes.string,
    dien_nang_kwh: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    soc_truoc: PropTypes.number,
    soc_sau: PropTypes.number,
    tong_tien: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    payment_status: PropTypes.string,
  }).isRequired,
  onViewDetails: PropTypes.func,
};

