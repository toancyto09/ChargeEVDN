import { Sparkles } from 'lucide-react';
import { StationCard } from './StationCard';

export function AIRecommendations({ stations, onStationClick, isDesktop }) {
  // Debug logging
  console.log('🤖 AI Recommendations:', {
    count: stations?.length || 0,
    isDesktop,
    hasStations: !!stations,
  });

  if (!stations || stations.length === 0) {
    console.warn('⚠️ No AI recommendations available');
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        <Sparkles size={24} className="mx-auto mb-2 text-gray-400" />
        <p>Không có gợi ý nào phù hợp</p>
      </div>
    );
  }

  return (
    <div className={`${isDesktop ? 'mb-6' : 'mb-4'}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 px-4 lg:px-0">
        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
          <Sparkles size={16} className="text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          AI Gợi ý cho bạn
        </h3>
      </div>

      {/* Recommendations Grid */}
      <div className={`${isDesktop ? 'space-y-3' : 'px-4 space-y-3'}`}>
        {stations.map((station, index) => (
          <div key={station.id} className="relative">
            {/* Rank Badge */}
            <div className="absolute -left-2 -top-2 z-10 w-6 h-6 bg-gradient-to-br from-amber-400 to-amber-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
              {index + 1}
            </div>

            <StationCard
              station={station}
              onClick={onStationClick}
              compact={isDesktop}
            />
          </div>
        ))}
      </div>

      {/* Info note */}
      <p className="text-xs text-gray-500 mt-3 px-4 lg:px-0">
        💡 Gợi ý dựa trên: khoảng cách, giá cả, tình trạng trống, đánh giá
      </p>
    </div>
  );
}
