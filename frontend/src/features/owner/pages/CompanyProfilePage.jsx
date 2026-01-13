import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Edit2, ArrowLeft, Mail, Phone, MapPin, Calendar, CheckCircle, Clock, XCircle, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { ownerAPI } from '../../../services/api';
import PageLayout from '../../../components/layout/PageLayout';

export default function CompanyProfilePage() {
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    ten_doanh_nghiep: '',
    dia_chi: '',
    email_lien_he: '',
    so_dien_thoai: ''
  });

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      setLoading(true);
      const response = await ownerAPI.getCompany();
      const data = response.data.data || response.data;
      setCompany(data);
      setFormData({
        ten_doanh_nghiep: data.ten_doanh_nghiep || '',
        dia_chi: data.dia_chi || '',
        email_lien_he: data.email_lien_he || '',
        so_dien_thoai: data.so_dien_thoai || ''
      });
    } catch (error) {
      if (error.response?.status === 404) {
        toast.info('Bạn chưa có doanh nghiệp. Vui lòng liên hệ admin để tạo.');
      } else {
        toast.error('Không thể tải thông tin doanh nghiệp');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await ownerAPI.updateCompany(formData);
      
      toast.success('Cập nhật thành công! Vui lòng chờ admin duyệt.');
      setIsEditing(false);
      loadCompany();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Lỗi khi cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      ten_doanh_nghiep: company.ten_doanh_nghiep || '',
      dia_chi: company.dia_chi || '',
      email_lien_he: company.email_lien_he || '',
      so_dien_thoai: company.so_dien_thoai || ''
    });
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const statuses = {
      cho_duyet: { text: 'Chờ duyệt', class: 'bg-yellow-100 text-yellow-700', icon: Clock },
      da_duyet: { text: 'Đã duyệt', class: 'bg-green-100 text-green-700', icon: CheckCircle },
      tu_choi: { text: 'Từ chối', class: 'bg-red-100 text-red-700', icon: XCircle },
      active: { text: 'Hoạt động', class: 'bg-green-100 text-green-700', icon: CheckCircle }
    };
    const statusInfo = statuses[status] || statuses.active;
    const StatusIcon = statusInfo.icon;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${statusInfo.class}`}>
        <StatusIcon className="w-3 h-3" />
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

  if (!company) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
            <Building2 className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có doanh nghiệp</h3>
            <p className="text-gray-600 mb-4">Vui lòng liên hệ admin để được tạo hồ sơ doanh nghiệp.</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="bg-gray-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/owner/dashboard')}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Quay lại</span>
            </button>
            <h1 className="text-lg font-semibold text-gray-800">Hồ sơ Doanh nghiệp</h1>
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

          {/* Company Info */}
          <div className="px-4 md:px-8 pb-6 relative">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 -mt-16 md:-mt-20">
              {/* Left: Avatar + Info */}
              <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0 relative z-10">
                  <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-4xl md:text-5xl font-bold shadow-xl border-4 border-white">
                    {company.ten_doanh_nghiep?.charAt(0) || 'DN'}
                  </div>
                </div>

                {/* Name & Info */}
                <div className="text-center md:text-left md:pb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {company.ten_doanh_nghiep}
                  </h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full">
                      <Building2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Doanh nghiệp</span>
                    </div>
                    {getStatusBadge(company.trang_thai)}
                  </div>
                  <p className="text-gray-500 text-sm">{company.email_lien_he}</p>
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 md:pb-2 w-full md:w-auto">
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-sm hover:shadow-md"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Chỉnh sửa</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Alert if waiting approval */}
        {company.trang_thai === 'cho_duyet' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-900">Đang chờ admin duyệt</p>
              <p className="text-sm text-yellow-700">Thông tin cập nhật của bạn đang được xem xét. Vui lòng chờ.</p>
            </div>
          </div>
        )}

        {/* Company Details Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <span>Thông tin doanh nghiệp</span>
          </h2>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Company Name - Editable */}
              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <label className="text-xs text-gray-600 mb-2 block">Tên doanh nghiệp</label>
                <input
                  type="text"
                  name="ten_doanh_nghiep"
                  value={formData.ten_doanh_nghiep}
                  onChange={handleChange}
                  className="w-full text-gray-900 font-medium bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                  required
                />
              </div>

              {/* Email - Editable */}
              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <label className="text-xs text-gray-600 mb-2 block">Email liên hệ</label>
                <input
                  type="email"
                  name="email_lien_he"
                  value={formData.email_lien_he}
                  onChange={handleChange}
                  className="w-full text-gray-900 font-medium bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                  required
                />
              </div>

              {/* Phone - Editable */}
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                <label className="text-xs text-gray-600 mb-2 block">Số điện thoại</label>
                <input
                  type="tel"
                  name="so_dien_thoai"
                  value={formData.so_dien_thoai}
                  onChange={handleChange}
                  className="w-full text-gray-900 font-medium bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                />
              </div>

              {/* Address - Editable */}
              <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
                <label className="text-xs text-gray-600 mb-2 block">Địa chỉ</label>
                <textarea
                  name="dia_chi"
                  value={formData.dia_chi}
                  onChange={handleChange}
                  rows={3}
                  className="w-full text-gray-900 font-medium bg-transparent border-none focus:outline-none focus:ring-0 p-0 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div className="flex items-center gap-4 p-4 md:p-5 bg-gradient-to-r from-blue-50 to-blue-50/50 rounded-xl border border-blue-100 hover:border-blue-200 transition-colors">
                <div className="p-2.5 bg-white rounded-lg shadow-sm">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-gray-900 font-medium truncate">{company.email_lien_he}</p>
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
                    {company.so_dien_thoai || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="md:col-span-2 flex items-start gap-4 p-4 md:p-5 bg-gradient-to-r from-orange-50 to-orange-50/50 rounded-xl border border-orange-100 hover:border-orange-200 transition-colors">
                <div className="p-2.5 bg-white rounded-lg shadow-sm">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Địa chỉ</p>
                  <p className="text-gray-900 font-medium">{company.dia_chi || 'Chưa cập nhật'}</p>
                </div>
              </div>

              {/* Created Date */}
              <div className="md:col-span-2 flex items-center gap-4 p-4 md:p-5 bg-gradient-to-r from-indigo-50 to-indigo-50/50 rounded-xl border border-indigo-100 hover:border-indigo-200 transition-colors">
                <div className="p-2.5 bg-white rounded-lg shadow-sm">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Ngày tạo</p>
                  <p className="text-gray-900 font-medium">{formatDate(company.ngay_tao)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
