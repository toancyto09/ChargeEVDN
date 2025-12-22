import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Star, MessageSquare, User, Eye, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { ownerAPI } from '../../../../services/api';
import RatingDetailModal from '../rating/RatingDetailModal';

export default function RatingManagementTab({ stationId }) {
  const [ratings, setRatings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState(null);
  const [filters, setFilters] = useState({
    minRating: 'all'
  });

  useEffect(() => {
    loadData();
  }, [stationId, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = { station_id: stationId };
      if (filters.minRating !== 'all') params.min_rating = filters.minRating;

      const [ratingsRes, statsRes] = await Promise.all([
        ownerAPI.getRatings(params),
        ownerAPI.getRatingStats(params)
      ]);

      const ratingsData = Array.isArray(ratingsRes.data) 
        ? ratingsRes.data 
        : (ratingsRes.data?.data || []);
      const statsData = statsRes.data?.data || statsRes.data || null;
      
      setRatings(ratingsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading ratings:', error);
      toast.error('Không thể tải danh sách đánh giá');
      setRatings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (rating) => {
    setSelectedRating(rating);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
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
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Star className="w-10 h-10 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-900">
                  {stats.average_rating?.toFixed(1) || '0.0'}
                </div>
                <div className="text-sm text-yellow-700">Điểm trung bình</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-900">{stats.total_ratings || 0}</div>
            <div className="text-sm text-blue-700">Tổng đánh giá</div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-900">
              {stats.distribution?.rating_5 || 0}
            </div>
            <div className="text-sm text-green-700">5 sao</div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-purple-900">{stats.with_comment || 0}</div>
            <div className="text-sm text-purple-700">Có nhận xét</div>
          </div>
        </div>
      )}

      {/* Rating Distribution */}
      {stats && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Phân bố đánh giá
          </h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.distribution?.[`rating_${star}`] || 0;
              const percentage = stats.total_ratings > 0 
                ? (count / stats.total_ratings) * 100 
                : 0;
              
              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium text-gray-700">{star}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 w-16 text-right">
                    {count} ({percentage.toFixed(0)}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Lọc theo điểm:</label>
          <select
            value={filters.minRating}
            onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao trở lên</option>
            <option value="3">3 sao trở lên</option>
            <option value="2">2 sao trở lên</option>
            <option value="1">1 sao trở lên</option>
          </select>
        </div>
      </div>

      {/* Ratings List */}
      {ratings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có đánh giá nào</h3>
          <p className="text-gray-600">Đánh giá từ khách hàng sẽ hiển thị ở đây</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ratings.map((rating) => (
            <div
              key={rating.id_danh_gia}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
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
                    <div className="font-semibold text-gray-900">{rating.ten_nguoi_dung}</div>
                    <div className="text-sm text-gray-500">{formatDate(rating.ngay_tao)}</div>
                  </div>
                </div>
                {renderStars(rating.diem_so)}
              </div>

              {rating.nhan_xet && (
                <div className="bg-gray-50 rounded-lg p-4 mb-3">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                    <p className="text-gray-700 text-sm leading-relaxed">{rating.nhan_xet}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {rating.ma_xac_nhan && (
                    <span>Mã booking: <span className="font-medium">{rating.ma_xac_nhan}</span></span>
                  )}
                </div>
                <button
                  onClick={() => handleViewDetail(rating)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Eye className="w-4 h-4" />
                  Chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rating Detail Modal */}
      {selectedRating && (
        <RatingDetailModal
          isOpen={true}
          onClose={() => setSelectedRating(null)}
          rating={selectedRating}
        />
      )}
    </div>
  );
}

RatingManagementTab.propTypes = {
  stationId: PropTypes.number.isRequired
};
