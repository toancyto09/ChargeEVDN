import { StationCard } from './StationCard';

export function StationList({
  stations,
  onStationClick,
  highlightedStationId,
  sortBy,
  onSortChange,
}) {
  // ✅ FIX: Sort stations before rendering
  const sortedStations = [...stations].sort((a, b) => {
    switch (sortBy) {
      case 'distance':
        return (a.distance || 0) - (b.distance || 0);
      case 'price':
        return (a.price || 0) - (b.price || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'availability':
        return (b.availableConnectors || b.cong_trong || 0) - (a.availableConnectors || a.cong_trong || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header with sort */}
      <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
        <h3 className="font-semibold text-gray-900">Danh sách trạm ({sortedStations.length})</h3>
        <select value={sortBy} onChange={e => onSortChange(e.target.value)} className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
          <option value="distance">Khoảng cách</option>
          <option value="price">Giá</option>
          <option value="rating">Đánh giá</option>
          <option value="availability">Trống nhất</option>
        </select>
      </div>
      {/* Station cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sortedStations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy trạm sạc phù hợp</p>
            <p className="text-sm text-gray-400 mt-2">Thử thay đổi bộ lọc hoặc mở rộng bán kính tìm kiếm</p>
          </div>
        ) : (
          sortedStations.map((station, idx) => (
            <StationCard
              key={station.id || station.id_tram || idx}
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
