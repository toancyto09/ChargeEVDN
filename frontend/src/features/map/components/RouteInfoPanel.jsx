import { X, MapPin, Clock, Navigation, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

/**
 * RouteInfoPanel Component
 * Displays route information (distance, duration) and action buttons
 */
export default function RouteInfoPanel({
  routeInfo,
  stationName,
  onClear,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!routeInfo) return null;

  return (
    <div className="absolute top-28 sm:top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-xl shadow-lg min-w-[280px] sm:min-w-[320px] max-w-[400px] animate-slide-down">
      {/* Compact Header - Always visible */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Navigation className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-gray-900">{routeInfo.distance}</span>
              <span className="text-xs text-gray-600">km</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-gray-900">{routeInfo.duration}</span>
              <span className="text-xs text-gray-600">phút</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
            title="Đóng"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
          <button
            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
            title={isExpanded ? "Thu gọn" : "Mở rộng"}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 overflow-hidden">
          <div className="animate-fade-in-down">
            {/* Station Name */}
            <div className="p-3 bg-gray-50">
              <p className="text-xs text-gray-500">Đến</p>
              <p className="text-sm font-medium text-gray-900 truncate">{stationName}</p>
            </div>

            {/* Actions */}
            <div className="p-3">
              <button
                onClick={onClear}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition-colors text-sm"
              >
                <X className="w-4 h-4" />
                Xóa lộ trình
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

