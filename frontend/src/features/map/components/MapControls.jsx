import { Plus, Minus, Navigation } from 'lucide-react';
import { useMap } from 'react-leaflet';

/**
 * Map controls: Zoom (+/-) và My Location
 */
export default function MapControls({ onMyLocationClick, hasUserLocation }) {
  const map = useMap();

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-2">
      {/* My Location Button */}
      <button
        onClick={onMyLocationClick}
        disabled={!hasUserLocation}
        className={`w-10 h-10 bg-white hover:bg-gray-50 text-gray-700 rounded-lg shadow-lg flex items-center justify-center transition-all hover:scale-105 ${
          !hasUserLocation ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title="Về vị trí của tôi"
        type="button"
      >
        <Navigation className="w-4 h-4 text-emerald-600" />
      </button>

      {/* Divider */}
      <div className="h-px bg-gray-200 mx-2"></div>

      {/* Zoom In */}
      <button
        onClick={() => map.zoomIn()}
        className="w-10 h-10 bg-white hover:bg-gray-50 text-gray-700 rounded-lg shadow-lg flex items-center justify-center transition-all hover:scale-105"
        title="Phóng to"
        type="button"
      >
        <Plus className="w-4 h-4" />
      </button>

      {/* Zoom Out */}
      <button
        onClick={() => map.zoomOut()}
        className="w-10 h-10 bg-white hover:bg-gray-50 text-gray-700 rounded-lg shadow-lg flex items-center justify-center transition-all hover:scale-105"
        title="Thu nhỏ"
        type="button"
      >
        <Minus className="w-4 h-4" />
      </button>
    </div>
  );
}
