import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Zap, ArrowLeft, Battery, Clock, DollarSign, 
  MapPin, AlertCircle, CreditCard, StopCircle 
} from 'lucide-react';
import { sessionAPI, paymentAPI } from '../../../services/api';
import PageLayout from '../../../components/layout/PageLayout';

/**
 * ActiveSessionPage
 * Real-time monitoring of an active charging session
 */
export default function ActiveSessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stopping, setStopping] = useState(false);
  const [duration, setDuration] = useState('');
  const [showStopModal, setShowStopModal] = useState(false);
  
  // Form data for stopping session
  const [stopData, setStopData] = useState({
    dien_nang_kwh: '',
    soc_truoc: '',
    soc_sau: '',
  });

  // Load session data
  useEffect(() => {
    if (id) {
      loadSession();
      // Refresh every 10 seconds
      const interval = setInterval(loadSession, 10000);
      return () => clearInterval(interval);
    }
  }, [id]);

  // Calculate real-time duration
  useEffect(() => {
    if (!session || session.trang_thai !== 'dang_sac' || !session.thoi_gian_bat_dau) return;

    const updateDuration = () => {
      const start = new Date(session.thoi_gian_bat_dau);
      const now = new Date();
      const diff = now - start;

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setDuration(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateDuration();
    const interval = setInterval(updateDuration, 1000);

    return () => clearInterval(interval);
  }, [session]);

  const loadSession = async () => {
    try {
      const response = await sessionAPI.getById(id);
      if (response.data.success) {
        setSession(response.data.data);
      }
    } catch (error) {
      console.error('Load session error:', error);
      toast.error(error.response?.data?.message || 'Không thể tải thông tin phiên sạc');
    } finally {
      setLoading(false);
    }
  };

  const handleStopSession = async () => {
    // Validation
    if (!stopData.dien_nang_kwh || parseFloat(stopData.dien_nang_kwh) <= 0) {
      toast.error('Vui lòng nhập điện năng tiêu thụ');
      return;
    }

    if (stopData.soc_truoc && (stopData.soc_truoc < 0 || stopData.soc_truoc > 100)) {
      toast.error('SOC trước phải trong khoảng 0-100');
      return;
    }

    if (stopData.soc_sau && (stopData.soc_sau < 0 || stopData.soc_sau > 100)) {
      toast.error('SOC sau phải trong khoảng 0-100');
      return;
    }

    if (stopData.soc_truoc && stopData.soc_sau && parseFloat(stopData.soc_sau) <= parseFloat(stopData.soc_truoc)) {
      toast.error('SOC sau phải lớn hơn SOC trước');
      return;
    }

    setStopping(true);

    try {
      const response = await sessionAPI.finish(id, {
        dien_nang_kwh: parseFloat(stopData.dien_nang_kwh),
        soc_truoc: stopData.soc_truoc ? parseInt(stopData.soc_truoc) : null,
        soc_sau: stopData.soc_sau ? parseInt(stopData.soc_sau) : null,
      });

      if (response.data.success) {
        toast.success('Kết thúc sạc thành công!');
        setShowStopModal(false);
        
        // Reload session
        await loadSession();
        
        // Redirect to payment after 1 second
        setTimeout(() => {
          const sessionId = response.data.data.id_phien_sac;
          // Create payment from session
          handlePayment(sessionId);
        }, 1000);
      }
    } catch (error) {
      console.error('Stop session error:', error);
      toast.error(error.response?.data?.message || 'Không thể kết thúc phiên sạc');
    } finally {
      setStopping(false);
    }
  };

  const handlePayment = async (sessionId) => {
    try {
      // Call payment API with sessionId
      const response = await paymentAPI.create({ sessionId });
      
      if (response.data.success && response.data.data.paymentUrl) {
        toast.success('Đang chuyển đến trang thanh toán...');
        // Redirect to VNPay
        setTimeout(() => {
          window.location.href = response.data.data.paymentUrl;
        }, 500);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Không thể tạo thanh toán. Vui lòng thử lại sau.');
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <PageLayout title="Phiên sạc">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!session) {
    return (
      <PageLayout title="Phiên sạc">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Không tìm thấy phiên sạc
          </h2>
          <button
            onClick={() => navigate('/bookings')}
            className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            Quay lại danh sách
          </button>
        </div>
      </PageLayout>
    );
  }

  const isActive = session.trang_thai === 'dang_sac';
  const isCompleted = session.trang_thai === 'hoan_thanh';

  return (
    <PageLayout 
      title={isActive ? "⚡ Đang sạc" : "Phiên sạc"}
      showBack
      onBack={() => navigate('/sessions')}
    >
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        
        {/* Station Info */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">{session.ten_tram || 'Trạm sạc'}</h2>
          <p className="flex items-center gap-2 text-green-100">
            <MapPin className="w-4 h-4" />
            {session.dia_chi || 'N/A'}
          </p>
        </div>

        {/* Active Session - Live Duration */}
        {isActive && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Thời gian sạc</p>
              <div className="text-6xl font-bold text-green-600 font-mono tabular-nums mb-4">
                {duration}
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 animate-pulse"></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Đang sạc...</p>
            </div>
          </div>
        )}

        {/* Session Details */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-4">Thông tin phiên sạc</h3>
          
          <div className="space-y-3">
            {/* Start Time */}
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-5 h-5" />
                <span>Bắt đầu</span>
              </div>
              <span className="font-medium text-gray-900">
                {formatDateTime(session.thoi_gian_bat_dau)}
              </span>
            </div>

            {/* End Time */}
            {session.thoi_gian_ket_thuc && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span>Kết thúc</span>
                </div>
                <span className="font-medium text-gray-900">
                  {formatDateTime(session.thoi_gian_ket_thuc)}
                </span>
              </div>
            )}

            {/* Energy */}
            {session.dien_nang_kwh && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center gap-2 text-gray-600">
                  <Battery className="w-5 h-5" />
                  <span>Điện năng</span>
                </div>
                <span className="font-medium text-gray-900">
                  {parseFloat(session.dien_nang_kwh).toFixed(2)} kWh
                </span>
              </div>
            )}

            {/* SOC */}
            {session.soc_truoc !== null && session.soc_sau !== null && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center gap-2 text-gray-600">
                  <Zap className="w-5 h-5" />
                  <span>SOC</span>
                </div>
                <span className="font-medium text-gray-900">
                  {session.soc_truoc}% → {session.soc_sau}%
                  <span className="text-green-600 ml-1">
                    (+{session.soc_sau - session.soc_truoc}%)
                  </span>
                </span>
              </div>
            )}

            {/* Price per kWh */}
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="w-5 h-5" />
                <span>Đơn giá</span>
              </div>
              <span className="font-medium text-gray-900">
                {formatCurrency(session.don_gia_kwh)}/kWh
              </span>
            </div>

            {/* Total Cost */}
            {session.tong_tien && (
              <div className="flex items-center justify-between py-3 bg-blue-50 border border-blue-200 rounded-lg px-4 mt-4">
                <div className="flex items-center gap-2 text-blue-900 font-semibold">
                  <DollarSign className="w-6 h-6" />
                  <span>Tổng chi phí</span>
                </div>
                <span className="text-xl font-bold text-blue-700">
                  {formatCurrency(session.tong_tien)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {isActive && (
          <button
            onClick={() => setShowStopModal(true)}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-colors"
          >
            <StopCircle className="w-5 h-5" />
            Dừng sạc
          </button>
        )}

        {isCompleted && session.payment_status !== 'success' && (
          <button
            onClick={() => handlePayment(session.id_phien_sac)}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-colors"
          >
            <CreditCard className="w-5 h-5" />
            Thanh toán ngay
          </button>
        )}
      </div>

      {/* Stop Session Modal */}
      {showStopModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Kết thúc sạc</h3>
              
              <div className="space-y-3">
                {/* Energy */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Điện năng tiêu thụ (kWh) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={stopData.dien_nang_kwh}
                    onChange={(e) => setStopData({ ...stopData, dien_nang_kwh: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="VD: 15.5"
                  />
                </div>

                {/* SOC Before (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SOC trước khi sạc (%) <span className="text-gray-400">(Tùy chọn)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={stopData.soc_truoc}
                    onChange={(e) => setStopData({ ...stopData, soc_truoc: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="VD: 20"
                  />
                </div>

                {/* SOC After (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SOC sau khi sạc (%) <span className="text-gray-400">(Tùy chọn)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={stopData.soc_sau}
                    onChange={(e) => setStopData({ ...stopData, soc_sau: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="VD: 80"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowStopModal(false)}
                  disabled={stopping}
                  className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleStopSession}
                  disabled={stopping}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {stopping ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    'Xác nhận dừng sạc'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

