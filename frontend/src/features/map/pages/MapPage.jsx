import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { StationList } from '../components/StationList';
import { BottomSheet } from '../components/BottomSheet';
import LocationSourceBadge from '../components/LocationSourceBadge';
import SOCWidget from '../components/SOCWidget';
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
  
  // Routing state
  const [routeDestination, setRouteDestination] = useState(null);
  const [routeStationName, setRouteStationName] = useState('');
  const [routeInfo, setRouteInfo] = useState(null);

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
      maxDistance: 20,
    };
  });
  const [sortBy, setSortBy] = useState('distance');

  // Filtered and sorted stations
  const [displayedStations, setDisplayedStations] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  
  // SOC state for AI recommendations (separate from filters)
  const [userSOC, setUserSOC] = useState(50);

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

  // Fetch stations from API
  useEffect(() => {
    const fetchStations = async () => {
      if (!userLocation) return;

      try {
        const response = await stationsAPI.getAll({
          lat: userLocation.lat,
          lng: userLocation.lng,
          radius: filters.maxDistance,
          connector:
            filters.connectorType !== 'all' ? filters.connectorType : undefined,
          status: filters.status !== 'all' ? filters.status : undefined,
        });
        
        const transformed = transformStationsArray(response.data?.data || []);
        setDisplayedStations(transformed);
      } catch (error) {
        console.error('Failed to fetch stations:', error);
        setDisplayedStations([]);
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
          soc: userSOC, // Use user's actual SOC from SOC widget
          radius: filters.maxDistance,
          limit: 5, // Chỉ lấy top 5 trạm tốt nhất
        });
        
        const transformed = transformStationsArray(response.data?.data || []);
        setAiRecommendations(transformed);
      } catch (err) {
        console.error('Failed to fetch AI recommendations:', err);
        setAiError(err.response?.data?.message || 'Không thể tải đề xuất AI');
        setAiRecommendations([]);
      } finally {
        setAiLoading(false);
      }
    };

    // Debounce: Delay 500ms sau khi filters thay đổi
    const timeoutId = setTimeout(() => {
      fetchAIRecommendations();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [userLocation, filters.maxDistance, userSOC]); // Add userSOC dependency

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

    // Dismiss previous toasts to avoid stacking
    toast.dismiss();
    toast.success(`Đã chọn: ${station.name}`, {
      id: 'station-selected', // Use same ID to replace instead of stack
      duration: 2000
    });
  };

  // Handler: Show route on map
  const handleShowRoute = (station) => {
    if (!userLocation) {
      toast.error('Không thể xác định vị trí của bạn');
      return;
    }

    // Get station position
    const position = Array.isArray(station.position)
      ? { lat: station.position[0], lng: station.position[1] }
      : { lat: station.vi_do || station.lat, lng: station.kinh_do || station.lng };

    setRouteDestination(position);
    setRouteStationName(station.name || station.ten_tram);
    setHighlightedStationId(station.id || station.id_tram);
    toast.info('Đang tính toán lộ trình...');
  };

  // Handler: Route found callback
  const handleRouteFound = (info) => {
    setRouteInfo(info);
    toast.success(`Tìm thấy lộ trình: ${info.distance} km • ${info.duration} phút`);
  };

  // Handler: Route error callback
  const handleRouteError = (message) => {
    toast.error(message || 'Không thể tìm đường đi');
    setRouteDestination(null);
    setRouteInfo(null);
  };

  // Handler: Clear route
  const handleClearRoute = () => {
    setRouteDestination(null);
    setRouteInfo(null);
    setRouteStationName('');
    toast.info('Đã xóa lộ trình');
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
              routeDestination={routeDestination}
              routeStationName={routeStationName}
              onRouteFound={handleRouteFound}
              onRouteError={handleRouteError}
              onClearRoute={handleClearRoute}
              routeInfo={routeInfo}
              onShowRoute={handleShowRoute}
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
            
            {/* Search Results Dropdown - Mobile */}
            {searchTerm && filteredStations.length > 0 && (
              <div className="mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[60vh] overflow-y-auto">
                <div className="p-3 border-b bg-gray-50">
                  <p className="text-sm text-gray-600">
                    Tìm thấy <span className="font-semibold text-emerald-600">{filteredStations.length}</span> kết quả
                  </p>
                </div>
                <div className="divide-y">
                  {filteredStations.slice(0, 10).map((station) => (
                    <button
                      key={station.id}
                      onClick={() => {
                        handleStationClick(station);
                        setSearchTerm(''); // Clear search after selection
                      }}
                      className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="font-semibold text-gray-900 mb-1">{station.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">{station.address}</p>
                      {station.distance && (
                        <p className="text-xs text-emerald-600 mt-1">
                          📍 {station.distance} km
                        </p>
                      )}
                    </button>
                  ))}
                </div>
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
              routeDestination={routeDestination}
              routeStationName={routeStationName}
              onRouteFound={handleRouteFound}
              onRouteError={handleRouteError}
              onClearRoute={handleClearRoute}
              routeInfo={routeInfo}
              onShowRoute={handleShowRoute}
            />
          </div>

          {/* Bottom Sheet - Removed, using search dropdown instead */}
          {/* <BottomSheet snapPoints={[0.15, 0.5, 0.9]}>
            <StationList
              stations={filteredStations}
              onStationClick={handleStationClick}
              highlightedStationId={highlightedStationId}
              sortBy={sortBy}
              onSortChange={setSortBy}
              userLocation={userLocation}
            />
          </BottomSheet> */}

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
      
      {/* SOC Widget - Only show for logged in users */}
      {isLoggedIn && (
        <SOCWidget
          onSOCChange={(newSOC) => {
            setUserSOC(newSOC);
            // This will trigger AI recommendations refresh via useEffect
          }}
        />
      )}
    </div>
  );
}
