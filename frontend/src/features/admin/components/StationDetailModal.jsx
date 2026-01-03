import { useState } from 'react';
import PropTypes from 'prop-types';
import { X, Building2, MapPin, CheckCircle, XCircle, Clock, DollarSign, Zap, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function StationDetailModal({ isOpen, onClose, station, onApprove, onReject }) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !station) return null;

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await onApprove(station.id_tram);
      toast.success('Trạm đã được duyệt thành công!');
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    setSubmitting(true);
    try {
      await onReject(station.id_tram, rejectReason);
      toast.success('Trạm đã bị từ chối');
      setShowRejectForm(false);
      setRejectReason('');
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const statusConfig = {
    pending: { label: 'Chờ duyệt', color: 'yellow', icon: Clock },
    approved: { label: 'Đã duyệt', color: 'green', icon: CheckCircle },
    rejected: { label: 'Từ chối', color: 'red', icon: XCircle }
  };

  const config = statusConfig[station.trang_thai_duyet] || statusConfig.pending;
  const Icon = config.icon;

  const colorClasses = {
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    red: 'bg-red-100 text-red-700 border-red-200',
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Chi tiết trạm sạc</h2>
            <p className="text-sm text-gray-600 mt-1">ID: {station.id_tram}</p>
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
          <div className="flex items-center justify-center">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${colorClasses[config.color]}`}>
              <Icon className="w-4 h-4" />
              {config.label}
            </span>
          </div>

          {/* Basic Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-red-600" />
              Thông tin trạm
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div>
                <label className="text-sm text-gray-600">Tên trạm</label>
                <p className="font-medium text-gray-900">{station.ten_tram}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Địa chỉ</label>
                <p className="font-medium text-gray-900 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  {station.dia_chi}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Kinh độ</label>
                  <p className="font-medium text-gray-900">{station.kinh_do}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Vĩ độ</label>
                  <p className="font-medium text-gray-900">{station.vi_do}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Business Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-red-600" />
              Doanh nghiệp
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div>
                <label className="text-sm text-gray-600">Tên doanh nghiệp</label>
                <p className="font-medium text-gray-900">{station.ten_doanh_nghiep}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Chủ sở hữu</label>
                <p className="font-medium text-gray-900">{station.ten_chu_so_huu}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="font-medium text-gray-900">{station.email_lien_he}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Số điện thoại</label>
                  <p className="font-medium text-gray-900">{station.so_dien_thoai}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-red-600" />
              Giá cả
            </h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Giá điện</label>
                  <p className="text-lg font-bold text-gray-900">
                    {Math.round(station.gia_kwh || 0).toLocaleString('vi-VN')} đ/kWh
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Phí chờ</label>
                  <p className="text-lg font-bold text-gray-900">
                    {Math.round(station.phi_cho_phut || 0).toLocaleString('vi-VN')} đ/phút
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Connectors */}
          {station.connectors && station.connectors.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-red-600" />
                Cổng sạc ({station.connectors.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {station.connectors.map((connector, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{connector.ma_cong_tram}</span>
                      <span className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {connector.loai_cong}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Công suất: <span className="font-medium text-gray-900">{connector.cong_suat_kwh} kW</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-600" />
              Thời gian
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Ngày tạo</span>
                <span className="font-medium text-gray-900">{formatDate(station.ngay_tao)}</span>
              </div>
              {station.ngay_duyet && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày duyệt</span>
                  <span className="font-medium text-gray-900">{formatDate(station.ngay_duyet)}</span>
                </div>
              )}
              {station.ten_nguoi_duyet && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Người duyệt</span>
                  <span className="font-medium text-gray-900">{station.ten_nguoi_duyet}</span>
                </div>
              )}
            </div>
          </div>

          {/* Rejection Reason */}
          {station.trang_thai_duyet === 'rejected' && station.ly_do_tu_choi && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Lý do từ chối
              </h3>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-gray-700">{station.ly_do_tu_choi}</p>
              </div>
            </div>
          )}

          {/* Reject Form */}
          {showRejectForm && station.trang_thai_duyet === 'pending' && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Lý do từ chối</h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows="4"
                placeholder="Nhập lý do từ chối trạm này..."
              />
            </div>
          )}

        </div>

        {/* Footer - Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            disabled={submitting}
          >
            Đóng
          </button>

          {station.trang_thai_duyet === 'pending' && (
            <>
              {!showRejectForm ? (
                <>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    className="px-6 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                    disabled={submitting}
                  >
                    <XCircle className="w-4 h-4" />
                    Từ chối
                  </button>
                  <button
                    onClick={handleApprove}
                    className="px-6 py-2.5 text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                    disabled={submitting}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {submitting ? 'Đang duyệt...' : 'Duyệt trạm'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectReason('');
                    }}
                    className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    disabled={submitting}
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleReject}
                    className="px-6 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                    disabled={submitting || !rejectReason.trim()}
                  >
                    {submitting ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

StationDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  station: PropTypes.object,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
};
