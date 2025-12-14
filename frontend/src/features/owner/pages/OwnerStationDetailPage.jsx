import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, MapPin, DollarSign, Zap, Users, TrendingUp, 
  Clock, CheckCircle, XCircle, AlertCircle, Edit, ArrowLeft,
  Calendar, Battery, Star, Package, Activity
} from 'lucide-react';
import { toast } from 'sonner';
import PageLayout from '../../../components/layout/PageLayout';
import { ownerAPI } from '../../../services/api';
import EditStationModal from '../components/station/EditStationModal';
import ConnectorManagementModal from '../components/connector/ConnectorManagementModal';

/**
 * Owner Station Detail Page
 * Detailed view of a station for owner with management options
 */
export default function OwnerStationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConnectorModal, setShowConnectorModal] = useState(false);

  useEffect(() => {
    loadStationDetail();
  }, [id]);

  const loadStationDetail = async () => {
    try {
      setLoading(true);
      const response = await ownerAPI.getStation(id);
      
      if (response.data.success) {
        setStation(response.data.data);
      } else {
        toast.error('Không tìm thấy trạm');
        navigate('/owner/stations');
      }
    } catch (error) {
      console.error('Load station detail error:', error);
      toast.error('Không thể tải thông tin trạm');
      navigate('/owner/stations');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: {
        icon: Clock,
        text: 'Chờ duyệt',
        className: 'bg-yellow-100 text-yellow-700 border-yellow-300'
      },
      approved: {
        icon: CheckCircle,
        text: 'Đã duyệt',
        className: 'bg-green-100 text-green-700 border-green-300'
      },
      rejected: {
        icon: XCircle,
        text: 'Từ chối',
        className: 'bg-red-100 text-red-700 border-red-300'
      }
    };

    const config = statusMap[status] || statusMap.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border-2 ${config.className}`}>
        <Icon className="w-4 h-4" />
        {config.text}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    );
  }

  if (!station) {
    return null;
  }

  const stats = station.stats || {};

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/owner/stations')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại danh sách trạm</span>
          </button>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{station.ten_tram}</h1>
                    <p className="text-gray-600 text-sm mt-1">{station.ten_doanh_nghiep}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <MapPin className="w-5 h-5" />
                  <span>{station.dia_chi}</span>
                </div>
                {getStatusBadge(station.trang_thai_duyet)}
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowConnectorModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Zap className="w-5 h-5" />
                  Quản lý cổng
                </button>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Edit className="w-5 h-5" />
                  Chỉnh sửa
                </button>
              </div>
            </div>

            {/* Rejection reason */}
            {station.trang_thai_duyet === 'rejected' && station.ly_do_tu_choi && (
              <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900 mb-1">Lý do từ chối:</h4>
                    <p className="text-red-700">{station.ly_do_tu_choi}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Connectors */}
          <StatCard
            icon={Zap}
            iconColor="text-blue-600"
            bgColor="bg-blue-100"
            title="Tổng cổng sạc"
            value={stats.connectors?.tong_cong || 0}
            subtitle={`${stats.connectors?.cong_trong || 0} còn trống`}
          />

          {/* Bookings (30 days) */}
          <StatCard
            icon={Calendar}
            iconColor="text-green-600"
            bgColor="bg-green-100"
            title="Đặt chỗ (30 ngày)"
            value={stats.bookings?.tong_dat_cho || 0}
            subtitle={`${stats.bookings?.hoan_thanh || 0} hoàn thành`}
          />

          {/* Sessions (30 days) */}
          <StatCard
            icon={Activity}
            iconColor="text-purple-600"
            bgColor="bg-purple-100"
            title="Phiên sạc (30 ngày)"
            value={stats.sessions?.tong_phien || 0}
            subtitle={`${parseFloat(stats.sessions?.tong_dien_tieu_thu || 0).toFixed(1)} kWh`}
          />

          {/* Revenue (30 days) */}
          <StatCard
            icon={DollarSign}
            iconColor="text-orange-600"
            bgColor="bg-orange-100"
            title="Doanh thu (30 ngày)"
            value={formatCurrency(stats.revenue?.doanh_thu_30_ngay || 0)}
            subtitle={`${stats.revenue?.so_giao_dich || 0} giao dịch`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Connector Status */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-blue-600" />
                Trạng thái cổng sạc
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <ConnectorStatusItem
                  icon={CheckCircle}
                  label="Còn trống"
                  value={stats.connectors?.cong_trong || 0}
                  color="text-green-600"
                  bgColor="bg-green-50"
                />
                <ConnectorStatusItem
                  icon={Battery}
                  label="Đang sạc"
                  value={stats.connectors?.cong_dang_dung || 0}
                  color="text-blue-600"
                  bgColor="bg-blue-50"
                />
                <ConnectorStatusItem
                  icon={AlertCircle}
                  label="Bảo trì"
                  value={stats.connectors?.cong_bao_tri || 0}
                  color="text-yellow-600"
                  bgColor="bg-yellow-50"
                />
              </div>
            </div>

            {/* Booking Stats */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-green-600" />
                Thống kê đặt chỗ (30 ngày)
              </h2>
              <div className="space-y-3">
                <BookingStatusRow 
                  label="Chờ xác nhận"
                  value={stats.bookings?.cho_xac_nhan || 0}
                  total={stats.bookings?.tong_dat_cho || 0}
                  color="bg-yellow-500"
                />
                <BookingStatusRow 
                  label="Đã xác nhận"
                  value={stats.bookings?.da_xac_nhan || 0}
                  total={stats.bookings?.tong_dat_cho || 0}
                  color="bg-blue-500"
                />
                <BookingStatusRow 
                  label="Hoàn thành"
                  value={stats.bookings?.hoan_thanh || 0}
                  total={stats.bookings?.tong_dat_cho || 0}
                  color="bg-green-500"
                />
                <BookingStatusRow 
                  label="Đã hủy"
                  value={stats.bookings?.da_huy || 0}
                  total={stats.bookings?.tong_dat_cho || 0}
                  color="bg-red-500"
                />
              </div>
            </div>

            {/* Ratings */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-600" />
                Đánh giá
              </h2>
              <div className="flex items-center gap-6 mb-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-900">
                    {parseFloat(stats.ratings?.diem_trung_binh || 0).toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(stats.ratings?.diem_trung_binh || 0)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {stats.ratings?.so_danh_gia || 0} đánh giá
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <RatingBar
                      key={star}
                      star={star}
                      count={stats.ratings?.[`sao_${star}`] || 0}
                      total={stats.ratings?.so_danh_gia || 0}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            {/* Pricing */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-green-600" />
                Giá hiện tại
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Giá điện</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(station.gia_kwh)}
                    <span className="text-sm font-normal text-gray-600">/kWh</span>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Phí chờ</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(station.phi_cho_phut)}
                    <span className="text-sm font-normal text-gray-600">/phút</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Station Info */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Thông tin
              </h2>
              <div className="space-y-3 text-sm">
                <InfoRow label="Ngày tạo" value={formatDate(station.ngay_tao)} />
                {station.ngay_duyet && (
                  <InfoRow label="Ngày duyệt" value={formatDate(station.ngay_duyet)} />
                )}
                {station.nguoi_duyet_ten && (
                  <InfoRow label="Người duyệt" value={station.nguoi_duyet_ten} />
                )}
                <InfoRow label="Phút đến trễ" value={`${station.phut_den_tre || 5} phút`} />
                <InfoRow 
                  label="Vị trí" 
                  value={`${station.vi_do}, ${station.kinh_do}`} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditStationModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={loadStationDetail}
        station={station}
      />

      <ConnectorManagementModal
        isOpen={showConnectorModal}
        onClose={() => setShowConnectorModal(false)}
        station={station}
      />
    </PageLayout>
  );
}

// Helper Components
function StatCard({ icon: Icon, iconColor, bgColor, title, value, subtitle }) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
      <h3 className="text-sm text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

function ConnectorStatusItem({ icon: Icon, label, value, color, bgColor }) {
  return (
    <div className={`${bgColor} rounded-lg p-4 text-center`}>
      <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-600 mt-1">{label}</div>
    </div>
  );
}

function BookingStatusRow({ label, value, total, color }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-900">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function RatingBar({ star, count, total }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 w-8">{star}⭐</span>
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div
          className="bg-yellow-400 h-2 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900 text-right">{value}</span>
    </div>
  );
}

