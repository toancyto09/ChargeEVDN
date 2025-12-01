import { useState } from 'react';
import PropTypes from 'prop-types';
import { X, Star, Send } from 'lucide-react';
import { toast } from 'sonner';
import { ratingAPI } from '../../../services/api';
import StarRating from './StarRating';

/**
 * RatingModal Component
 * Modal for submitting station rating and review
 */
export default function RatingModal({ 
  isOpen, 
  onClose, 
  booking,
  onRatingSuccess 
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá');
      return;
    }

    try {
      setLoading(true);

      const ratingData = {
        id_dat_cho: booking.id_dat_cho,
        id_tram: booking.id_tram,
        diem_so: rating,
        nhan_xet: comment.trim() || null
      };

      const response = await ratingAPI.create(ratingData);

      toast.success(response.data.message || 'Đánh giá thành công!', {
        duration: 4000
      });

      if (onRatingSuccess) {
        onRatingSuccess(response.data.data);
      }

      onClose();
    } catch (error) {
      console.error('Rating error:', error);
      toast.error(error.response?.data?.message || 'Không thể gửi đánh giá');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Đánh giá trạm sạc</h2>
            <p className="text-sm text-gray-500 mt-1">{booking.ten_tram}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Đánh giá của bạn <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <StarRating 
                value={rating} 
                onChange={setRating}
                size="lg"
              />
              <span className="text-2xl font-bold text-gray-900">
                {rating > 0 ? `${rating}.0` : '0.0'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {rating === 5 && '⭐ Xuất sắc!'}
              {rating === 4 && '👍 Rất tốt'}
              {rating === 3 && '😊 Tốt'}
              {rating === 2 && '😐 Tạm được'}
              {rating === 1 && '😞 Không hài lòng'}
              {rating === 0 && 'Chọn số sao để đánh giá'}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhận xét (không bắt buộc)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về trạm sạc này..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {comment.length}/500 ký tự
            </p>
          </div>

          {/* Booking Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Ngày sạc:</span>{' '}
              {new Date(booking.thoi_gian_bat_dau).toLocaleDateString('vi-VN')}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Giờ sạc:</span>{' '}
              {new Date(booking.thoi_gian_bat_dau).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Gửi đánh giá
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

RatingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  booking: PropTypes.object,
  onRatingSuccess: PropTypes.func
};

