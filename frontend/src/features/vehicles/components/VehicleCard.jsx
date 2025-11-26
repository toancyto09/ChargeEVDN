import { Car, Battery, Zap, Star, Edit2, Trash2, Settings } from 'lucide-react';
import { useState } from 'react';

export default function VehicleCard({ vehicle, onEdit, onDelete, onUpdateSOC, onSetMain }) {
  const [showSOCSlider, setShowSOCSlider] = useState(false);
  const [soc, setSOC] = useState(vehicle.soc_hien_tai || 100);

  const getBatteryColor = (soc) => {
    if (soc >= 80) return 'text-green-600';
    if (soc >= 50) return 'text-blue-600';
    if (soc >= 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBatteryBgColor = (soc) => {
    if (soc >= 80) return 'bg-green-50 border-green-200';
    if (soc >= 50) return 'bg-blue-50 border-blue-200';
    if (soc >= 20) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const handleSOCUpdate = () => {
    onUpdateSOC(vehicle.id_phuong_tien, soc);
    setShowSOCSlider(false);
  };

  return (
    <div className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border ${vehicle.la_xe_chinh ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}>
      {/* Header with gradient */}
      <div className={`${vehicle.la_xe_chinh ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gradient-to-r from-gray-600 to-gray-700'} p-4 text-white relative`}>
        {vehicle.la_xe_chinh && (
          <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
            <Star className="w-4 h-4 fill-white" />
            <span className="text-xs font-medium">Xe chính</span>
          </div>
        )}
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">{vehicle.hang_xe}</h3>
            <p className="text-sm text-white/90">{vehicle.dong_xe || 'Không rõ dòng xe'}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          {vehicle.bien_so && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-gray-700">🚗</span>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Biển số</p>
                <p className="font-semibold text-gray-900">{vehicle.bien_so}</p>
              </div>
            </div>
          )}

          {vehicle.mau_xe && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-gray-700">🎨</span>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Màu xe</p>
                <p className="font-semibold text-gray-900">{vehicle.mau_xe}</p>
              </div>
            </div>
          )}

          {vehicle.nam_san_xuat && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-gray-700">📅</span>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Năm SX</p>
                <p className="font-semibold text-gray-900">{vehicle.nam_san_xuat}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500 text-xs">Cổng sạc</p>
              <p className="font-semibold text-gray-900">{vehicle.ma_cong}</p>
            </div>
          </div>
        </div>

        {/* Battery Info */}
        <div className={`${getBatteryBgColor(vehicle.soc_hien_tai)} border-2 rounded-xl p-3`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Battery className={`w-5 h-5 ${getBatteryColor(vehicle.soc_hien_tai)}`} />
              <span className="text-sm font-medium text-gray-700">Mức pin</span>
            </div>
            <span className={`text-2xl font-bold ${getBatteryColor(vehicle.soc_hien_tai)}`}>
              {vehicle.soc_hien_tai}%
            </span>
          </div>
          
          {/* Battery Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                vehicle.soc_hien_tai >= 80 ? 'bg-green-500' :
                vehicle.soc_hien_tai >= 50 ? 'bg-blue-500' :
                vehicle.soc_hien_tai >= 20 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${vehicle.soc_hien_tai}%` }}
            />
          </div>

          {vehicle.dung_luong_pin_kwh && (
            <p className="text-xs text-gray-600 mt-2">
              Dung lượng: {vehicle.dung_luong_pin_kwh} kWh
            </p>
          )}
        </div>

        {/* SOC Slider */}
        {showSOCSlider && (
          <div className="bg-gray-50 rounded-lg p-3 space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Cập nhật mức pin: {soc}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={soc}
              onChange={(e) => setSOC(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSOCUpdate}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Lưu
              </button>
              <button
                onClick={() => {
                  setShowSOCSlider(false);
                  setSOC(vehicle.soc_hien_tai);
                }}
                className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={() => setShowSOCSlider(!showSOCSlider)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            <Battery className="w-4 h-4" />
            <span>Cập nhật pin</span>
          </button>

          {!vehicle.la_xe_chinh && (
            <button
              onClick={() => onSetMain(vehicle.id_phuong_tien)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors text-sm font-medium"
            >
              <Star className="w-4 h-4" />
              <span>Đặt làm chính</span>
            </button>
          )}

          <button
            onClick={() => onEdit(vehicle)}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {!vehicle.la_xe_chinh && (
            <button
              onClick={() => onDelete(vehicle.id_phuong_tien)}
              className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

