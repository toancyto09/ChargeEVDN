import { useState } from 'react';
import { X, MapPin, DollarSign, Building2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ownerAPI } from '../../../../services/api';

/**
 * Add Station Modal
 * Form to create new charging station
 */
export default function AddStationModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ten_tram: '',
    dia_chi: '',
    kinh_do: '',
    vi_do: '',
    gia_kwh: '',
    phi_cho_phut: '0',
    phut_den_tre: '5',
  });
  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Get current location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt không hỗ trợ định vị');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          kinh_do: position.coords.longitude.toFixed(6),
          vi_do: position.coords.latitude.toFixed(6),
        }));
        toast.success('Đã lấy vị trí hiện tại');
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Không thể lấy vị trí hiện tại');
      }
    );
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.ten_tram.trim()) {
      newErrors.ten_tram = 'Vui lòng nhập tên trạm';
    }

    if (!formData.dia_chi.trim()) {
      newErrors.dia_chi = 'Vui lòng nhập địa chỉ';
    }

    if (!formData.kinh_do || isNaN(formData.kinh_do)) {
      newErrors.kinh_do = 'Kinh độ không hợp lệ';
    } else if (formData.kinh_do < -180 || formData.kinh_do > 180) {
      newErrors.kinh_do = 'Kinh độ phải từ -180 đến 180';
    }

    if (!formData.vi_do || isNaN(formData.vi_do)) {
      newErrors.vi_do = 'Vĩ độ không hợp lệ';
    } else if (formData.vi_do < -90 || formData.vi_do > 90) {
      newErrors.vi_do = 'Vĩ độ phải từ -90 đến 90';
    }

    if (
      !formData.gia_kwh ||
      isNaN(formData.gia_kwh) ||
      parseFloat(formData.gia_kwh) <= 0
    ) {
      newErrors.gia_kwh = 'Giá không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    setLoading(true);

    try {
      const response = await ownerAPI.createStation(formData);

      if (response.data.success) {
        toast.success('Tạo trạm thành công! Đang chờ admin phê duyệt.');
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Create station error:', error);
      toast.error(error.response?.data?.message || 'Không thể tạo trạm');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Thêm trạm sạc mới</h2>
                <p className="text-blue-100 text-sm mt-1">
                  Điền thông tin trạm sạc của bạn
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Station Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên trạm sạc <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="ten_tram"
              value={formData.ten_tram}
              onChange={handleChange}
              placeholder="VD: Trạm sạc ChargeEV Hải Châu"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.ten_tram ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.ten_tram && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.ten_tram}
              </p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ <span className="text-red-500">*</span>
            </label>
            <textarea
              name="dia_chi"
              value={formData.dia_chi}
              onChange={handleChange}
              placeholder="VD: 123 Đường ABC, Phường XYZ, Quận/Huyện, Thành phố"
              rows="3"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.dia_chi ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.dia_chi && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.dia_chi}
              </p>
            )}
          </div>

          {/* Coordinates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Tọa độ <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Lấy vị trí hiện tại
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Kinh độ (Longitude)
                </label>
                <input
                  type="number"
                  name="kinh_do"
                  value={formData.kinh_do}
                  onChange={handleChange}
                  step="0.000001"
                  placeholder="108.xxx"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.kinh_do ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.kinh_do && (
                  <p className="mt-1 text-xs text-red-600">{errors.kinh_do}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Vĩ độ (Latitude)
                </label>
                <input
                  type="number"
                  name="vi_do"
                  value={formData.vi_do}
                  onChange={handleChange}
                  step="0.000001"
                  placeholder="16.xxx"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.vi_do ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.vi_do && (
                  <p className="mt-1 text-xs text-red-600">{errors.vi_do}</p>
                )}
              </div>
            </div>

            <p className="mt-2 text-xs text-gray-500">
              💡 Tip: Bạn có thể lấy tọa độ từ Google Maps bằng cách click chuột
              phải → "Sao chép tọa độ"
            </p>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Giá dịch vụ</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá điện (đ/kWh) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="gia_kwh"
                  value={formData.gia_kwh}
                  onChange={handleChange}
                  step="100"
                  min="0"
                  placeholder="VD: 3500"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.gia_kwh ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.gia_kwh && (
                  <p className="mt-1 text-xs text-red-600">{errors.gia_kwh}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phí chờ (đ/phút)
                </label>
                <input
                  type="number"
                  name="phi_cho_phut"
                  value={formData.phi_cho_phut}
                  onChange={handleChange}
                  step="10"
                  min="0"
                  placeholder="VD: 100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Phí áp dụng khi user đỗ xe sau khi sạc xong
                </p>
              </div>
            </div>
          </div>

          {/* Late Arrival Tolerance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời gian chờ tối đa (phút)
            </label>
            <input
              type="number"
              name="phut_den_tre"
              value={formData.phut_den_tre}
              onChange={handleChange}
              min="0"
              max="60"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Số phút chờ user đến sau giờ đặt chỗ trước khi tự động hủy
            </p>
          </div>

          {/* Info Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Lưu ý quan trọng:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Trạm sạc sẽ được gửi để admin phê duyệt</li>
                  <li>Bạn cần thêm cổng sạc sau khi trạm được phê duyệt</li>
                  <li>Giá có thể thay đổi sau khi tạo trạm</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? 'Đang tạo...' : 'Tạo trạm sạc'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
