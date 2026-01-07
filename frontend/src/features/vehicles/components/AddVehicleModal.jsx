import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const POPULAR_BRANDS = [
  'VinFast', 'Tesla', 'BMW', 'Mercedes-Benz', 'Audi',
  'Hyundai', 'Kia', 'Nissan', 'BYD', 'Porsche',
  'Volvo', 'Polestar', 'MG', 'Khác'
];

const POPULAR_COLORS = [
  'Trắng', 'Đen', 'Xám', 'Bạc', 'Đỏ',
  'Xanh dương', 'Xanh lá', 'Vàng', 'Nâu', 'Khác'
];

export default function AddVehicleModal({ isOpen, onClose, onSubmit, connectorTypes }) {
  const [formData, setFormData] = useState({
    id_loai_cong: '',
    hang_xe: '',
    dong_xe: '',
    bien_so: '',
    mau_xe: '',
    nam_san_xuat: new Date().getFullYear(),
    dung_luong_pin_kwh: '',
    cong_suat_sac_toi_da: '',
    soc_hien_tai: 100,
    la_xe_chinh: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.id_loai_cong) {
      toast.error('Vui lòng chọn loại cổng sạc');
      return;
    }
    if (!formData.hang_xe || formData.hang_xe.trim() === '') {
      toast.error('Vui lòng nhập hãng xe');
      return;
    }

    setLoading(true);
    try {
      // Convert empty strings to null for optional fields
      const submitData = {
        id_loai_cong: parseInt(formData.id_loai_cong),
        hang_xe: formData.hang_xe.trim(),
        dong_xe: formData.dong_xe && formData.dong_xe.trim() !== '' ? formData.dong_xe.trim() : null,
        bien_so: formData.bien_so && formData.bien_so.trim() !== '' ? formData.bien_so.trim() : null,
        mau_xe: formData.mau_xe && formData.mau_xe.trim() !== '' ? formData.mau_xe.trim() : null,
        nam_san_xuat: formData.nam_san_xuat ? parseInt(formData.nam_san_xuat) : null,
        dung_luong_pin_kwh: formData.dung_luong_pin_kwh ? parseFloat(formData.dung_luong_pin_kwh) : null,
        cong_suat_sac_toi_da: formData.cong_suat_sac_toi_da ? parseFloat(formData.cong_suat_sac_toi_da) : null,
        soc_hien_tai: parseInt(formData.soc_hien_tai),
        la_xe_chinh: formData.la_xe_chinh,
      };

      console.log('Submitting vehicle data:', submitData);
      await onSubmit(submitData);
      
      // Reset form
      setFormData({
        id_loai_cong: '',
        hang_xe: '',
        dong_xe: '',
        bien_so: '',
        mau_xe: '',
        nam_san_xuat: new Date().getFullYear(),
        dung_luong_pin_kwh: '',
        cong_suat_sac_toi_da: '',
        soc_hien_tai: 100,
        la_xe_chinh: false,
      });
      
      onClose();
    } catch (error) {
      console.error('Add vehicle error:', error);
      // Error đã được handle trong VehiclesPage, không cần toast ở đây
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Thêm phương tiện mới</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Loại cổng sạc */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại cổng sạc <span className="text-red-500">*</span>
            </label>
            <select
              name="id_loai_cong"
              value={formData.id_loai_cong}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Chọn loại cổng sạc --</option>
              {connectorTypes.map(connector => (
                <option 
                  key={connector.id_loai_cong} 
                  value={connector.id_loai_cong}
                  title={connector.mo_ta}
                >
                  {connector.ma_cong}
                </option>
              ))}
            </select>
            {/* Hiển thị mô tả đầy đủ bên dưới */}
            {formData.id_loai_cong && (
              <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                <span className="font-medium">Mô tả:</span> {connectorTypes.find(c => c.id_loai_cong === parseInt(formData.id_loai_cong))?.mo_ta}
              </div>
            )}
          </div>

          {/* Hãng xe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hãng xe <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="hang_xe"
              value={formData.hang_xe}
              onChange={handleChange}
              list="brands"
              required
              placeholder="VD: VinFast, Tesla, BMW..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <datalist id="brands">
              {POPULAR_BRANDS.map(brand => (
                <option key={brand} value={brand} />
              ))}
            </datalist>
          </div>

          {/* Dòng xe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dòng xe
            </label>
            <input
              type="text"
              name="dong_xe"
              value={formData.dong_xe}
              onChange={handleChange}
              placeholder="VD: VF e34, Model 3, i4..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Grid 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Biển số */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biển số
              </label>
              <input
                type="text"
                name="bien_so"
                value={formData.bien_so}
                onChange={handleChange}
                placeholder="VD: 51F-12345"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Màu xe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Màu xe
              </label>
              <input
                type="text"
                name="mau_xe"
                value={formData.mau_xe}
                onChange={handleChange}
                list="colors"
                placeholder="VD: Trắng, Đen..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <datalist id="colors">
                {POPULAR_COLORS.map(color => (
                  <option key={color} value={color} />
                ))}
              </datalist>
            </div>

            {/* Năm sản xuất */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Năm sản xuất
              </label>
              <input
                type="number"
                name="nam_san_xuat"
                value={formData.nam_san_xuat}
                onChange={handleChange}
                min="1990"
                max={new Date().getFullYear() + 1}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Dung lượng pin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dung lượng pin (kWh)
              </label>
              <input
                type="number"
                name="dung_luong_pin_kwh"
                value={formData.dung_luong_pin_kwh}
                onChange={handleChange}
                min="10"
                max="200"
                step="0.1"
                placeholder="VD: 42.0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Công suất sạc tối đa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Công suất sạc tối đa (kW)
              </label>
              <input
                type="number"
                name="cong_suat_sac_toi_da"
                value={formData.cong_suat_sac_toi_da}
                onChange={handleChange}
                min="3"
                max="350"
                step="0.1"
                placeholder="VD: 50.0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* SOC hiện tại */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mức pin hiện tại (%)
              </label>
              <input
                type="number"
                name="soc_hien_tai"
                value={formData.soc_hien_tai}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Đặt làm xe chính */}
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
            <input
              type="checkbox"
              id="la_xe_chinh"
              name="la_xe_chinh"
              checked={formData.la_xe_chinh}
              onChange={handleChange}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="la_xe_chinh" className="text-sm font-medium text-gray-700 cursor-pointer">
              Đặt làm xe chính (xe mặc định để đặt chỗ sạc)
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang thêm...' : 'Thêm phương tiện'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

