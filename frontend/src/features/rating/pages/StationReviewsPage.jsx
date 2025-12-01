import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, Star, ArrowLeft, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { ratingAPI, stationsAPI } from '../../../services/api';
import PageLayout from '../../../components/layout/PageLayout';
import ReviewCard from '../components/ReviewCard';
import StarRating from '../components/StarRating';

/**
 * StationReviewsPage
 * Display all reviews for a station with rating summary
 */
export default function StationReviewsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [station, setStation] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load station info and reviews in parallel
      const [stationRes, reviewsRes] = await Promise.all([
        stationsAPI.getById(id),
        ratingAPI.getStationRatings(id, { limit: 100 })
      ]);

      if (stationRes.data.success) {
        setStation(stationRes.data.data);
      }

      if (reviewsRes.data.success) {
        setReviews(reviewsRes.data.data.ratings);
        setSummary(reviewsRes.data.data.summary);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Không thể tải đánh giá');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageLayout className="bg-gray-50">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  const avgRating = parseFloat(summary?.diem_trung_binh) || 0;
  const totalReviews = parseInt(summary?.tong_danh_gia) || 0;

  // Calculate percentage for each star
  const getStarPercentage = (starCount) => {
    if (totalReviews === 0) return 0;
    const count = parseInt(summary?.[`so_${starCount}_sao`]) || 0;
    return Math.round((count / totalReviews) * 100);
  };

  return (
    <PageLayout className="bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Đánh giá trạm sạc</h1>
              {station && (
                <p className="text-blue-100 text-sm mt-1">{station.ten_tram}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Rating Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {avgRating.toFixed(1)}
              </div>
              <StarRating value={Math.round(avgRating)} readOnly size="md" />
              <p className="text-sm text-gray-600 mt-2">
                {totalReviews} đánh giá
              </p>
            </div>

            {/* Star Distribution */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const percentage = getStarPercentage(star);
                return (
                  <div key={star} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium text-gray-700">{star}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">
              Tất cả đánh giá ({totalReviews})
            </h2>
          </div>

          {reviews.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 text-lg font-medium mb-2">
                Chưa có đánh giá nào
              </p>
              <p className="text-gray-500 text-sm">
                Hãy là người đầu tiên đánh giá trạm sạc này!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <ReviewCard key={review.id_danh_gia} review={review} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

