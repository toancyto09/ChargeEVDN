import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Zap, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ownerAPI } from '../../../../services/api';

/**
 * Add Connector Modal
 * Form to create new connector
 */
export default function AddConnectorModal({
  isOpen,
  onClose,
  onSuccess,
  station,
}) {
  const [loading, setLoading] = useState(false);
  const [connectorTypes, setConnectorTypes] = useState([]);
  const [formData, setFormData] = useState({
    ma_cong_tram: '',
    id_loai_cong: '',
    cong_suat_kwh: '',
    trang_thai: 'trong',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadConnectorTypes();
    }
  }, [isOpen]);

  const loadConnectorTypes = async () => {
    try {
      const response = await ownerAPI.getConnectorTypes();
      if (response.data.success) {
        setConnectorTypes(response.data.data);
      }
    } catch (error) {
      console.error('Load connector types error:', error);
      toast.error('Không thể tải loại cổng sạc');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.ma_cong_tram.trim()) {
      newErrors.ma_cong_tram = 'Vui lòng nhập mã cổng';
    }

    if (!formData.id_loai_cong) {
      newErrors.id_loai_cong = 'Vui lòng chọn loại cổng';
    }

    if (!formData.cong_suat_kwh || parseFloat(formData.cong_suat_kwh) <= 0) {
      newErrors.cong_suat_kwh = 'Công suất phải lớn hơn 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    setLoading(true);

    try {
      const response = await ownerAPI.createConnector(
        station.id_tram,
        formData
      );

      if (response.data.success) {
        toast.success('Thêm cổng sạc thành công');
        setFormData({
          ma_cong_tram: '',
          id_loai_cong: '',
          cong_suat_kwh: '',
          trang_thai: 'trong',
        });
        onSuccess();
      }
    } catch (error) {
      console.error('Create connector error:', error);
      toast.error(error.response?.data?.message || 'Không thể thêm cổng sạc');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !station) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Thêm cổng sạc mới</h2>
                <p className="text-purple-100 text-sm mt-1">
                  {station.ten_tram}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Connector Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã cổng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="ma_cong_tram"
              value={formData.ma_cong_tram}
              onChange={handleChange}
              placeholder="VD: C01, PORT-A1, Slot-01"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.ma_cong_tram ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.ma_cong_tram && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.ma_cong_tram}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Mã duy nhất để nhận diện cổng trong trạm
            </p>
          </div>

          {/* Connector Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại cổng <span className="text-red-500">*</span>
            </label>
            <select
              name="id_loai_cong"
              value={formData.id_loai_cong}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.id_loai_cong ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">-- Chọn loại cổng --</option>
              {connectorTypes.map((type) => (
                <option key={type.id_loai_cong} value={type.id_loai_cong}>
                  {type.ma_cong} {type.mo_ta ? `- ${type.mo_ta}` : ''}
                </option>
              ))}
            </select>
            {errors.id_loai_cong && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.id_loai_cong}
              </p>
            )}
          </div>

          {/* Power Output */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Công suất (kW) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="cong_suat_kwh"
              value={formData.cong_suat_kwh}
              onChange={handleChange}
              step="0.1"
              min="0"
              placeholder="VD: 7.4, 22, 50, 150"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.cong_suat_kwh ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.cong_suat_kwh && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.cong_suat_kwh}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Công suất tối đa của cổng sạc (kilowatt)
            </p>
          </div>

          {/* Initial Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái ban đầu
            </label>
            <select
              name="trang_thai"
              value={formData.trang_thai}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="trong">Trống (sẵn sàng sử dụng)</option>
              <option value="bao_tri">Bảo trì (chưa sẵn sàng)</option>
            </select>
          </div>

          {/* Info Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Lưu ý:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Mã cổng phải duy nhất trong trạm</li>
                  <li>Chọn loại cổng phù hợp với thiết bị</li>
                  <li>Công suất thường: 7.4kW, 22kW, 50kW, 150kW</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? 'Đang thêm...' : 'Thêm cổng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

AddConnectorModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  station: PropTypes.object,
};
