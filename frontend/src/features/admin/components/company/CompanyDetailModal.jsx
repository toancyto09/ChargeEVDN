import { useState } from 'react';
import PropTypes from 'prop-types';
import { X, Building2, User, Mail, Phone, MapPin, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { adminAPI } from '../../../../services/api';

export default function CompanyDetailModal({ isOpen, onClose, company, onSuccess }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !company) return null;

  const handleApprove = async () => {
    if (!window.confirm(`Xác nhận duyệt doanh nghiệp "${company.ten_doanh_nghiep}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await adminAPI.approveCompany(company.id_doanh_nghiep);
      toast.success('Duyệt doanh nghiệp thành công');
      onSuccess();
    } catch (error) {
      console.error('Approve error:', error);
      toast.error('Lỗi khi duyệt doanh nghiệp');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm(`Xác nhận từ chối doanh nghiệp "${company.ten_doanh_nghiep}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await adminAPI.rejectCompany(company.id_doanh_nghiep);
      toast.success('Đã từ chối doanh nghiệp');
      onSuccess();
    } catch (error) {
      console.error('Reject error:', error);
      toast.error('Lỗi khi từ chối doanh nghiệp');
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    cho_duyet: { label: 'Chờ duyệt', color: 'yellow', icon: Clock },
    da_duyet: { label: 'Đã duyệt', color: 'green', icon: CheckCircle },
    tu_choi: { label: 'Từ chối', color: 'red', icon: XCircle },
    active: { label: 'Hoạt động', color: 'green', icon: CheckCircle }
  };

  const status = statusConfig[company.trang_thai] || statusConfig.active;
  const StatusIcon = status.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Chi tiết doanh nghiệp</h2>
              <p className="text-sm text-blue-100">#{company.id_doanh_nghiep}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Status Badge */}
          <div className="flex justify-center">
            <span className={`inline-flex items-center gap-2 px-4 py-2 bg-${status.color}-100 text-${status.color}-700 rounded-full text-sm font-medium`}>
              <StatusIcon className="w-5 h-5" />
              {status.label}
            </span>
          </div>

          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 border-b pb-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Thông tin doanh nghiệp
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Tên doanh nghiệp</p>
                  <p className="font-medium text-gray-900">{company.ten_doanh_nghiep}</p>
                </div>
              </div>

              {company.dia_chi && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Địa chỉ</p>
                    <p className="font-medium text-gray-900">{company.dia_chi}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{company.email_lien_he}</p>
                </div>
              </div>

              {company.so_dien_thoai && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Số điện thoại</p>
                    <p className="font-medium text-gray-900">{company.so_dien_thoai}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Owner Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 border-b pb-2">
              <User className="w-5 h-5 text-blue-600" />
              Chủ sở hữu
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Họ tên</p>
                  <p className="font-medium text-gray-900">{company.ten_chu_so_huu || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{company.email_chu_so_huu || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Approval Actions */}
          {company.trang_thai === 'cho_duyet' && (
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={handleReject}
                disabled={loading}
                className="flex-1 px-6 py-3 border-2 border-red-500 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Từ chối
              </button>
              <button
                onClick={handleApprove}
                disabled={loading}
                className="flex-[2] px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                {loading ? 'Đang xử lý...' : 'Duyệt doanh nghiệp'}
              </button>
            </div>
          )}

          {/* Close Button */}
          {company.trang_thai !== 'cho_duyet' && (
            <div className="pt-4 border-t">
              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

CompanyDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  company: PropTypes.object,
  onSuccess: PropTypes.func.isRequired
};
