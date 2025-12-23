import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, CheckCircle, XCircle, Clock, Eye, Filter, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { adminAPI } from '../../../services/api';
import PageLayout from '../../../components/layout/PageLayout';
import StationDetailModal from '../components/StationDetailModal';

export default function StationApprovalPage() {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  const [filter, setFilter] = useState('pending'); // 'all', 'pending', 'approved', 'rejected'

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') params.status = filter;

      const [stationsRes, statsRes] = await Promise.all([
        adminAPI.getStations(params),
        adminAPI.getStationStats()
      ]);

      const stationsData = stationsRes.data?.data?.stations || stationsRes.data?.stations || [];
      const statsData = statsRes.data?.data || statsRes.data || null;

      setStations(stationsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stations:', error);
      toast.error('Không thể tải danh sách trạm');
      setStations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (station) => {
    setSelectedStation(station);
  };

  const handleApprove = async (stationId) => {
    try {
      await adminAPI.approveStation(stationId);
      toast.success('Duyệt trạm thành công');
      loadData();
      setSelectedStation(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể duyệt trạm');
    }
  };

  const handleReject = async (stationId, reason) => {
    try {
      await adminAPI.rejectStation(stationId, reason);
      toast.success('Từ chối trạm thành công');
      loadData();
      setSelectedStation(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể từ chối trạm');
    }
  };

  const statusConfig = {
    pending: { label: 'Chờ duyệt', color: 'yellow', icon: Clock },
    approved: { label: 'Đã duyệt', color: 'green', icon: CheckCircle },
    rejected: { label: 'Từ chối', color: 'red', icon: XCircle }
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    const colorClasses = {
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      red: 'bg-red-100 text-red-700 border-red-200',
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${colorClasses[config.color]}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Quản lý Trạm Sạc</h1>
            </div>
          </div>
          <p className="text-red-100 ml-14">Duyệt và quản lý các trạm sạc trong hệ thống</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.total_stations || 0}</h3>
              <p className="text-sm text-gray-600">Tổng trạm</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.by_status?.pending || 0}</h3>
              <p className="text-sm text-gray-600">Chờ duyệt</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.by_status?.approved || 0}</h3>
              <p className="text-sm text-gray-600">Đã duyệt</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.by_status?.rejected || 0}</h3>
              <p className="text-sm text-gray-600">Từ chối</p>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">Lọc theo trạng thái:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>
        </div>

        {/* Stations List */}
        {stations.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có trạm nào</h3>
            <p className="text-gray-600">Chưa có trạm sạc {filter !== 'all' ? statusConfig[filter]?.label.toLowerCase() : ''}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Trạm</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Doanh nghiệp</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Số cổng</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Ngày tạo</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stations.map((station) => (
                    <tr key={station.id_tram} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">{station.ten_tram}</div>
                          <div className="text-sm text-gray-600 line-clamp-1">{station.dia_chi}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {Math.round(station.gia_kwh || 0).toLocaleString('vi-VN')} đ/kWh
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{station.ten_doanh_nghiep}</div>
                          <div className="text-sm text-gray-600">{station.ten_chu_so_huu}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-gray-900">{station.so_cong_sac || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(station.trang_thai_duyet)}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {formatDate(station.ngay_tao)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleViewDetail(station)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Station Detail Modal */}
      {selectedStation && (
        <StationDetailModal
          isOpen={true}
          onClose={() => setSelectedStation(null)}
          station={selectedStation}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </PageLayout>
  );
}
