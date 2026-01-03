import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Plus, Edit, Trash2, MapPin, DollarSign, 
  Zap, TrendingUp, Clock, AlertCircle, CheckCircle, XCircle,
  Eye, QrCode
} from 'lucide-react';
import { toast } from 'sonner';
import PageLayout from '../../../components/layout/PageLayout';
import { ownerAPI } from '../../../services/api';
import AddStationModal from '../components/station/AddStationModal';
import EditStationModal from '../components/station/EditStationModal';
import ConnectorManagementModal from '../components/connector/ConnectorManagementModal';
import QRCodeModal from '../components/station/QRCodeModal';
import { useConfirm } from '../../../components/common/ConfirmDialog';

/**
 * Owner Stations Page
 * Manage charging stations for business owners
 */
export default function OwnerStationsPage() {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConnectorModal, setShowConnectorModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const { confirm } = useConfirm();

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      setLoading(true);
      const response = await ownerAPI.getStations();
      
      if (response.data.success) {
        setStations(response.data.data);
      }
    } catch (error) {
      console.error('Load stations error:', error);
      toast.error('Không thể tải danh sách trạm');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (stationId, stationName) => {
    const confirmed = await confirm({
      title: 'Xóa trạm sạc',
      message: `Bạn có chắc muốn xóa trạm "${stationName}"? Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      const response = await ownerAPI.deleteStation(stationId);
      
      if (response.data.success) {
        toast.success('Xóa trạm thành công');
        loadStations();
      }
    } catch (error) {
      console.error('Delete station error:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa trạm');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: {
        icon: Clock,
        text: 'Chờ duyệt',
        className: 'bg-yellow-100 text-yellow-700 border-yellow-200'
      },
      approved: {
        icon: CheckCircle,
        text: 'Đã duyệt',
        className: 'bg-green-100 text-green-700 border-green-200'
      },
      rejected: {
        icon: XCircle,
        text: 'Từ chối',
        className: 'bg-red-100 text-red-700 border-red-200'
      }
    };

    const config = statusMap[status] || statusMap.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <PageLayout showBack onBack={() => navigate('/owner/dashboard')}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Quản lý trạm sạc"
      showBack 
      onBack={() => navigate('/owner/dashboard')}
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Trạm sạc của tôi</h1>
            <p className="text-gray-600 mt-1">{stations.length} trạm</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Thêm trạm mới
          </button>
        </div>

        {/* Stations List */}
        {stations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có trạm sạc nào
            </h3>
            <p className="text-gray-600 mb-6">
              Bắt đầu bằng cách thêm trạm sạc đầu tiên của bạn
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Thêm trạm mới
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stations.map((station) => (
              <StationCard
                key={station.id_tram}
                station={station}
                onEdit={() => {
                  setSelectedStation(station);
                  setShowEditModal(true);
                }}
                onDelete={() => handleDelete(station.id_tram, station.ten_tram)}
                onView={() => navigate(`/owner/stations/${station.id_tram}`)}
                onManageConnectors={() => {
                  setSelectedStation(station);
                  setShowConnectorModal(true);
                }}
                onShowQR={() => {
                  setSelectedStation(station);
                  setShowQRModal(true);
                }}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddStationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={loadStations}
      />

      <EditStationModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedStation(null);
        }}
        onSuccess={loadStations}
        station={selectedStation}
      />

      <ConnectorManagementModal
        isOpen={showConnectorModal}
        onClose={() => {
          setShowConnectorModal(false);
          setSelectedStation(null);
        }}
        station={selectedStation}
      />

      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => {
          setShowQRModal(false);
          setSelectedStation(null);
        }}
        station={selectedStation}
      />
    </PageLayout>
  );
}

/**
 * Station Card Component
 */
function StationCard({ station, onEdit, onDelete, onView, onManageConnectors, onShowQR, getStatusBadge }) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {station.ten_tram}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{station.dia_chi}</span>
          </div>
          {getStatusBadge(station.trang_thai_duyet)}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <Zap className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">{station.tong_cong || 0}</p>
          <p className="text-xs text-gray-600">Tổng cổng</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">{station.cong_trong || 0}</p>
          <p className="text-xs text-gray-600">Còn trống</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <TrendingUp className="w-5 h-5 text-purple-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">
            {parseFloat(station.diem_trung_binh || 0).toFixed(1)}
          </p>
          <p className="text-xs text-gray-600">Đánh giá</p>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-center gap-2 text-sm text-gray-700 mb-4 p-3 bg-gray-50 rounded-lg">
        <DollarSign className="w-4 h-4 text-gray-500" />
        <span className="font-semibold">
          {parseFloat(station.gia_kwh || 0).toLocaleString('vi-VN')} đ/kWh
        </span>
      </div>

      {/* Rejected Reason */}
      {station.trang_thai_duyet === 'rejected' && station.ly_do_tu_choi && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-700">
            <p className="font-semibold mb-1">Lý do từ chối:</p>
            <p>{station.ly_do_tu_choi}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2">
        {/* First row - Manage Connectors & QR Code */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onManageConnectors}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all shadow-md"
          >
            <Zap className="w-4 h-4" />
            Quản lý cổng
          </button>
          
          <button
            onClick={onShowQR}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-medium transition-all shadow-md"
          >
            <QrCode className="w-4 h-4" />
            QR Code
          </button>
        </div>

        {/* Second row - View, Edit, Delete */}
        <div className="flex items-center gap-2">
          <button
            onClick={onView}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            <Eye className="w-4 h-4" />
            Xem
          </button>
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Edit className="w-4 h-4" />
            Sửa
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

