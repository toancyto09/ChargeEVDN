import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Phone, Star, Navigation as NavigationIcon, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { stationsAPI } from '../../../services/api';
import StationInfo from '../components/StationInfo';
import ConnectorList from '../components/ConnectorList';
import { openNavigation } from '../../map/utils/navigation';
import PageLayout from '../../../components/layout/PageLayout';

export default function StationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    loadStationDetail();
    getUserLocation();
  }, [id]);

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
                {station.gia_kwh?.toLocaleString('vi-VN')}
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
                {station.phi_cho_phut > 0 ? station.phi_cho_phut?.toLocaleString('vi-VN') : '0'}
              </div>
              <div className="text-xs text-gray-600 mt-1">đ/phút chờ</div>
            </div>
          </div>
        </div>

        {/* Connectors */}
        <ConnectorList connectors={station.connectors || []} />

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
              onClick={() => toast.info('Tính năng đặt chỗ đang phát triển')}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-3 sm:py-3.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95"
            >
              <Clock className="w-5 h-5" />
              <span className="text-sm sm:text-base">Đặt chỗ</span>
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

