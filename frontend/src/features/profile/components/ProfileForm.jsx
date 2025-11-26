import { useState } from 'react';
import { Save, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileForm({ profile, onUpdateSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    ho_ten: profile?.ho_ten || '',
    so_dien_thoai: profile?.so_dien_thoai || '',
    gioi_tinh: profile?.gioi_tinh || '',
    ngay_sinh: profile?.ngay_sinh || '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.ho_ten.trim()) {
      newErrors.ho_ten = 'Họ tên không được để trống';
    } else if (formData.ho_ten.length < 2) {
      newErrors.ho_ten = 'Họ tên phải có ít nhất 2 ký tự';
    }

    if (formData.so_dien_thoai && !/^[0-9]{10,11}$/.test(formData.so_dien_thoai)) {
      newErrors.so_dien_thoai = 'Số điện thoại phải có 10-11 số';
    }

    if (formData.ngay_sinh) {
      const birthDate = new Date(formData.ngay_sinh);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        newErrors.ngay_sinh = 'Bạn phải đủ 18 tuổi';
      }
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
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Cập nhật thông tin thành công!');
        onUpdateSuccess(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.message || 'Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Họ tên */}
      <div>
        <label htmlFor="ho_ten" className="block text-sm font-medium text-gray-700 mb-2">
          Họ và tên <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="ho_ten"
          name="ho_ten"
          value={formData.ho_ten}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            errors.ho_ten ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Nguyễn Văn A"
        />
        {errors.ho_ten && <p className="mt-1 text-sm text-red-500">{errors.ho_ten}</p>}
      </div>

      {/* Email (Read-only) */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={profile?.email || ''}
          disabled
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-gray-500">Email không thể thay đổi</p>
      </div>

      {/* Số điện thoại */}
      <div>
        <label htmlFor="so_dien_thoai" className="block text-sm font-medium text-gray-700 mb-2">
          Số điện thoại
        </label>
        <input
          type="tel"
          id="so_dien_thoai"
          name="so_dien_thoai"
          value={formData.so_dien_thoai}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            errors.so_dien_thoai ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="0987654321"
        />
        {errors.so_dien_thoai && <p className="mt-1 text-sm text-red-500">{errors.so_dien_thoai}</p>}
      </div>

      {/* Giới tính */}
      <div>
        <label htmlFor="gioi_tinh" className="block text-sm font-medium text-gray-700 mb-2">
          Giới tính
        </label>
        <select
          id="gioi_tinh"
          name="gioi_tinh"
          value={formData.gioi_tinh}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="">Chọn giới tính</option>
          <option value="nam">Nam</option>
          <option value="nu">Nữ</option>
          <option value="khac">Khác</option>
        </select>
      </div>

      {/* Ngày sinh */}
      <div>
        <label htmlFor="ngay_sinh" className="block text-sm font-medium text-gray-700 mb-2">
          Ngày sinh
        </label>
        <input
          type="date"
          id="ngay_sinh"
          name="ngay_sinh"
          value={formData.ngay_sinh}
          onChange={handleChange}
          max={new Date().toISOString().split('T')[0]}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            errors.ngay_sinh ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.ngay_sinh && <p className="mt-1 text-sm text-red-500">{errors.ngay_sinh}</p>}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Lưu thay đổi</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}

