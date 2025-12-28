import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, ArrowLeft, RefreshCw, Search, Filter,
  Calendar, Download, Eye, User, Activity
} from 'lucide-react';
import { toast } from 'sonner';
import PageLayout from '../../../components/layout/PageLayout';
import { adminAPI } from '../../../services/api';

// Action type labels in Vietnamese
const ACTION_LABELS = {
  // Auth
  'login': '🔐 Đăng nhập',
  'logout': '🚪 Đăng xuất',
  'register': '📝 Đăng ký',
  'password_change': '🔑 Đổi mật khẩu',
  
  // User
  'user_create': '👤 Tạo người dùng',
  'user_update': '✏️ Sửa người dùng',
  'user_delete': '🗑️ Xóa người dùng',
  'user_status_change': '🔄 Đổi trạng thái user',
  'user_role_change': '🎭 Đổi vai trò',
  
  // Station
  'station_create': '🔌 Tạo trạm sạc',
  'station_approve': '✅ Duyệt trạm',
  'station_reject': '❌ Từ chối trạm',
  
  // Business
  'business_approve': '✅ Duyệt DN',
  'business_reject': '❌ Từ chối DN',
  
  // Booking
  'booking_create': '📅 Tạo đặt chỗ',
  'booking_cancel': '🚫 Hủy đặt chỗ',
  
  // Payment
  'payment_success': '💰 Thanh toán thành công',
  'payment_failed': '❌ Thanh toán thất bại',
  
  // Session
  'session_start': '⚡ Bắt đầu sạc',
  'session_end': '✅ Kết thúc sạc',
};

export default function AdminAuditLogPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 });
  const [selectedLog, setSelectedLog] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    action: '',
    search: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadLogs();
  }, [pagination.page, filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAuditLogs({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });

      setLogs(response.data?.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.data?.pagination?.total || 0,
        total_pages: response.data?.pagination?.total_pages || 0,
      }));
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast.error('Không thể tải nhật ký hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
    toast.success('Đã làm mới dữ liệu');
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  const getActionLabel = (action) => {
    return ACTION_LABELS[action] || action;
  };

  const handleExport = () => {
    toast.info('Tính năng export đang phát triển');
  };

  if (loading && logs.length === 0) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8" />
                  <h1 className="text-3xl font-bold">Nhật ký hệ thống</h1>
                </div>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>
          </div>
          <p className="text-purple-100 ml-14">Theo dõi mọi hoạt động trong hệ thống</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Action Filter */}
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Tất cả hành động</option>
              <option value="login">Đăng nhập</option>
              <option value="user_create">Tạo user</option>
              <option value="user_delete">Xóa user</option>
              <option value="station_approve">Duyệt trạm</option>
              <option value="booking_create">Đặt chỗ</option>
              <option value="payment_success">Thanh toán</option>
            </select>

            {/* Start Date */}
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />

            {/* End Date */}
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-5 focus:border-transparent"
            />
          </div>

          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Tổng: <span className="font-medium">{pagination.total}</span> bản ghi
            </p>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Thời gian</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Người dùng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Hành động</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">IP Address</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{log.user_name}</div>
                        <div className="text-xs text-gray-500">{log.user_email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {getActionLabel(log.action)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {log.details?.ip_address || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          Xem
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <span className="text-sm text-gray-700">
                Trang {pagination.page} / {pagination.total_pages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.total_pages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Chi tiết nhật ký</h2>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Thời gian</p>
                  <p className="font-medium">{formatDate(selectedLog.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Người dùng</p>
                  <p className="font-medium">{selectedLog.user_name}</p>
                  <p className="text-sm text-gray-500">{selectedLog.user_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hành động</p>
                  <p className="font-medium">{getActionLabel(selectedLog.action)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vai trò</p>
                  <p className="font-medium capitalize">{selectedLog.user_role}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">IP Address</p>
                  <p className="font-medium">{selectedLog.details?.ip_address || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 mb-2">User Agent</p>  
                  <p className="text-sm font-mono bg-gray-50 p-2 rounded">
                    {selectedLog.details?.user_agent || '-'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Chi tiết (JSON)</p>
                <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
