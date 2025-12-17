import PropTypes from 'prop-types';
import { 
  X, 
  User, 
  MapPin, 
  Zap, 
  Clock, 
  Car,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Battery,
  XCircle,
  CheckCircle,
  AlertCircle,
  Ban
} from 'lucide-react';

/**
 * Booking Detail Modal
 * Display detailed booking information for owner
 */
export default function BookingDetailModal({ isOpen, onClose, booking, onConfirm, onCancel }) {
  if (!isOpen || !booking) return null;

  const getStatusInfo = (status) => {
    const statusConfig = {
      cho_xac_nhan: { 
        label: 'Chờ xác nhận', 
        color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
        icon: AlertCircle 
      },
      da_xac_nhan: { 
        label: 'Đã xác nhận', 
        color: 'text-blue-700 bg-blue-50 border-blue-200',
        icon: CheckCircle 
      },
      dang_su_dung: { 
        label: 'Đang sử dụng', 
        color: 'text-green-700 bg-green-50 border-green-200',
        icon: Zap 
      },
      hoan_thanh: { 
        label: 'Hoàn thành', 
        color: 'text-gray-700 bg-gray-50 border-gray-200',
        icon: CheckCircle 
      },
      huy: { 
        label: 'Đã hủy', 
        color: 'text-red-700 bg-red-50 border-red-200',
        icon: XCircle 
      },
    };

    return statusConfig[status] || statusConfig.cho_xac_nhan;
  };

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

  const getCancellationSourceLabel = (nguonHuy) => {
    const sources = {
      nguoi_dung: 'Người dùng',
      chu_so_huu: 'Chủ sở hữu',
      he_thong: 'Hệ thống',
    };
    return sources[nguonHuy] || 'N/A';
  };

  const formatCurrency = (value) => {
    return Math.round(value || 0).toLocaleString('vi-VN');
  };

  const statusInfo = getStatusInfo(booking.trang_thai);
  const StatusIcon = statusInfo.icon;

  const canConfirm = booking.trang_thai === 'cho_xac_nhan';
  const canCancel = ['cho_xac_nhan', 'da_xac_nhan'].includes(booking.trang_thai);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Chi tiết đặt chỗ</h2>
            <p className="text-sm text-gray-600 mt-1">#{booking.id_dat_cho} • Mã: {booking.ma_xac_nhan}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Status */}
          <div className={`flex items-center gap-3 p-4 rounded-xl border-2 ${statusInfo.color}`}>
            <StatusIcon className="w-6 h-6" />
            <div className="flex-1">
              <p className="font-semibold">{statusInfo.label}</p>
              {booking.trang_thai === 'huy' && booking.nguon_huy && (
                <p className="text-sm mt-1">
                  Hủy bởi: {getCancellationSourceLabel(booking.nguon_huy)}
                </p>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Thông tin khách hàng
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-gray-700">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{booking.ten_nguoi_dung}</span>
              </div>
              {booking.email_nguoi_dung && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{booking.email_nguoi_dung}</span>
                </div>
              )}
              {booking.sdt_nguoi_dung && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{booking.sdt_nguoi_dung}</span>
                </div>
              )}
            </div>
          </div>

          {/* Station & Connector */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Trạm sạc & Cổng sạc
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div>
                <p className="font-medium text-gray-900">{booking.ten_tram}</p>
                <p className="text-sm text-gray-600 mt-1">{booking.dia_chi_tram}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-600" />
                  <span className="font-medium">{booking.ma_cong_tram}</span>
                </div>
                <div className="text-gray-600">
                  {booking.loai_cong} • {booking.cong_suat_kwh} kW
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-600" />
              Phương tiện
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="font-medium text-gray-900">
                {booking.hang_xe} {booking.dong_xe}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Biển số: <span className="font-medium">{booking.bien_so}</span></span>
                {booking.dung_luong_pin_kwh && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Battery className="w-4 h-4" />
                      <span>{Math.round(booking.dung_luong_pin_kwh || 0)} kWh</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Booking Time */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Thời gian đặt chỗ
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Bắt đầu</p>
                  <p className="font-medium text-gray-900">{formatDateTime(booking.thoi_gian_bat_dau)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Kết thúc</p>
                  <p className="font-medium text-gray-900">{formatDateTime(booking.thoi_gian_ket_thuc)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Hết hạn check-in</p>
                  <p className="font-medium text-gray-900">{formatDateTime(booking.het_han)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Ngày tạo</p>
                  <p className="font-medium text-gray-900">{formatDateTime(booking.ngay_tao)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Estimates */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Chi phí ước tính
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              {booking.uoc_tinh_kwh && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Điện năng ước tính</span>
                  <span className="font-medium">{Math.round(booking.uoc_tinh_kwh || 0)} kWh</span>
                </div>
              )}
              {booking.gia_kwh && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Đơn giá điện</span>
                  <span className="font-medium">{formatCurrency(booking.gia_kwh)} đ/kWh</span>
                </div>
              )}
              {booking.uoc_tinh_chi_phi && (
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="font-medium text-gray-900">Tổng ước tính</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(booking.uoc_tinh_chi_phi)} đ
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Session Info (if exists) */}
          {booking.id_phien_sac && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                Thông tin phiên sạc
              </h3>
              <div className="bg-blue-50 rounded-xl p-4 space-y-2 border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">ID Phiên sạc</span>
                  <span className="font-medium">#{booking.id_phien_sac}</span>
                </div>
                {booking.dien_nang_kwh && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Điện năng thực tế</span>
                    <span className="font-medium">{Math.round(booking.dien_nang_kwh || 0)} kWh</span>
                  </div>
                )}
                {booking.tong_tien && (
                  <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                    <span className="font-medium text-gray-900">Tổng tiền</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(booking.tong_tien)} đ
                    </span>
                  </div>
                )}
                {booking.trang_thai_thanh_toan && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Thanh toán</span>
                    <span className={`font-medium ${
                      booking.trang_thai_thanh_toan === 'success' ? 'text-green-600' :
                      booking.trang_thai_thanh_toan === 'pending' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {booking.trang_thai_thanh_toan === 'success' ? 'Thành công' :
                       booking.trang_thai_thanh_toan === 'pending' ? 'Chờ thanh toán' :
                       'Thất bại'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Đóng
          </button>
          
          <div className="flex items-center gap-3">
            {canConfirm && (
              <button
                onClick={() => onConfirm(booking.id_dat_cho)}
                className="px-6 py-2.5 text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Xác nhận đặt chỗ
              </button>
            )}
            
            {canCancel && (
              <button
                onClick={() => onCancel(booking.id_dat_cho)}
                className="px-6 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Ban className="w-4 h-4" />
                Hủy đặt chỗ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

BookingDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  booking: PropTypes.object,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

