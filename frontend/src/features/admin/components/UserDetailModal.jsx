import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Users, Mail, Phone, Calendar, Shield, Building2, MapPin, Zap, Activity, Lock, Unlock, Trash2, Edit, Save, RefreshCw, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import { adminAPI } from '../../../services/api';

export default function UserDetailModal({ isOpen, onClose, user, onUpdateStatus, onSuccess }) {
  const [detailedUser, setDetailedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ ho_ten: '', so_dien_thoai: '' });
  const [showRoleChange, setShowRoleChange] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [tempPassword, setTempPassword] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      loadUserDetail();
    }
  }, [isOpen, user]);

  const loadUserDetail = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUserDetail(user.id_nguoi_dung);
      setDetailedUser(response.data?.data || response.data);
    } catch (error) {
      console.error('Error loading user detail:', error);
      toast.error('Không thể tải thông tin chi tiết');
      setDetailedUser(user); // Fallback to basic user data
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const displayUser = detailedUser || user;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getRoleConfig = (role) => {
    const configs = {
      user: { label: 'User', color: 'blue', description: 'Người dùng thường' },
      owner: { label: 'Owner', color: 'purple', description: 'Chủ sở hữu trạm' },
      admin: { label: 'Admin', color: 'red', description: 'Quản trị viên' }
    };
    return configs[role] || configs.user;
  };

  const getStatusConfig = (status) => {
    const configs = {
      hoat_dong: { label: 'Hoạt động', color: 'green', description: 'Tài khoản đang hoạt động bình thường' },
      khoa: { label: 'Đã khóa', color: 'red', description: 'Tài khoản đã bị khóa' },
      cho_xac_thuc: { label: 'Chờ xác thực', color: 'yellow', description: 'Đang chờ xác thực email' }
    };
    return configs[status] || configs.hoat_dong;
  };

  const roleConfig = getRoleConfig(displayUser.vai_tro);
  const statusConfig = getStatusConfig(displayUser.trang_thai);

  const handleEdit = () => {
    setEditData({
      ho_ten: displayUser.ho_ten,
      so_dien_thoai: displayUser.so_dien_thoai || ''
    });
    setEditMode(true);
  };

  const handleSaveEdit = async () => {
    try {
      await adminAPI.updateUser(displayUser.id_nguoi_dung, editData);
      toast.success('Cập nhật thông tin thành công');
      setEditMode(false);
      loadUserDetail();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật thông tin');
    }
  };

  const handleChangeRole = async () => {
    if (!selectedRole) return;
    
    try {
      await adminAPI.changeUserRole(displayUser.id_nguoi_dung, selectedRole);
      toast.success('Thay đổi vai trò thành công');
      setShowRoleChange(false);
      loadUserDetail();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể thay đổi vai trò');
    }
  };

  const handleResetPassword = async () => {
    try {
      const response = await adminAPI.resetUserPassword(displayUser.id_nguoi_dung);
      const password = response.data?.data?.temp_password;
      
      if (password) {
        setTempPassword(password);
        setShowResetConfirm(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể reset mật khẩu');
      setShowResetConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Thông tin người dùng</h2>
            <p className="text-sm text-gray-600 mt-1">ID: {displayUser.id_nguoi_dung}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Đang tải...</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Profile */}
            <div className="flex items-start gap-6">
              {displayUser.duong_dan_anh_dai_dien ? (
                <img
                  src={displayUser.duong_dan_anh_dai_dien}
                  alt={displayUser.ho_ten}
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center border-4 border-gray-300">
                  <Users className="w-12 h-12 text-gray-500" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{displayUser.ho_ten}</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1 bg-${roleConfig.color}-100 text-${roleConfig.color}-700 rounded-full text-sm font-medium flex items-center gap-1`}>
                    {displayUser.vai_tro === 'admin' && <Shield className="w-4 h-4" />}
                    {roleConfig.label}
                  </span>
                  <span className={`px-3 py-1 bg-${statusConfig.color}-100 text-${statusConfig.color}-700 rounded-full text-sm font-medium`}>
                    {statusConfig.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{roleConfig.description}</p>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Thông tin cơ bản
                </h3>
                {displayUser.vai_tro !== 'admin' && !editMode && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Chỉnh sửa
                  </button>
                )}
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="font-medium text-gray-900">{displayUser.email}</div>
                  </div>
                </div>
                
                {/* Editable Name */}
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600">Họ và tên</div>
                    {editMode ? (
                      <input
                        type="text"
                        value={editData.ho_ten}
                        onChange={(e) => setEditData({ ...editData, ho_ten: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="font-medium text-gray-900">{displayUser.ho_ten}</div>
                    )}
                  </div>
                </div>

                {/* Editable Phone */}
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600">Số điện thoại</div>
                    {editMode ? (
                      <input
                        type="tel"
                        value={editData.so_dien_thoai}
                        onChange={(e) => setEditData({ ...editData, so_dien_thoai: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0123456789"
                      />
                    ) : (
                      <div className="font-medium text-gray-900">{displayUser.so_dien_thoai || 'Chưa cập nhật'}</div>
                    )}
                  </div>
                </div>

                {editMode && (
                  <div className="flex items-center gap-2 pt-3 border-t">
                    <button
                      onClick={handleSaveEdit}
                      className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Lưu thay đổi
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Hủy
                    </button>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">Ngày tạo</div>
                    <div className="font-medium text-gray-900">{formatDate(displayUser.ngay_tao)}</div>
                  </div>
                </div>
                {displayUser.ngay_sinh && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600">Ngày sinh</div>
                      <div className="font-medium text-gray-900">
                        {new Date(displayUser.ngay_sinh).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Business Info - For Owners */}
            {displayUser.vai_tro === 'owner' && displayUser.ten_doanh_nghiep && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  Thông tin doanh nghiệp
                </h3>
                <div className="bg-purple-50 rounded-xl p-4 space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">Tên doanh nghiệp</div>
                    <div className="font-medium text-gray-900">{displayUser.ten_doanh_nghiep}</div>
                  </div>
                  {displayUser.dia_chi_doanh_nghiep && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-sm text-gray-600">Địa chỉ</div>
                        <div className="font-medium text-gray-900">{displayUser.dia_chi_doanh_nghiep}</div>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <div className="text-sm text-gray-600">Số trạm quản lý</div>
                      <div className="text-2xl font-bold text-purple-600">{displayUser.so_tram_quan_ly || 0}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stations List - For Owners */}
            {displayUser.vai_tro === 'owner' && detailedUser?.stations && detailedUser.stations.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  Trạm sạc quản lý ({detailedUser.stations.length})
                </h3>
                <div className="space-y-3">
                  {detailedUser.stations.map((station) => (
                    <div key={station.id_tram} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{station.ten_tram}</h4>
                          <p className="text-sm text-gray-600 mt-1 flex items-start gap-1">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            {station.dia_chi}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          station.trang_thai_duyet === 'approved' 
                            ? 'bg-green-100 text-green-700' 
                            : station.trang_thai_duyet === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {station.trang_thai_duyet === 'approved' && 'Đã duyệt'}
                          {station.trang_thai_duyet === 'pending' && 'Chờ duyệt'}
                          {station.trang_thai_duyet === 'rejected' && 'Từ chối'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white rounded-lg p-2 text-center">
                          <div className="text-xs text-gray-600">Số cổng</div>
                          <div className="text-lg font-bold text-gray-900">{station.so_cong_sac || 0}</div>
                        </div>
                        <div className="bg-white rounded-lg p-2 text-center">
                          <div className="text-xs text-gray-600">Còn trống</div>
                          <div className="text-lg font-bold text-green-600">{station.cong_trong || 0}</div>
                        </div>
                        <div className="bg-white rounded-lg p-2 text-center">
                          <div className="text-xs text-gray-600">Giá</div>
                          <div className="text-sm font-bold text-gray-900">
                            {Math.round(station.gia_kwh || 0).toLocaleString('vi-VN')}đ
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Stats */}
            {detailedUser && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Thống kê hoạt động
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-sm text-gray-600 mb-1">Tổng đặt chỗ</div>
                    <div className="text-2xl font-bold text-gray-900">{detailedUser.tong_dat_cho || 0}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-sm text-gray-600 mb-1">Hoàn thành</div>
                    <div className="text-2xl font-bold text-green-600">{detailedUser.dat_cho_hoan_thanh || 0}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-sm text-gray-600 mb-1">Phiên sạc</div>
                    <div className="text-2xl font-bold text-blue-600">{detailedUser.tong_phien_sac || 0}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-sm text-gray-600 mb-1">Điện tiêu thụ</div>
                    <div className="text-lg font-bold text-orange-600">
                      {parseFloat(detailedUser.tong_dien_tieu_thu || 0).toFixed(1)} kWh
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer - Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
          {displayUser.vai_tro !== 'admin' && (
            <div className="mb-4">
              {/* Change Role Section */}
              {showRoleChange ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <UserCog className="w-5 h-5 text-gray-600" />
                    <h4 className="font-medium text-gray-900">Thay đổi vai trò</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Chọn vai trò mới</option>
                      {displayUser.vai_tro !== 'user' && <option value="user">User</option>}
                      {displayUser.vai_tro !== 'owner' && <option value="owner">Owner</option>}
                    </select>
                    <button
                      onClick={handleChangeRole}
                      disabled={!selectedRole}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Xác nhận
                    </button>
                    <button
                      onClick={() => {
                        setShowRoleChange(false);
                        setSelectedRole('');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Đóng
            </button>

            <div className="flex items-center gap-3">
              {displayUser.vai_tro !== 'admin' && (
                <>
                  {/* Change Role Button */}
                  {!showRoleChange && (
                    <button
                      onClick={() => setShowRoleChange(true)}
                      className="flex items-center gap-2 px-4 py-2.5 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg font-medium transition-colors"
                    >
                      <UserCog className="w-4 h-4" />
                      Đổi vai trò
                    </button>
                  )}

                  {/* Reset Password Button */}
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2.5 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg font-medium transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset mật khẩu
                  </button>

                  {/* Lock/Unlock Button */}
                  <button
                    onClick={() => {
                      const newStatus = displayUser.trang_thai === 'khoa' ? 'hoat_dong' : 'khoa';
                      onUpdateStatus(displayUser.id_nguoi_dung, newStatus);
                    }}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                      displayUser.trang_thai === 'khoa'
                        ? 'text-white bg-green-600 hover:bg-green-700'
                        : 'text-white bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {displayUser.trang_thai === 'khoa' ? (
                      <>
                        <Unlock className="w-4 h-4" />
                        Mở khóa
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Khóa
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reset Password Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Xác nhận reset mật khẩu</h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc muốn reset mật khẩu cho <span className="font-semibold">{displayUser.ho_ten}</span>?
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleResetPassword}
                className="px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Temp Password Display Modal */}
      {tempPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset mật khẩu thành công!</h2>
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
                  onClick={() => {
                    setTempPassword(null);
                    if (onSuccess) onSuccess();
                  }}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

UserDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object,
  onUpdateStatus: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};
