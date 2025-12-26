import { useState } from 'react';
import PropTypes from 'prop-types';
import { X, UserPlus, Mail, Phone, User, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { adminAPI } from '../../../services/api';

export default function CreateUserModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    ho_ten: '',
    email: '',
    so_dien_thoai: '',
    vai_tro: 'user',
  });
  const [loading, setLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.ho_ten || !formData.email || !formData.vai_tro) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Email không hợp lệ');
      return;
    }

    // Phone validation (if provided)
    if (formData.so_dien_thoai) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.so_dien_thoai.replace(/\s/g, ''))) {
        toast.error('Số điện thoại phải có 10 chữ số');
        return;
      }
    }

    try {
      setLoading(true);
      const response = await adminAPI.createUser(formData);

      if (response.data.success) {
        const newUser = response.data.data;
        setTempPassword(newUser.temp_password);
        toast.success('Tạo tài khoản thành công!');
        
        // Don't close immediately if we need to show password
        if (!tempPassword) {
          // Will show password display first
        }
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.message || 'Không thể tạo tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (tempPassword) {
      // User created, reload list
      onSuccess();
    }
    setFormData({ ho_ten: '', email: '', so_dien_thoai: '', vai_tro: 'user' });
    setTempPassword(null);
    onClose();
  };

  // If password is displayed, show password screen
  if (tempPassword) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tạo tài khoản thành công!</h2>
            <p className="text-gray-600 mb-6">Mật khẩu tạm thời đã được tạo. Vui lòng gửi cho người dùng.</p>
            
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-6">
              <p className="text-sm text-gray-700 mb-3 font-medium">⚠️ MẬT KHẨU TẠM (Chỉ hiện một lần):</p>
              <div className="bg-white rounded-lg p-4 border border-yellow-300">
                <p className="text-2xl font-mono font-bold text-gray-900 select-all">{tempPassword}</p>
              </div>
              <p className="text-xs text-gray-600 mt-3">
                Người dùng cần đổi mật khẩu sau lần đăng nhập đầu tiên
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(tempPassword);
                  toast.success('Đã copy mật khẩu');
                }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                📋 Copy mật khẩu
              </button>
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tạo tài khoản mới</h2>
            <p className="text-sm text-gray-600 mt-1">Điền thông tin để tạo tài khoản cho người dùng</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Họ và tên <span className="text-red-600">*</span>
              </span>
            </label>
            <input
              type="text"
              value={formData.ho_ten}
              onChange={(e) => setFormData({ ...formData, ho_ten: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nguyễn Văn A"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email <span className="text-red-600">*</span>
              </span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="user@example.com"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Số điện thoại
              </span>
            </label>
            <input
              type="tel"
              value={formData.so_dien_thoai}
              onChange={(e) => setFormData({ ...formData, so_dien_thoai: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0123456789"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Vai trò <span className="text-red-600">*</span>
              </span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, vai_tro: 'user' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.vai_tro === 'user'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-gray-900">User</div>
                <div className="text-xs text-gray-600 mt-1">Người dùng thường</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, vai_tro: 'owner' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.vai_tro === 'owner'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-gray-900">Owner</div>
                <div className="text-xs text-gray-600 mt-1">Chủ sở hữu trạm</div>
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              ℹ️ Mật khẩu tạm thời sẽ được tự động tạo và hiển thị sau khi tạo thành công. 
              Vui lòng gửi cho người dùng qua kênh bảo mật.
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Tạo tài khoản
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

CreateUserModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
