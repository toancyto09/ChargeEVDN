import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { StationList } from '../components/StationList';
import { AIRecommendations } from '../components/AIRecommendations';
import { BottomSheet } from '../components/BottomSheet';
import LocationSourceBadge from '../components/LocationSourceBadge';
import { useGeolocation } from '../hooks/useGeolocation';
import { useResponsive } from '../../../hooks/useResponsive';
import {
  mockStations,
  filterStations,
  sortStations,
  getAIRecommendations,
} from '../data/mockStations';
import { LogIn } from 'lucide-react';

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
  const [filters, setFilters] = useState({
    status: 'all',
    connectorType: 'all',
    powerRange: 'all',
    maxPrice: 10000,
    maxDistance: 20,
    providers: [], // Array for multi-select
  });
  const [sortBy, setSortBy] = useState('distance');

  // Filtered and sorted stations
  const [displayedStations, setDisplayedStations] = useState(mockStations);
  const [aiRecommendations, setAiRecommendations] = useState([]);

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

  // Apply filters and sorting
  useEffect(() => {
    let result = mockStations;

    // Apply search
    if (searchTerm) {
      result = result.filter(
        (station) =>
          station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          station.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    result = filterStations(result, filters);

    // Apply sorting
    result = sortStations(result, sortBy);

    setDisplayedStations(result);

    // Update AI recommendations
    const recommendations = getAIRecommendations(result, {
      connectorType:
        filters.connectorType !== 'all' ? filters.connectorType : null,
    });
    setAiRecommendations(recommendations);
  }, [searchTerm, filters, sortBy]);

  const handleSearch = (query) => {
    setSearchTerm(query);
  };

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

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bản đồ...</p>
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

            {/* AI Recommendations + Station List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <AIRecommendations
                  stations={aiRecommendations}
                  onStationClick={handleStationClick}
                  isDesktop={true}
                />
              </div>

              <StationList
                stations={displayedStations}
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

          {/* Bottom Sheet */}
          <BottomSheet snapPoints={[0.15, 0.5, 0.9]}>
            <AIRecommendations
              stations={aiRecommendations}
              onStationClick={handleStationClick}
              isDesktop={false}
            />

            <StationList
              stations={displayedStations}
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
    </div>
  );
}
