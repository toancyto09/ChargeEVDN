import { MapPin, Star, Zap, DollarSign, Clock } from 'lucide-react';

export function StationCard({
  station,
  onClick,
  compact = false,
  highlighted = false,
}) {
  // ALWAYS default connectors to []
  const connectors = Array.isArray(station.connectors) ? station.connectors : [];
  const totalAvailable = connectors.reduce((sum, c) => sum + (c.available || 0), 0);
  const totalSlots = connectors.reduce((sum, c) => sum + (c.total || 0), 0);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'busy':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'maintenance':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'offline':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Đang trống';
      case 'busy':
        return 'Gần đầy';
      case 'maintenance':
        return 'Bảo trì';
      case 'offline':
        return 'Tạm đóng';
      default:
        return 'Không xác định';
    }
  };

  if (compact) {
    // Compact version for list view
    return (
      <div
        onClick={() => onClick(station)}
        className={`p-4 bg-white border rounded-lg cursor-pointer transition-all hover:shadow-md ${
          highlighted
            ? 'border-emerald-500 ring-2 ring-emerald-200'
            : 'border-gray-200'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1 truncate">
              {station.name}
            </h3>

            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <MapPin size={14} className="flex-shrink-0" />
              <span className="truncate">{station.distance || 0} km</span>
              {station.rating && (
                <>
                  <span>•</span>
                  <Star size={14} className="flex-shrink-0 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{station.rating}</span>
                  {station.totalReviews && (
                    <span className="text-gray-400">({station.totalReviews})</span>
                  )}
                </>
              )}
              <span>•</span>
              <DollarSign size={14} className="flex-shrink-0" />
              <span>{station.price ? Math.round(station.price).toLocaleString('vi-VN') : '--'}đ/kWh</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(
                  station.status
                )}`}
              >
                {getStatusText(station.status)} ({totalAvailable}/{totalSlots})
              </span>

              {connectors.map((connector, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
                >
                  {connector.type}
                </span>
              ))}
            </div>

            {/* AI Recommendation Reasons */}
            {station.reasons && station.reasons.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {station.reasons.map((reason, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-sm font-medium text-amber-600 flex-shrink-0">
            <Star size={14} fill="currentColor" />
            <span>{station.rating}</span>
          </div>
        </div>
      </div>
    );
  }

  // Full version for featured/AI recommendations
  return (
    <div
      onClick={() => onClick(station)}
      className={`bg-white border rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
        highlighted
          ? 'border-emerald-500 ring-2 ring-emerald-200'
          : 'border-gray-200'
      }`}
    >
      {/* Image placeholder */}
      <div className="h-32 bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
        <Zap size={48} className="text-emerald-600" />
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1 text-lg">
              {station.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={14} />
              <span className="truncate">{station.distance || 0} km</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-sm font-semibold text-amber-600">
            <Star size={16} fill="currentColor" />
            <span>{station.rating}</span>
            <span className="text-gray-400 text-xs">({station.reviews})</span>
          </div>
        </div>

        {/* Status & Connectors */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span
              className={`text-sm px-3 py-1 rounded-full border font-medium ${getStatusColor(
                station.status
              )}`}
            >
              {getStatusText(station.status)}
            </span>
            <span className="text-sm text-gray-600">
              {totalAvailable}/{totalSlots} slots
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {connectors.map((connector, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <Zap size={14} className="text-emerald-600" />
                <span className="font-medium">{connector.type}</span>
                <span className="text-gray-500">• {connector.power}kW</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-1.5 text-sm text-gray-700">
            <DollarSign size={16} className="text-emerald-600" />
            <span className="font-semibold">
              {station.price ? Math.round(station.price).toLocaleString('vi-VN') : '--'}đ
            </span>
            <span className="text-gray-500">/kWh</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Clock size={14} />
            <span>{station.openHours}</span>
          </div>
        </div>

        {/* AI Recommendation Reasons - Full Version */}
        {station.reasons && station.reasons.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs font-medium text-gray-700 mb-2">Lý do gợi ý:</p>
            <div className="flex flex-wrap gap-1.5">
              {station.reasons.map((reason, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full border border-emerald-200"
                >
                  {reason}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
