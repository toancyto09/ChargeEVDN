import { Battery, Zap, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SOCIndicator({ vehicle }) {
  const navigate = useNavigate();

  if (!vehicle) return null;

  const soc = vehicle.soc_hien_tai || 100;

  const getBatteryColor = (level) => {
    if (level >= 80) return 'text-green-600';
    if (level >= 50) return 'text-blue-600';
    if (level >= 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBatteryBg = (level) => {
    if (level >= 80) return 'from-green-500 to-green-600';
    if (level >= 50) return 'from-blue-500 to-blue-600';
    if (level >= 20) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getStatusMessage = (level) => {
    if (level >= 80) return 'Pin đầy, sẵn sàng di chuyển';
    if (level >= 50) return 'Pin ổn định';
    if (level >= 20) return 'Nên sạc sớm';
    return 'Pin thấp! Cần sạc ngay';
  };

  const isLowBattery = soc < 20;

  return (
    <div
      className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border ${
        isLowBattery ? 'border-red-300 ring-2 ring-red-200' : 'border-gray-200'
      }`}
    >
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${getBatteryBg(soc)} p-4 md:p-5`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Battery className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Mức pin</h3>
              <p className="text-white/90 text-sm">
                {vehicle.hang_xe} {vehicle.dong_xe}
              </p>
            </div>
          </div>
          {isLowBattery && (
            <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
          )}
        </div>

        {/* SOC Display */}
        <div className="text-center">
          <div className="text-5xl md:text-6xl font-bold text-white mb-2">
            {soc}%
          </div>
          {vehicle.dung_luong_pin_kwh && (
            <p className="text-white/90 text-sm">
              ~{Math.round((soc / 100) * vehicle.dung_luong_pin_kwh)} / {vehicle.dung_luong_pin_kwh} kWh
            </p>
          )}
        </div>

        {/* Battery Bar */}
        <div className="mt-4 w-full bg-white/30 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${soc}%` }}
          />
        </div>
      </div>

      {/* Body */}
      <div className="p-4 md:p-5 space-y-4">
        {/* Status Message */}
        <div className={`flex items-center gap-2 ${getBatteryColor(soc)}`}>
          <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
          <p className="text-sm font-medium">{getStatusMessage(soc)}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isLowBattery ? (
            <button
              onClick={() => navigate('/map')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              <Zap className="w-4 h-4" />
              <span>Tìm trạm sạc ngay</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/vehicles')}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Cập nhật SOC
              </button>
              <button
                onClick={() => navigate('/map')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Zap className="w-4 h-4" />
                <span>Tìm trạm sạc</span>
              </button>
            </>
          )}
        </div>

        {/* Last Update */}
        {vehicle.cap_nhat_soc && (
          <p className="text-xs text-gray-500 text-center">
            Cập nhật lúc {new Date(vehicle.cap_nhat_soc).toLocaleString('vi-VN')}
          </p>
        )}
      </div>
    </div>
  );
}

