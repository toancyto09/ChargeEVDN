import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { StationList } from '../components/StationList';
import { BottomSheet } from '../components/BottomSheet';
import LocationSourceBadge from '../components/LocationSourceBadge';
import { useGeolocation } from '../hooks/useGeolocation';
import { useResponsive } from '../../../hooks/useResponsive';
import { stationsAPI, aiAPI } from '../../../services/api';
import { transformStationsArray } from '../utils/transformStationData';
import { LogIn } from 'lucide-react';
import AIRecommendFloatingTab from '../components/AIRecommendFloatingTab';

export default function MapPage() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  const { isMobile, isDesktop } = useResponsive();
  const {
    location: userLocation,
    error,
    loading,
    locationSource,
  } = useGeolocation();

  // Map state
  const [mapCenter, setMapCenter] = useState([16.0775118, 108.2127375]);
  const [highlightedStationId, setHighlightedStationId] = useState(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  // Load filters from localStorage or use defaults
  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem('mapFilters');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved filters:', e);
      }
    }
    return {
      status: 'all',
      connectorType: 'all',
      powerRange: 'all',
      maxPrice: 10000,
      maxDistance: 50, // Increased from 20km to 50km
      batteryLevel: 50,
      minRating: 0,
      providers: [],
    };
  });
  const [sortBy, setSortBy] = useState('distance');

  // Filtered and sorted stations
  const [displayedStations, setDisplayedStations] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  // Save filters to localStorage when they change
  useEffect(() => {
    localStorage.setItem('mapFilters', JSON.stringify(filters));
  }, [filters]);

  // Update map center when user location changes
  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
    }
  }, [userLocation]);

  // Show geolocation error
  useEffect(() => {
    if (error) {
      const errorMessage = typeof error === 'string' ? error : error.message;
      const errorDescription =
        typeof error === 'object' && error.details
          ? error.details
          : 'Đang sử dụng vị trí mặc định: 48 Cao Thắng, Đà Nẵng';

      toast.error(errorMessage, {
        description: errorDescription,
        duration: 5000,
      });
    }
  }, [error]);

  // Mới: Luôn fetch danh sách trạm thường cho map/lọc classic
  useEffect(() => {
    const fetchStations = async () => {
      if (!userLocation) return;
      try {
        const response = await stationsAPI.getAll({
          lat: userLocation.lat,
          lng: userLocation.lng,
          radius: filters.maxDistance,
          maxPrice: filters.maxPrice,
          minRating: filters.minRating,
          connector:
            filters.connectorType !== 'all' ? filters.connectorType : undefined,
          status: filters.status !== 'all' ? filters.status : undefined,
        });
        // ✅ FIX: Transform dữ liệu từ backend sang frontend format
        setDisplayedStations(transformStationsArray(response.data?.data || []));
      } catch (error) {
        setDisplayedStations([]);
        console.error('Failed to fetch stations:', error);
      }
    };
    fetchStations();
  }, [userLocation, filters]);

  // AI recommendations with loading & error states
  useEffect(() => {
    const fetchAIRecommendations = async () => {
      if (!userLocation) return;

      setAiLoading(true);
      setAiError(null);

      try {
        const response = await aiAPI.getRecommendations({
          lat: userLocation.lat,
          lng: userLocation.lng,
          soc: filters.batteryLevel || 50,
          maxPrice: filters.maxPrice,
          radius: filters.maxDistance,
          limit: 10,
        });
        // ✅ FIX: Transform dữ liệu AI recommendations
        setAiRecommendations(transformStationsArray(response.data?.data || []));
      } catch (err) {
        setAiError(err.response?.data?.message || 'Không thể tải đề xuất AI');
        setAiRecommendations([]);
      } finally {
        setAiLoading(false);
      }
    };

    // ✅ Debounce: Delay 500ms sau khi filters thay đổi
    const timeoutId = setTimeout(() => {
      fetchAIRecommendations();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [userLocation, filters]);

  const handleSearch = (query) => {
    setSearchTerm(query);
  };

  // Filter stations by search term
  const filteredStations = displayedStations.filter((station) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      station.name?.toLowerCase().includes(term) ||
      station.address?.toLowerCase().includes(term) ||
      station.ten_tram?.toLowerCase().includes(term) ||
      station.dia_chi?.toLowerCase().includes(term)
    );
  });

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleStationClick = (station) => {
    setMapCenter(station.position);
    setHighlightedStationId(station.id);

    // Show login prompt if not logged in
    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để xem chi tiết và đặt chỗ', {
        action: {
          label: 'Đăng nhập',
          onClick: () => navigate('/login'),
        },
        duration: 4000,
      });
      return;
    }

    toast.success(`Đã chọn: ${station.name}`);
  };

  // Handler: Về vị trí hiện tại
  const handleMyLocation = () => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
      toast.success('Đã về vị trí của bạn');
    } else {
      toast.error('Không thể xác định vị trí của bạn');
    }
  };

  if (loading || (loadingStations && displayedStations.length === 0)) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading
              ? 'Đang xác định vị trí...'
              : 'Đang tải danh sách trạm sạc...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Login Banner for non-logged in users */}
      {!isLoggedIn && (
        <div className="absolute top-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-96 z-[1000] bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogIn className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">Đăng nhập để đặt chỗ</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="bg-white text-emerald-600 px-3 py-1 rounded-md text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            Đăng nhập
          </button>
        </div>
      )}

      {/* DESKTOP LAYOUT */}
      {isDesktop && (
        <div className="flex h-full">
          {/* Sidebar - 35% */}
          <div className="w-[35%] max-w-md bg-white border-r flex flex-col">
            {/* Search Bar */}
            <div className="p-4 border-b">
              <SearchBar
                onSearch={handleSearch}
                onFilterToggle={handleFilterToggle}
                showFilters={showFilters}
              />
              {/* Location Source Badge */}
              {locationSource && (
                <div className="mt-2 flex justify-end">
                  <LocationSourceBadge
                    source={locationSource}
                    accuracy={userLocation?.accuracy}
                  />
                </div>
              )}
            </div>

            {/* Filter Panel (expandable) */}
            {showFilters && (
              <div className="border-b max-h-[40vh] overflow-y-auto">
                <FilterPanel
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onClose={() => setShowFilters(false)}
                  isDesktop={true}
                />
              </div>
            )}

            {/* Station List - AI gợi ý đã tách riêng thành floating tab */}
            <div className="flex-1 overflow-y-auto">
              <StationList
                stations={filteredStations}
                onStationClick={handleStationClick}
                highlightedStationId={highlightedStationId}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            </div>
          </div>

          {/* Map - 65% */}
          <div className="flex-1 relative">
            <MapView
              center={mapCenter}
              userLocation={userLocation}
              stations={displayedStations}
              onStationClick={handleStationClick}
              highlightedStationId={highlightedStationId}
              onMyLocationClick={handleMyLocation}
            />
          </div>
        </div>
      )}

      {/* MOBILE LAYOUT */}
      {isMobile && (
        <>
          {/* Search Bar - Floating */}
          <div className="absolute top-4 left-4 right-4 z-[1001]">
            <SearchBar
              onSearch={handleSearch}
              onFilterToggle={handleFilterToggle}
              showFilters={showFilters}
            />
            {/* Location Source Badge - Mobile */}
            {locationSource && (
              <div className="mt-2 flex justify-end">
                <LocationSourceBadge
                  source={locationSource}
                  accuracy={userLocation?.accuracy}
                />
              </div>
            )}
          </div>

          {/* Map - Full screen with relative positioning */}
          <div className="relative z-0 w-full h-full">
            <MapView
              center={mapCenter}
              userLocation={userLocation}
              stations={displayedStations}
              onStationClick={handleStationClick}
              highlightedStationId={highlightedStationId}
              onMyLocationClick={handleMyLocation}
            />
          </div>

          {/* Bottom Sheet - AI gợi ý đã tách riêng thành floating tab */}
          <BottomSheet snapPoints={[0.15, 0.5, 0.9]}>
            <StationList
              stations={filteredStations}
              onStationClick={handleStationClick}
              highlightedStationId={highlightedStationId}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </BottomSheet>

          {/* Filter Modal - Placed last to ensure highest stacking */}
          {showFilters && (
            <FilterPanel
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClose={() => setShowFilters(false)}
              isDesktop={false}
            />
          )}
        </>
      )}
      <AIRecommendFloatingTab
        recommendations={aiRecommendations}
        onStationClick={handleStationClick}
        loading={aiLoading}
        error={aiError}
      />
    </div>
  );
}
