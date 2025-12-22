import PropTypes from 'prop-types';
import { X, User, MapPin, Zap, Clock, Battery, DollarSign, Calendar } from 'lucide-react';

export default function SessionDetailModal({ isOpen, onClose, session }) {
  if (!isOpen || !session) return null;

  const formatCurrency = (value) => {
    return Math.round(value || 0).toLocaleString('vi-VN');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Chi tiết phiên sạc</h2>
            <p className="text-sm text-gray-600 mt-1">#{session.id_phien_sac}</p>
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
          
          {/* Customer Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Thông tin khách hàng
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-gray-700">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{session.ten_nguoi_dung}</span>
              </div>
              {session.email_nguoi_dung && (
                <div className="text-sm text-gray-600">{session.email_nguoi_dung}</div>
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
                <p className="font-medium text-gray-900">{session.ten_tram}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-600" />
                  <span className="font-medium">{session.ma_cong_tram}</span>
                </div>
                <div className="text-gray-600">
                  {session.loai_cong}
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          {session.hang_xe && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Battery className="w-5 h-5 text-blue-600" />
                Phương tiện
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="font-medium text-gray-900">
                  {session.hang_xe} {session.dong_xe}
                </p>
                {session.bien_so && (
                  <div className="text-sm text-gray-600">
                    Biển số: <span className="font-medium">{session.bien_so}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Session Time */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Thời gian phiên sạc
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Bắt đầu</p>
                  <p className="font-medium text-gray-900">{formatDateTime(session.thoi_gian_bat_dau)}</p>
                </div>
              </div>
              {session.thoi_gian_ket_thuc && (
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Kết thúc</p>
                    <p className="font-medium text-gray-900">{formatDateTime(session.thoi_gian_ket_thuc)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Energy & Payment */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Điện năng & Chi phí
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              {session.soc_truoc != null && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">SOC trước</span>
                  <span className="font-medium">{session.soc_truoc}%</span>
                </div>
              )}
              {session.soc_sau != null && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">SOC sau</span>
                  <span className="font-medium">{session.soc_sau}%</span>
                </div>
              )}
              {session.dien_nang_kwh != null && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Điện năng</span>
                  <span className="font-medium">{Math.round(session.dien_nang_kwh || 0)} kWh</span>
                </div>
              )}
              {session.don_gia_kwh != null && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Đơn giá</span>
                  <span className="font-medium">{formatCurrency(session.don_gia_kwh)} đ/kWh</span>
                </div>
              )}
              {session.tong_tien != null && (
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="font-medium text-gray-900">Tổng tiền</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(session.tong_tien)} đ
                  </span>
                </div>
              )}
              {session.trang_thai_thanh_toan && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Thanh toán</span>
                  <span className={`font-medium ${
                    session.trang_thai_thanh_toan === 'success' ? 'text-green-600' :
                    session.trang_thai_thanh_toan === 'pending' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {session.trang_thai_thanh_toan === 'success' ? 'Thành công' :
                     session.trang_thai_thanh_toan === 'pending' ? 'Chờ thanh toán' :
                     'Thất bại'}
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

SessionDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  session: PropTypes.object,
};
