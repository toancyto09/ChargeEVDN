import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Phone, Star, Navigation as NavigationIcon, Share2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { stationsAPI, vehiclesAPI, ratingAPI } from '../../../services/api';
import StationInfo from '../components/StationInfo';
import ConnectorList from '../components/ConnectorList';
import { openNavigation } from '../../map/utils/navigation';
import PageLayout from '../../../components/layout/PageLayout';
import BookingModal from '../../booking/components/BookingModal';
import ConnectorSelectionModal from '../../booking/components/ConnectorSelectionModal';
import ReviewCard from '../../rating/components/ReviewCard';
import StarRating from '../../rating/components/StarRating';

export default function StationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showConnectorSelection, setShowConnectorSelection] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState(null);
  const [mainVehicle, setMainVehicle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingsSummary, setRatingsSummary] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    loadStationDetail();
    getUserLocation();
    loadMainVehicle();
    loadReviews();
  }, [id]);

  const loadMainVehicle = async () => {
    try {
      const response = await vehiclesAPI.getAll();
      if (response.data.success && response.data.data.length > 0) {
        // Get the main vehicle or first vehicle
        const mainVeh = response.data.data.find(v => v.la_xe_chinh) || response.data.data[0];
        setMainVehicle(mainVeh);
      }
    } catch (error) {
      console.error('Error loading vehicle:', error);
    }
  };

  const loadReviews = async () => {
    try {
      setLoadingReviews(true);
      const response = await ratingAPI.getStationRatings(id, { limit: 3 });
      
      if (response.data.success) {
        setReviews(response.data.data.ratings || []);
        setRatingsSummary(response.data.data.summary || null);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const loadStationDetail = async () => {
    try {
      setLoading(true);
      const response = await stationsAPI.getStationDetail(id);
      
      if (response.data.success) {
        setStation(response.data.data);
      } else {
        toast.error('Không thể tải thông tin trạm sạc');
        navigate('/map');
      }
    } catch (error) {
      console.error('Error loading station:', error);
      toast.error('Có lỗi xảy ra khi tải thông tin trạm sạc');
      navigate('/map');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = () => {
    if (!userLocation) {
      toast.error('Không thể xác định vị trí của bạn');
      return;
    }

    openNavigation(
      userLocation,
      { lat: parseFloat(station.vi_do), lng: parseFloat(station.kinh_do) },
      station.ten_tram
    );
  };

  const handleShare = async () => {
    const shareData = {
      title: station.ten_tram,
      text: `Trạm sạc: ${station.ten_tram}\n${station.dia_chi}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Share canceled');
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã copy link!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!station) {
    return null;
  }

  const totalConnectors = station.connectors?.reduce((sum, c) => sum + (parseInt(c.tong_cong) || 0), 0) || 0;
  const availableConnectors = station.connectors?.reduce((sum, c) => sum + (parseInt(c.cong_trong) || 0), 0) || 0;
  const availabilityRatio = totalConnectors > 0 ? (availableConnectors / totalConnectors) * 100 : 0;

  return (
    <PageLayout hasBottomActions className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                {station.ten_tram}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 fill-amber-500" />
                  <span className="text-xs sm:text-sm font-semibold text-gray-700">
                    {parseFloat(station.diem_trung_binh || 0).toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({station.so_danh_gia || 0})
                  </span>
                </div>
                <span className="text-gray-300">•</span>
                <span className={`text-xs font-medium ${
                  availabilityRatio > 50 ? 'text-green-600' : availabilityRatio > 20 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {availableConnectors}/{totalConnectors} trống
                </span>
              </div>
            </div>
            <button
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-4 sm:py-6 space-y-4">
        {/* Hero Card - Location & Quick Stats */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 sm:p-6">
            <div className="flex items-start gap-3 text-white">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium opacity-90 mb-1">Địa chỉ</p>
                <p className="text-sm sm:text-base font-semibold leading-relaxed">
                  {station.dia_chi}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 bg-gray-50/50">
            <div className="text-center p-3 bg-white rounded-xl border border-gray-100">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600">
                {Math.round(station.gia_kwh || 0).toLocaleString('vi-VN')}
              </div>
              <div className="text-xs text-gray-600 mt-1">đ/kWh</div>
            </div>
            <div className="text-center p-3 bg-white rounded-xl border border-gray-100">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                {totalConnectors}
              </div>
              <div className="text-xs text-gray-600 mt-1">Tổng cổng</div>
            </div>
            <div className="text-center p-3 bg-white rounded-xl border border-gray-100">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">
                {availableConnectors}
              </div>
              <div className="text-xs text-gray-600 mt-1">Đang trống</div>
            </div>
            <div className="text-center p-3 bg-white rounded-xl border border-gray-100">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                {station.phi_cho_phut > 0 ? Math.round(station.phi_cho_phut).toLocaleString('vi-VN') : '0'}
              </div>
              <div className="text-xs text-gray-600 mt-1">đ/phút chờ</div>
            </div>
          </div>
        </div>

        {/* Connectors */}
        <ConnectorList connectors={station.connectors || []} />

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 sm:p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Đánh giá từ người dùng
                </h2>
                {ratingsSummary && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                      <span className="text-2xl font-bold text-gray-900">
                        {parseFloat(ratingsSummary.diem_trung_binh || 0).toFixed(1)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {ratingsSummary.tong_danh_gia || 0} đánh giá
                    </div>
                  </div>
                )}
              </div>
              {reviews.length > 0 && (
                <button
                  onClick={() => navigate(`/stations/${id}/reviews`)}
                  className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <span>Xem tất cả</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Reviews List */}
          <div className="p-4 sm:p-6">
            {loadingReviews ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Đang tải đánh giá...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 font-medium mb-2">
                  Chưa có đánh giá nào
                </p>
                <p className="text-sm text-gray-500">
                  Hãy là người đầu tiên đánh giá trạm sạc này!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <ReviewCard key={review.id_danh_gia} review={review} />
                ))}
                
                {parseInt(ratingsSummary?.tong_danh_gia || 0) > 3 && (
                  <button
                    onClick={() => navigate(`/stations/${id}/reviews`)}
                    className="w-full py-3 text-center text-blue-600 hover:text-blue-700 font-medium text-sm border-t border-gray-100 hover:bg-blue-50 transition-colors rounded-b-xl"
                  >
                    Xem thêm {parseInt(ratingsSummary.tong_danh_gia) - 3} đánh giá khác →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <StationInfo station={station} />
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-16 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-2xl z-[999]">
        <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex gap-2 sm:gap-3">
            {userLocation && (
              <button
                onClick={handleNavigate}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 sm:py-3.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95"
              >
                <NavigationIcon className="w-5 h-5" />
                <span className="text-sm sm:text-base">Chỉ đường</span>
              </button>
            )}
            <button
              onClick={() => {
                if (!mainVehicle) {
                  toast.error('Vui lòng thêm phương tiện trước');
                  setTimeout(() => navigate('/vehicles'), 1000);
                  return;
                }
                
                // Check if station has connectors
                if (!station.connectors || station.connectors.length === 0) {
                  toast.error('Trạm này chưa có cổng sạc nào');
                  return;
                }
                
                // Check if there's ANY available connector (regardless of type)
                const hasAnyAvailable = station.connectors.some(c => parseInt(c.cong_trong) > 0);
                
                if (!hasAnyAvailable) {
                  toast.error('Tất cả cổng sạc đang được sử dụng. Vui lòng thử lại sau.', { duration: 4000 });
                  return;
                }
                
                // Open connector selection modal
                setShowConnectorSelection(true);
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-3 sm:py-3.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95"
            >
              <Clock className="w-5 h-5" />
              <span className="text-sm sm:text-base">Đặt chỗ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Connector Selection Modal */}
      <ConnectorSelectionModal
        isOpen={showConnectorSelection}
        onClose={() => setShowConnectorSelection(false)}
        connectors={station?.connectors || []}
        vehicleConnectorType={mainVehicle?.ma_cong}
        onSelectConnector={(connector) => {
          setSelectedConnector(connector);
          setShowConnectorSelection(false);
          setShowBookingModal(true);
        }}
      />

      {/* Booking Modal */}
      {showBookingModal && selectedConnector && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedConnector(null);
          }}
          station={station}
          connector={selectedConnector}
          vehicle={mainVehicle}
        />
      )}
    </PageLayout>
  );
}

