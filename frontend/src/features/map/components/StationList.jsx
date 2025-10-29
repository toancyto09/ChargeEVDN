import { StationCard } from './StationCard';

export function StationList({
  stations,
  onStationClick,
  highlightedStationId,
  sortBy,
  onSortChange,
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header with sort */}
      <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
        <h3 className="font-semibold text-gray-900">
          Danh sách trạm ({stations.length})
        </h3>

        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="distance">Khoảng cách</option>
          <option value="price">Giá</option>
          <option value="rating">Đánh giá</option>
          <option value="availability">Trống nhất</option>
        </select>
      </div>

      {/* Station cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {stations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy trạm sạc phù hợp</p>
            <p className="text-sm text-gray-400 mt-2">
              Thử thay đổi bộ lọc hoặc mở rộng bán kính tìm kiếm
            </p>
          </div>
        ) : (
          stations.map((station) => (
            <StationCard
              key={station.id}
              station={station}
              onClick={onStationClick}
              compact
              highlighted={station.id === highlightedStationId}
            />
          ))
        )}
      </div>
    </div>
  );
}
