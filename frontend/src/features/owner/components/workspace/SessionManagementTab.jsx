import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Activity, Battery, DollarSign, CheckCircle, XCircle, AlertCircle, Eye, Calendar, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { ownerAPI } from '../../../../services/api';
import SessionDetailModal from '../session/SessionDetailModal';

export default function SessionManagementTab({ stationId }) {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    date_from: '',
    date_to: ''
  });

  useEffect(() => {
    loadData();
  }, [stationId, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = { station_id: stationId };
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.date_from) params.date_from = filters.date_from;
      if (filters.date_to) params.date_to = filters.date_to;

      const [sessionsRes, statsRes] = await Promise.all([
        ownerAPI.getSessions(params),
        ownerAPI.getSessionStats(params)
      ]);

      // Handle different response structures
      const sessionsData = Array.isArray(sessionsRes.data) 
        ? sessionsRes.data 
        : (sessionsRes.data?.data || []);
      const statsData = statsRes.data?.data || statsRes.data || null;
      
      setSessions(sessionsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Không thể tải danh sách phiên sạc');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (session) => {
    setSelectedSession(session);
  };

  const formatCurrency = (value) => {
    return Math.round(value || 0).toLocaleString('vi-VN');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const statusConfig = {
    dang_sac: { label: 'Đang sạc', color: 'blue', icon: Activity },
    hoan_thanh: { label: 'Hoàn thành', color: 'green', icon: CheckCircle },
    loi: { label: 'Lỗi', color: 'red', icon: XCircle },
    huy: { label: 'Đã hủy', color: 'gray', icon: AlertCircle }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-900">{stats.by_status?.dang_sac || 0}</div>
            <div className="text-sm text-blue-700">Đang sạc</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-900">{stats.by_status?.hoan_thanh || 0}</div>
            <div className="text-sm text-green-700">Hoàn thành</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-purple-900">{Math.round(stats.total_energy || 0)} kWh</div>
            <div className="text-sm text-purple-700">Tổng điện năng</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-yellow-900">{formatCurrency(stats.total_revenue)} đ</div>
            <div className="text-sm text-yellow-700">Tổng doanh thu</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="dang_sac">Đang sạc</option>
            <option value="hoan_thanh">Hoàn thành</option>
            <option value="loi">Lỗi</option>
            <option value="huy">Đã hủy</option>
          </select>
          
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Từ ngày"
          />
          
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Đến ngày"
          />
        </div>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có phiên sạc nào</h3>
          <p className="text-gray-600">Phiên sạc sẽ hiển thị ở đây khi có khách hàng sạc</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Khách hàng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Cổng</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Thời gian</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Điện năng</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Thành tiền</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sessions.map((session) => {
                const status = statusConfig[session.trang_thai] || statusConfig.hoan_thanh;
                const StatusIcon = status.icon;
                return (
                  <tr key={session.id_phien_sac} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">#{session.id_phien_sac}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{session.ten_nguoi_dung || 'N/A'}</div>
                      <div className="text-sm text-gray-600">{session.email_nguoi_dung || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{session.ma_cong_tram || 'N/A'}</div>
                      <div className="text-xs text-gray-600">{session.loai_cong || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="text-sm text-gray-900">
                        {formatDateTime(session.thoi_gian_bat_dau)}
                      </div>
                      {session.thoi_gian_ket_thuc && (
                        <div className="text-xs text-gray-600">
                          → {formatDateTime(session.thoi_gian_ket_thuc)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-medium text-gray-900">
                        {Math.round(session.dien_nang_kwh || 0)} kWh
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-medium text-gray-900">
                        {formatCurrency(session.tong_tien)} đ
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 bg-${status.color}-100 text-${status.color}-700 rounded-full text-xs font-medium`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleViewDetail(session)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        Xem
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Session Detail Modal */}
      {selectedSession && (
        <SessionDetailModal
          isOpen={true}
          onClose={() => setSelectedSession(null)}
          session={selectedSession}
        />
      )}
    </div>
  );
}

SessionManagementTab.propTypes = {
  stationId: PropTypes.number.isRequired
};
