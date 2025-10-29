import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Star, Zap, Clock, DollarSign } from 'lucide-react';

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
}) {
  const icon = createCustomIcon(station.provider, isHighlighted);
  const statusInfo = getStatusInfo(station.status);

  const totalAvailable = station.connectors.reduce(
    (sum, c) => sum + c.available,
    0
  );
  const totalSlots = station.connectors.reduce((sum, c) => sum + c.total, 0);

  return (
    <Marker
      position={station.position}
      icon={icon}
      eventHandlers={{
        click: () => {
          if (onStationClick) {
            onStationClick(station);
          }
        },
      }}
    >
      <Popup>
        <div className="p-2 min-w-[280px]">
          {/* Header */}
          <div className="mb-3">
            <h3 className="font-bold text-lg mb-1">{station.name}</h3>
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="font-semibold">{station.rating}</span>
              <span className="text-gray-500">
                ({station.reviews} đánh giá)
              </span>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-2 mb-3 text-sm">
            <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-600">{station.address}</span>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between mb-3">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
            >
              {statusInfo.text}
            </span>
            <span className="text-sm text-gray-600">
              {totalAvailable}/{totalSlots} slots
            </span>
          </div>

          {/* Connectors */}
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Loại cổng sạc:</p>
            <div className="flex flex-wrap gap-2">
              {station.connectors.map((connector, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 text-xs px-2 py-1 bg-gray-50 border border-gray-200 rounded"
                >
                  <Zap size={12} className="text-emerald-600" />
                  <span className="font-medium">{connector.type}</span>
                  <span className="text-gray-500">• {connector.power}kW</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price & Hours */}
          <div className="space-y-2 mb-3 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">
                {station.price.toLocaleString('vi-VN')} đ/kWh
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-gray-600">{station.openHours}</span>
            </div>
          </div>

          {/* Distance */}
          <div className="mb-3 text-sm text-gray-600">
            📍 Cách bạn {station.distance} km
          </div>

          {/* Action Button */}
          <button
            onClick={() => onStationClick && onStationClick(station)}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-2 rounded-lg font-medium transition-all"
          >
            Xem chi tiết
          </button>
        </div>
      </Popup>
    </Marker>
  );
}
