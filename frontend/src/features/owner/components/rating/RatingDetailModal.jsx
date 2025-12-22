import PropTypes from 'prop-types';
import { X, User, MapPin, Star, MessageSquare, Calendar, FileText } from 'lucide-react';

export default function RatingDetailModal({ isOpen, onClose, rating }) {
  if (!isOpen || !rating) return null;

  const renderStars = (score) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= score ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
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
            <h2 className="text-2xl font-bold text-gray-900">Chi tiết đánh giá</h2>
            <p className="text-sm text-gray-600 mt-1">#{rating.id_danh_gia}</p>
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
          
          {/* Rating Score */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="text-5xl font-bold text-yellow-900 mb-2">
                  {rating.diem_so}
                </div>
                <div className="flex justify-center">
                  {renderStars(rating.diem_so)}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Thông tin khách hàng
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-3">
                {rating.duong_dan_anh_dai_dien ? (
                  <img
                    src={rating.duong_dan_anh_dai_dien}
                    alt={rating.ten_nguoi_dung}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{rating.ten_nguoi_dung}</p>
                  {rating.email_nguoi_dung && (
                    <p className="text-sm text-gray-600">{rating.email_nguoi_dung}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Station Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Trạm sạc
            </h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-900">{rating.ten_tram}</p>
              {rating.dia_chi_tram && (
                <p className="text-sm text-gray-600 mt-1">{rating.dia_chi_tram}</p>
              )}
            </div>
          </div>

          {/* Review Comment */}
          {rating.nhan_xet && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Nhận xét
              </h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {rating.nhan_xet}
                </p>
              </div>
            </div>
          )}

          {/* Booking Information */}
          {rating.ma_xac_nhan && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Thông tin đặt chỗ
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mã xác nhận</span>
                  <span className="font-medium text-gray-900">{rating.ma_xac_nhan}</span>
                </div>
                {rating.booking_bat_dau && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Thời gian</span>
                    <span className="font-medium text-gray-900">
                      {formatDateTime(rating.booking_bat_dau)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rating Date */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Thời gian đánh giá
            </h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-900">{formatDateTime(rating.ngay_tao)}</p>
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

RatingDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  rating: PropTypes.object,
};
