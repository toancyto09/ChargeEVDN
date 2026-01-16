import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  CheckCircle, Home, FileText, Zap, Clock, DollarSign, Calendar, 
  MapPin, Info, Download, Share2, Leaf, TrendingUp, Battery, Star 
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * Premium Payment Success Page - Ultra Modern Design
 */
const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    // Hide app header
    const hideHeader = () => {
      const header = document.querySelector('header');
      if (header) header.style.display = 'none';
    };
    hideHeader();

    const fetchPaymentDetails = async () => {
      try {
        // Get params - could be from VNPay directly or from backend redirect
        const sessionIdParam = searchParams.get('sessionId');
        const vnpTxnRef = searchParams.get('vnp_TxnRef');
        const vnpTransactionNo = searchParams.get('vnp_TransactionNo');
        
        if (vnpTransactionNo) setTransactionId(vnpTransactionNo);
        
        // Determine sessionId - from URL param or from vnp_TxnRef
        let sessionId = null;
        
        if (sessionIdParam) {
          sessionId = sessionIdParam;
        } else if (vnpTxnRef && vnpTxnRef.startsWith('S')) {
          sessionId = vnpTxnRef.split('_')[0].substring(1);
        }
        
        if (sessionId) {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:8080/api/sessions/${sessionId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          const data = await response.json();
          
          if (data.success && data.data) {
            // Parse numeric fields to ensure they are numbers
            const parsedSession = {
              ...data.data,
              dien_nang_kwh: parseFloat(data.data.dien_nang_kwh) || 0,
              don_gia_kwh: parseFloat(data.data.don_gia_kwh) || 0,
              phi_cho_phut: parseFloat(data.data.phi_cho_phut) || 0,
              so_phut_cho: parseInt(data.data.so_phut_cho) || 0,
              soc_truoc: data.data.soc_truoc != null ? parseInt(data.data.soc_truoc) : null,
              soc_sau: data.data.soc_sau != null ? parseInt(data.data.soc_sau) : null
            };
            setSession(parsedSession);
            toast.success('Thanh toán thành công!', {
              icon: '🎉',
              duration: 3000
            });
          }
        }
      } catch (error) {
        console.error('Payment fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();

    return () => {
      const header = document.querySelector('header');
      if (header) header.style.display = 'block';
    };
  }, [searchParams]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (start, end) => {
    const diff = new Date(end) - new Date(start);
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return { hours, mins };
  };

  const calculateCO2Saved = (kwh) => {
    // Average: 1 kWh EV saves ~0.4 kg CO2 vs gasoline car
    return (kwh * 0.4).toFixed(1);
  };

  const downloadReceipt = () => {
    toast.success('Tính năng đang phát triển!');
  };

  const shareSuccess = () => {
    toast.success('Đã copy link!');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-emerald-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="space-y-2">
            <p className="text-gray-700 text-xl font-bold">Đang xử lý thanh toán...</p>
            <p className="text-gray-500">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-12 text-center shadow-2xl max-w-md">
          <div className="text-7xl mb-6 animate-bounce">⚠️</div>
          <h2 className="text-3xl font-black mb-4">Không tìm thấy thông tin</h2>
          <p className="text-gray-600 text-lg mb-8">Vui lòng kiểm tra lại hoặc liên hệ hỗ trợ</p>
          <button
            onClick={() => navigate('/map')}
            className="px-10 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl hover:shadow-2xl transition font-bold text-lg"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const duration = session.thoi_gian_bat_dau && session.thoi_gian_ket_thuc 
    ? formatDuration(session.thoi_gian_bat_dau, session.thoi_gian_ket_thuc)
    : null;

  const socGained = (session.soc_sau != null && session.soc_truoc != null) 
    ? session.soc_sau - session.soc_truoc 
    : 0;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 overflow-y-auto">
      <div className="min-h-full py-6 md:py-10 px-3 md:px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Success Header */}
          <div className="text-center mb-6 md:mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-full mb-4 shadow-xl">
              <CheckCircle className="w-12 h-12 md:w-14 md:h-14 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
              Thanh toán thành công!
            </h1>
            <p className="text-gray-600 text-sm md:text-base">Cảm ơn bạn đã sử dụng dịch vụ ⚡</p>
            {transactionId && (
              <p className="text-gray-500 font-mono text-xs mt-2">
                Mã GD: <span className="font-semibold text-emerald-600">{transactionId}</span>
              </p>
            )}
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-4 md:gap-5 mb-6">
            
            {/* Left: Payment Details */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Amount Banner */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-4 md:p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      <span className="text-sm font-medium">Tổng thanh toán</span>
                    </div>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">VNPay</span>
                  </div>
                  <p className="text-3xl md:text-4xl font-bold">
                    {formatCurrency(session.tong_chi_phi || session.chi_phi_sac || 0)}
                  </p>
                  <div className="flex items-center gap-1 text-emerald-100 text-sm mt-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Hoàn tất</span>
                  </div>
                </div> */}

                {/* Breakdown */}
                <div className="p-4 md:p-5">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    Chi tiết thanh toán
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 text-sm flex items-center gap-1">
                        <Zap className="w-3 h-3 text-yellow-500" />
                        Tiền điện ({(session.dien_nang_kwh || 0).toFixed(1)} kWh)
                      </span>
                      <span className="font-semibold text-sm">
                        {formatCurrency((session.dien_nang_kwh || 0) * (session.don_gia_kwh || 0))}
                      </span>
                    </div>
                    
                    {session.chi_phi_cho > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 text-sm flex items-center gap-1">
                          <Clock className="w-3 h-3 text-orange-500" />
                          Phí chờ ({session.so_phut_cho} phút)
                        </span>
                        <span className="font-semibold text-sm text-orange-600">
                          {formatCurrency(session.chi_phi_cho)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-500 text-xs">Đơn giá</span>
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                        {formatCurrency(session.don_gia_kwh || 0)}/kWh
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                  <Zap className="w-6 h-6 opacity-80 mb-2" />
                  <p className="text-xs opacity-90">Điện năng</p>
                  <p className="text-2xl font-bold">
                    {(session.dien_nang_kwh || 0).toFixed(1)} <span className="text-sm font-normal">kWh</span>
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 text-white shadow-lg">
                  <Clock className="w-6 h-6 opacity-80 mb-2" />
                  <p className="text-xs opacity-90">Thời gian</p>
                  <p className="text-2xl font-bold">
                    {duration ? duration.hours || duration.mins : '0'} <span className="text-sm font-normal">{duration && duration.hours > 0 ? 'giờ' : 'phút'}</span>
                  </p>
                </div>
              </div>

              {/* Environmental Impact */}
              {/* <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl p-8 text-white shadow-xl">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-10 h-10" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">Bảo vệ môi trường 🌱</h3>
                    <p className="text-green-50 mb-4">
                      Với {(session.dien_nang_kwh || 0).toFixed(1)} kWh điện sử dụng, bạn đã tiết kiệm được:
                    </p>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                      <p className="text-5xl font-black mb-1">
                        {calculateCO2Saved(session.dien_nang_kwh || 0)} kg
                      </p>
                      <p className="text-green-100">CO₂ so với xe xăng</p>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>

            {/* Right: Session & Actions */}
            <div className="space-y-6">
              
              {/* Session Timeline */}
              <div className="bg-white rounded-3xl shadow-xl p-6 animate-slide-right">
                <div className="flex items-center gap-2 mb-6">
                  <Info className="w-6 h-6 text-emerald-600" />
                  <h3 className="font-bold text-xl">Thông tin phiên sạc</h3>
                </div>
                
                <div className="space-y-5">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4">
                    <p className="text-sm text-gray-600 mb-1">Mã phiên</p>
                    <p className="font-mono font-black text-2xl text-emerald-600">
                      #{session.id_phien_sac}
                    </p>
                  </div>

                  {/* Timeline */}
                  <div className="relative pl-6 space-y-4">
                    <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 to-teal-500"></div>
                    
                    {session.thoi_gian_bat_dau && (
                      <div className="relative">
                        <div className="absolute -left-6 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white"></div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-1">Bắt đầu sạc</p>
                          <p className="font-semibold text-sm">{formatDateTime(session.thoi_gian_bat_dau)}</p>
                        </div>
                      </div>
                    )}

                    {session.thoi_gian_ket_thuc && (
                      <div className="relative">
                        <div className="absolute -left-6 w-4 h-4 bg-teal-500 rounded-full border-4 border-white"></div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-1">Hoàn thành</p>
                          <p className="font-semibold text-sm">{formatDateTime(session.thoi_gian_ket_thuc)}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {session.ten_tram && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500 mb-2">Địa điểm</p>
                      <p className="font-semibold flex items-center gap-2 text-lg">
                        <MapPin className="w-5 h-5 text-green-600" />
                        {session.ten_tram}
                      </p>
                    </div>
                  )}

                  {/* SOC Progress */}
                  {session.soc_truoc !== null && session.soc_sau !== null && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500 mb-3">Mức pin (SOC)</p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-3xl font-bold text-gray-400">{session.soc_truoc}%</span>
                          <Battery className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-1000"
                            style={{ width: `${socGained}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-3xl font-bold text-emerald-600">{session.soc_sau}%</span>
                          <Battery className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div className="text-center">
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-semibold text-sm">
                            <TrendingUp className="w-4 h-4" />
                            +{socGained}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              {/* <div className="bg-white rounded-3xl shadow-xl p-6">
                <h4 className="font-bold mb-4">Thao tác nhanh</h4>
                <div className="space-y-3">
                  <button
                    onClick={downloadReceipt}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition font-semibold"
                  >
                    <Download className="w-5 h-5" />
                    Tải hóa đơn
                  </button>
                  <button
                    onClick={shareSuccess}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition font-semibold"
                  >
                    <Share2 className="w-5 h-5" />
                    Chia sẻ
                  </button>
                </div>
              </div> */}

              {/* Rating Prompt */}
              {/* <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-6 text-white text-center">
                <Star className="w-12 h-12 mx-auto mb-3 fill-current" />
                <h4 className="font-bold text-lg mb-2">Hài lòng với dịch vụ?</h4>
                <p className="text-yellow-100 text-sm mb-4">Đánh giá để giúp chúng tôi cải thiện</p>
                <div className="flex justify-center gap-2">
                  {[1,2,3,4,5].map(i => (
                    <button key={i} className="w-10 h-10 bg-white/20 hover:bg-white/40 rounded-lg transition">
                      <Star className="w-6 h-6 mx-auto" />
                    </button>
                  ))}
                </div>
              </div> */}
            </div>
          </div>

          {/* Bottom CTAs */}
          <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            <button
              onClick={() => navigate('/payment/history')}
              className="group flex items-center justify-center gap-3 px-10 py-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-black text-xl shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-1"
            >
              <FileText className="w-7 h-7 group-hover:rotate-12 transition-transform" />
              Lịch sử thanh toán
            </button>
            <button
              onClick={() => navigate('/map')}
              className="group flex items-center justify-center gap-3 px-10 py-6 bg-white hover:bg-gray-50 text-gray-800 rounded-2xl font-black text-xl shadow-xl hover:shadow-2xl transition-all border-3 border-gray-200"
            >
              <Home className="w-7 h-7 group-hover:scale-110 transition-transform" />
              Trang chủ
            </button>
          </div>

        </div>
      </div>

      {/* Premium Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes slide-right {
          from { transform: translateX(50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes success-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out 0.2s both;
        }

        .animate-slide-right {
          animation: slide-right 0.8s ease-out 0.4s both;
        }

        .animate-success-bounce {
          animation: success-bounce 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default PaymentSuccessPage;
