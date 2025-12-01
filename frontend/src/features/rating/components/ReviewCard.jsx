import PropTypes from 'prop-types';
import { User } from 'lucide-react';
import StarRating from './StarRating';

/**
 * ReviewCard Component
 * Displays a single review/rating
 */
export default function ReviewCard({ review }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* User Info */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0">
          {review.duong_dan_anh_dai_dien ? (
            <img
              src={review.duong_dan_anh_dai_dien}
              alt={review.ho_ten}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-medium text-gray-900 truncate">
              {review.ho_ten}
            </h4>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {formatDate(review.ngay_tao)}
            </span>
          </div>

          <StarRating value={review.diem_so} readOnly size="sm" />
        </div>
      </div>

      {/* Comment */}
      {review.nhan_xet && (
        <p className="text-sm text-gray-700 leading-relaxed pl-13">
          {review.nhan_xet}
        </p>
      )}

      {/* Charging Date */}
      {review.ngay_sac && (
        <p className="text-xs text-gray-500 mt-2 pl-13">
          Đã sạc vào {formatDate(review.ngay_sac)}
        </p>
      )}
    </div>
  );
}

ReviewCard.propTypes = {
  review: PropTypes.shape({
    id_danh_gia: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    diem_so: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    nhan_xet: PropTypes.string,
    ngay_tao: PropTypes.string.isRequired,
    ho_ten: PropTypes.string.isRequired,
    duong_dan_anh_dai_dien: PropTypes.string,
    ngay_sac: PropTypes.string
  }).isRequired
};

