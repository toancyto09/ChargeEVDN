import { Building2, ChevronDown } from 'lucide-react';
import { useOwnerStation } from '../../contexts/OwnerStationContext';

export default function StationSelector({ className = '' }) {
  const { stations, selectedStationId, setSelectedStationId, loading } = useOwnerStation();

  if (loading) {
    return (
      <div className={`flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg ${className}`}>
        <Building2 className="w-5 h-5 text-gray-400" />
        <span className="text-sm text-gray-500">Đang tải...</span>
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className={`flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
        <Building2 className="w-5 h-5 text-yellow-600" />
        <span className="text-sm text-yellow-700">Chưa có trạm nào</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <select
        value={selectedStationId || ''}
        onChange={(e) => setSelectedStationId(Number(e.target.value))}
        className="appearance-none w-full pl-10 pr-10 py-2.5 bg-white border-2 border-blue-200 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:bg-blue-50 transition-colors"
      >
        {stations.map((station) => (
          <option key={station.id_tram} value={station.id_tram}>
            {station.ten_tram}
          </option>
        ))}
      </select>
      
      {/* Icon trái */}
      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600 pointer-events-none" />
      
      {/* Icon phải */}
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600 pointer-events-none" />
    </div>
  );
}

