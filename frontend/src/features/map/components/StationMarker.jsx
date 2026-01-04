import { Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { MapPin, Star, Zap, Clock, DollarSign, Route, Info, Navigation as NavigationIcon } from 'lucide-react';
import { calculateDistance, formatDistance, estimateDrivingTime, openNavigation } from '../utils/navigation';

// Create custom icon with highlight support
const createCustomIcon = (provider, isHighlighted) => {
  const providerColors = {
    VinFast: '#0066cc',
    EVN: '#e63946',
    Shell: '#ffd60a',
    ACV: '#00b4d8',
    default: '#10b981',
  };

  const color = providerColors[provider] || providerColors.default;
  const size = isHighlighted ? 50 : 40;
  const borderWidth = isHighlighted ? 4 : 3;

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: ${borderWidth}px solid ${isHighlighted ? '#fbbf24' : 'white'};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: ${isHighlighted ? 24 : 20}px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
        ${isHighlighted ? 'animation: pulse 1.5s ease-in-out infinite;' : ''}
      ">
        ⚡
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      </style>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

// Get status info
const getStatusInfo = (status) => {
  switch (status) {
    case 'available':
      return { text: 'Đang trống', color: 'text-green-600 bg-green-100' };
    case 'busy':
      return { text: 'Gần đầy', color: 'text-yellow-600 bg-yellow-100' };
    case 'maintenance':
      return { text: 'Bảo trì', color: 'text-orange-600 bg-orange-100' };
    case 'offline':
      return { text: 'Tạm đóng', color: 'text-red-600 bg-red-100' };
    default:
      return { text: 'Không xác định', color: 'text-gray-600 bg-gray-100' };
  }
};

export default function StationMarker({
  station,
  onStationClick,
  isHighlighted,
  userLocation,
  onShowRoute,
}) {
  const navigate = useNavigate();
  // Safe position check
  const position = Array.isArray(station.position) 
    ? station.position 
    : [station.vi_do || station.lat, station.kinh_do || station.lng];
  
  if (!position || !position[0] || !position[1]) {
    return null; // Skip rendering if no valid position
  }

  const icon = createCustomIcon(station.provider, isHighlighted);
  const statusInfo = getStatusInfo(station.status);

  // ALWAYS fallback connectors an toàn
  const connectors = Array.isArray(station.connectors) ? station.connectors : [];
  const totalAvailable = connectors.reduce((sum, c) => sum + (c.available || 0), 0);
  const totalSlots = connectors.reduce((sum, c) => sum + (c.total || 0), 0);

  return (
    <Marker
      position={position}
      icon={icon}
      eventHandlers={{
        click: () => {
          if (onStationClick) onStationClick(station);
        },
      }}
    >
      <Popup>
        <div className="p-3 min-w-[260px]">
          {/* Header */}
          <div className="mb-3">
            <h3 className="font-bold text-base mb-2">{station.name}</h3>
            <div className="flex items-center gap-2 text-sm mb-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="font-semibold">{station.rating}</span>
              <span className="text-gray-500">({station.reviews})</span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
            <span className="text-sm font-semibold text-gray-700">
              {totalAvailable}/{totalSlots} slots
            </span>
          </div>

          {/* Quick Info */}
          <div className="space-y-2 mb-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Giá điện</span>
              <span className="font-semibold text-emerald-600">
                {station.price ? Math.round(station.price).toLocaleString('vi-VN') : '0'} đ/kWh
              </span>
            </div>
            {userLocation && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Khoảng cách</span>
                <span className="font-semibold text-blue-600">
                  {formatDistance(calculateDistance(userLocation, { lat: position[0], lng: position[1] }))}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {/* Row 1: Navigation buttons */}
            {userLocation && (
              <div className="grid grid-cols-2 gap-2">
                {/* Show Route Button (Leaflet) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onShowRoute) {
                      onShowRoute(station);
                    }
                  }}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
                  title="Xem đường đi trên bản đồ"
                >
                  <Route className="w-4 h-4" />
                  <span>Xem đường</span>
                </button>

                {/* Navigate Button (Google Maps) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openNavigation(
                      userLocation,
                      { lat: position[0], lng: position[1] },
                      station.name
                    );
                  }}
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
                  title="Dẫn đường với Google Maps"
                >
                  <NavigationIcon className="w-4 h-4" />
                  <span>Dẫn đường</span>
                </button>
              </div>
            )}

            {/* Row 2: Details button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/stations/${station.id || station.id_tram}`);
              }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg"
            >
              <Info className="w-4 h-4" />
              <span>Xem chi tiết</span>
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
