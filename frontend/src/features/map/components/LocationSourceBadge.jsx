import { Satellite, Wifi, MapPin } from 'lucide-react';

/**
 * Badge hiển thị nguồn vị trí hiện tại
 * - GPS: Vị trí chính xác từ GPS chip
 * - WiFi: Vị trí ước lượng từ WiFi/Network
 * - Default: Vị trí mặc định (48 Cao Thắng)
 */
export default function LocationSourceBadge({ source, accuracy }) {
  if (!source) return null;

  const badges = {
    gps: {
      text: 'GPS',
      color: 'bg-emerald-500',
      icon: Satellite,
      tooltip: 'Vị trí GPS chính xác',
    },
    wifi: {
      text: 'WiFi',
      color: 'bg-amber-500',
      icon: Wifi,
      tooltip: 'Vị trí ước lượng từ WiFi/Network',
    },
    default: {
      text: 'Mặc định',
      color: 'bg-gray-500',
      icon: MapPin,
      tooltip: '48 Cao Thắng, Đà Nẵng',
    },
  };

  const badge = badges[source] || badges.default;
  const Icon = badge.icon;

  return (
    <div
      className={`${badge.color} text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg`}
      title={badge.tooltip}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{badge.text}</span>
      {accuracy && source !== 'default' && (
        <span className="opacity-90">
          (
          {accuracy < 1000
            ? `${Math.round(accuracy)}m`
            : `${(accuracy / 1000).toFixed(1)}km`}
          )
        </span>
      )}
    </div>
  );
}
