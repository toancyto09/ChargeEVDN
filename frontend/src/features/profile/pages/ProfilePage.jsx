import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Edit2, Lock, ArrowLeft, Shield, Calendar, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import AvatarUpload from '../components/AvatarUpload';
import ProfileForm from '../components/ProfileForm';
import ChangePasswordModal from '../components/ChangePasswordModal';
import PageLayout from '../../../components/layout/PageLayout';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:8080/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Load profile error:', error);
      toast.error('Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSuccess = (updatedProfile) => {
    setProfile(updatedProfile);
    setIsEditing(false);
  };

  const handleAvatarUploadSuccess = (newAvatarPath) => {
    setProfile((prev) => ({ ...prev, duong_dan_anh_dai_dien: newAvatarPath }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getRoleName = (role) => {
    const roles = {
      user: 'Người dùng',
      owner: 'Chủ trạm',
      admin: 'Quản trị viên',
    };
    return roles[role] || role;
  };

  const getStatusBadge = (status) => {
    const statuses = {
      hoat_dong: { text: 'Hoạt động', class: 'bg-green-100 text-green-700' },
      khoa: { text: 'Đã khóa', class: 'bg-red-100 text-red-700' },
      cho_xac_thuc: { text: 'Chờ xác thực', class: 'bg-yellow-100 text-yellow-700' },
    };
    const statusInfo = statuses[status] || { text: status, class: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <PageLayout className="bg-gray-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Quay lại</span>
            </button>
            <h1 className="text-lg font-semibold text-gray-800">Hồ sơ cá nhân</h1>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {/* Cover Image - Subtle gradient */}
          <div className="h-32 md:h-40 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
          </div>

          {/* Profile Info */}
          <div className="px-4 md:px-8 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 -mt-16 md:-mt-20">
              {/* Left: Avatar + Info */}
              <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <AvatarUpload
                    currentAvatar={profile?.duong_dan_anh_dai_dien}
                    onUploadSuccess={handleAvatarUploadSuccess}
                    userName={profile?.ho_ten}
                  />
                </div>

                {/* Name & Info */}
                <div className="text-center md:text-left md:pb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {profile?.ho_ten}
                  </h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-medium">{getRoleName(profile?.vai_tro)}</span>
                    </div>
                    {getStatusBadge(profile?.trang_thai)}
                  </div>
                  <p className="text-gray-500 text-sm">{profile?.email}</p>
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 md:pb-2 w-full md:w-auto">
                {!isEditing && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-sm hover:shadow-md"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Chỉnh sửa</span>
                    </button>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Đổi mật khẩu</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <span>Thông tin cá nhân</span>
          </h2>

          {isEditing ? (
            <ProfileForm
              profile={profile}
              onUpdateSuccess={handleUpdateSuccess}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div className="flex items-center gap-4 p-4 md:p-5 bg-gradient-to-r from-blue-50 to-blue-50/50 rounded-xl border border-blue-100 hover:border-blue-200 transition-colors">
                <div className="p-2.5 bg-white rounded-lg shadow-sm">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-gray-900 font-medium truncate">{profile?.email}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-4 p-4 md:p-5 bg-gradient-to-r from-green-50 to-green-50/50 rounded-xl border border-green-100 hover:border-green-200 transition-colors">
                <div className="p-2.5 bg-white rounded-lg shadow-sm">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Số điện thoại</p>
                  <p className="text-gray-900 font-medium">
                    {profile?.so_dien_thoai || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>

              {/* Gender */}
              <div className="flex items-center gap-4 p-4 md:p-5 bg-gradient-to-r from-purple-50 to-purple-50/50 rounded-xl border border-purple-100 hover:border-purple-200 transition-colors">
                <div className="p-2.5 bg-white rounded-lg shadow-sm">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Giới tính</p>
                  <p className="text-gray-900 font-medium">
                    {profile?.gioi_tinh === 'nam'
                      ? 'Nam'
                      : profile?.gioi_tinh === 'nu'
                      ? 'Nữ'
                      : profile?.gioi_tinh === 'khac'
                      ? 'Khác'
                      : 'Chưa cập nhật'}
                  </p>
                </div>
              </div>

              {/* Birthday */}
              <div className="flex items-center gap-4 p-4 md:p-5 bg-gradient-to-r from-orange-50 to-orange-50/50 rounded-xl border border-orange-100 hover:border-orange-200 transition-colors">
                <div className="p-2.5 bg-white rounded-lg shadow-sm">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Ngày sinh</p>
                  <p className="text-gray-900 font-medium">{formatDate(profile?.ngay_sinh)}</p>
                </div>
              </div>

              {/* Member Since */}
              <div className="md:col-span-2 flex items-center gap-4 p-4 md:p-5 bg-gradient-to-r from-indigo-50 to-indigo-50/50 rounded-xl border border-indigo-100 hover:border-indigo-200 transition-colors">
                <div className="p-2.5 bg-white rounded-lg shadow-sm">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Thành viên từ</p>
                  <p className="text-gray-900 font-medium">{formatDate(profile?.ngay_tao)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
    </PageLayout>
  );
}

