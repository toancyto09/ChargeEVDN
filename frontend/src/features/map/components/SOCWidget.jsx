import { useState, useEffect } from 'react';
import { Battery, ChevronUp, ChevronDown, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function SOCWidget({ onSOCChange }) {
  const [mainVehicle, setMainVehicle] = useState(null);
  const [soc, setSOC] = useState(100);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    loadMainVehicle();
  }, []);

  const loadMainVehicle = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:8080/api/vehicles', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success && data.data.length > 0) {
        // Tìm xe chính hoặc lấy xe đầu tiên
        const main = data.data.find(v => v.la_xe_chinh) || data.data[0];
        setMainVehicle(main);
        setSOC(main.soc_hien_tai || 100);
        setLastUpdate(main.cap_nhat_soc);
      }
    } catch (error) {
      console.error('Failed to load main vehicle:', error);
    }
  };

  const handleSOCChange = (newSOC) => {
    setSOC(newSOC);
  };

  const handleSOCUpdate = async () => {
    if (!mainVehicle) {
      toast.error('Chưa có phương tiện nào');
      return;
    }

    if (soc === mainVehicle.soc_hien_tai) {
      return; // Không thay đổi
    }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8080/api/vehicles/${mainVehicle.id_phuong_tien}/soc`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ soc }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success('Cập nhật mức pin thành công!');
        setLastUpdate(new Date().toISOString());
        
        // Notify parent component to refresh AI recommendations
        if (onSOCChange) {
          onSOCChange(soc);
        }
        
        // Update main vehicle data
        setMainVehicle(prev => ({
          ...prev,
          soc_hien_tai: soc,
          cap_nhat_soc: new Date().toISOString(),
        }));
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Update SOC error:', error);
      toast.error('Không thể cập nhật mức pin');
      // Revert SOC
      setSOC(mainVehicle.soc_hien_tai);
    } finally {
      setIsUpdating(false);
    }
  };

  const getBatteryColor = (level) => {
    if (level >= 80) return 'text-green-600';
    if (level >= 50) return 'text-blue-600';
    if (level >= 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBatteryBg = (level) => {
    if (level >= 80) return 'bg-green-50 border-green-300';
    if (level >= 50) return 'bg-blue-50 border-blue-300';
    if (level >= 20) return 'bg-yellow-50 border-yellow-300';
    return 'bg-red-50 border-red-300';
  };

  const getBatteryGradient = (level) => {
    if (level >= 80) return 'from-green-500 to-green-600';
    if (level >= 50) return 'from-blue-500 to-blue-600';
    if (level >= 20) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return 'vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  };

  if (!mainVehicle) {
    return null; // Không hiển thị nếu chưa có xe
  }

  return (
    <div className="fixed bottom-32 sm:bottom-24 left-4 z-[999]">
      {/* Collapsed View - Circular */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="relative w-20 h-20 rounded-full hover:scale-105 transition-all duration-300 shadow-2xl"
          style={{
            background: `conic-gradient(
              ${soc >= 80 ? '#10b981' : soc >= 50 ? '#3b82f6' : soc >= 20 ? '#eab308' : '#ef4444'} ${soc * 3.6}deg,
              #e5e7eb ${soc * 3.6}deg
            )`
          }}
        >
          {/* Inner white circle */}
          <div className="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
            <Battery className={`w-6 h-6 mb-0.5 ${getBatteryColor(soc)}`} />
            <div className={`text-sm font-bold ${getBatteryColor(soc)}`}>
              {soc}%
            </div>
          </div>
        </button>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className={`bg-white rounded-2xl shadow-2xl border-2 w-80 transition-all duration-300 ${getBatteryBg(soc)} animate-scale-in`}>

          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full bg-gradient-to-br ${getBatteryGradient(soc)}`}>
                  <Battery className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Mức pin</div>
                  <div className="text-xs text-gray-500">
                    {mainVehicle.hang_xe} {mainVehicle.dong_xe}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronDown className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* SOC Display */}
            <div className="text-center">
              <div className={`text-5xl font-bold ${getBatteryColor(soc)} mb-2`}>
                {soc}%
              </div>
              {mainVehicle.dung_luong_pin_kwh && (
                <div className="text-sm text-gray-600">
                  ~{Math.round((soc / 100) * mainVehicle.dung_luong_pin_kwh)} / {mainVehicle.dung_luong_pin_kwh} kWh
                </div>
              )}
            </div>

            {/* Battery Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 bg-gradient-to-r ${getBatteryGradient(soc)}`}
                style={{ width: `${soc}%` }}
              />
            </div>

            {/* SOC Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Điều chỉnh:</span>
                <span className={`font-semibold ${getBatteryColor(soc)}`}>
                  {soc}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={soc}
                onChange={(e) => handleSOCChange(parseInt(e.target.value))}
                onMouseUp={handleSOCUpdate}
                onTouchEnd={handleSOCUpdate}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                disabled={isUpdating}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Warning for low battery */}
            {soc < 20 && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <Zap className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-xs text-red-700">
                  Pin thấp! Nên tìm trạm sạc gần nhất.
                </p>
              </div>
            )}

            {/* Last Update */}
            {lastUpdate && (
              <div className="text-xs text-gray-500 text-center">
                Cập nhật {formatTime(lastUpdate)}
              </div>
            )}

            {/* Update Button (if needed) */}
            {soc !== mainVehicle.soc_hien_tai && !isUpdating && (
              <button
                onClick={handleSOCUpdate}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Lưu thay đổi
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

