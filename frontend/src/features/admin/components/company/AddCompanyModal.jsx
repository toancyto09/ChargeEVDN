import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Building2, User, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { adminAPI } from '../../../../services/api';

export default function AddCompanyModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [owners, setOwners] = useState([]);
  const [formData, setFormData] = useState({
    id_chu_so_huu: '',
    ten_doanh_nghiep: '',
    dia_chi: '',
    email_lien_he: '',
    so_dien_thoai: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadOwners();
    }
  }, [isOpen]);

  const loadOwners = async () => {
    try {
      const response = await adminAPI.getUsers({ vai_tro: 'chu_tram' });
      const data = response.data?.data || response.data;
      
      // Handle different response structures
      if (Array.isArray(data)) {
        setOwners(data);
      } else if (data?.users && Array.isArray(data.users)) {
        setOwners(data.users);
      } else {
        setOwners([]);
      }
    } catch (error) {
      console.error('Load owners error:', error);
      toast.error('Không thể tải danh sách chủ trạm');
      setOwners([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await adminAPI.createCompany(formData);
      
      toast.success('Tạo doanh nghiệp thành công');
      onSuccess();
    } catch (error) {
      console.error('Create company error:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi tạo doanh nghiệp');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Tạo doanh nghiệp mới</h2>
              <p className="text-sm text-blue-100">Nhập thông tin doanh nghiệp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Chủ sở hữu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chủ sở hữu <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                name="id_chu_so_huu"
                value={formData.id_chu_so_huu}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Chọn chủ trạm --</option>
                {owners.map(owner => (
                  <option key={owner.id_nguoi_dung} value={owner.id_nguoi_dung}>
                    {owner.ho_ten} ({owner.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tên doanh nghiệp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên doanh nghiệp <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="ten_doanh_nghiep"
                value={formData.ten_doanh_nghiep}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="VD: Công ty TNHH ABC"
              />
            </div>
          </div>

          {/* Địa chỉ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                name="dia_chi"
                value={formData.dia_chi}
                onChange={handleChange}
                rows={3}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Nhập địa chỉ đầy đủ"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email liên hệ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email_lien_he"
                value={formData.email_lien_he}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="contact@company.com"
              />
            </div>
          </div>

          {/* SĐT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                name="so_dien_thoai"
                value={formData.so_dien_thoai}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0123456789"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang tạo...' : 'Tạo doanh nghiệp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

AddCompanyModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
};
