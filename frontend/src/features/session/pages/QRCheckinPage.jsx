import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'sonner';
import { QrCode, Zap, MapPin, AlertCircle } from 'lucide-react';
import { sessionAPI } from '../../../services/api';
import PageLayout from '../../../components/layout/PageLayout';

/**
 * QRCheckinPage
 * Scan station QR code to check-in and start charging
 */
export default function QRCheckinPage() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [checkinInfo, setCheckinInfo] = useState(null);
  const scannerRef = useRef(null);
  const html5QrcodeRef = useRef(null);

  useEffect(() => {
    // Initialize QR scanner
    startScanner();

    return () => {
      // Cleanup scanner on unmount
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      const html5Qrcode = new Html5Qrcode("qr-reader");
      html5QrcodeRef.current = html5Qrcode;

      const qrCodeSuccessCallback = (decodedText) => {
        onScanSuccess(decodedText);
      };

      const config = { 
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await html5Qrcode.start(
        { facingMode: "environment" }, // Use back camera
        config,
        qrCodeSuccessCallback
      );
    } catch (err) {
      console.error("Unable to start scanner:", err);
      setError("Không thể khởi động camera. Vui lòng kiểm tra quyền truy cập camera.");
    }
  };

  const stopScanner = async () => {
    if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
      try {
        await html5QrcodeRef.current.stop();
        html5QrcodeRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  const onScanSuccess = async (decodedText) => {
    if (processing) return;
    
    setProcessing(true);
    setScanning(false);

    // Stop scanner
    await stopScanner();

    try {
      // Parse QR code data
      const qrData = JSON.parse(decodedText);
      
      if (qrData.type !== 'station') {
        toast.error('QR code không hợp lệ. Vui lòng quét QR code của trạm sạc');
        setProcessing(false);
        setScanning(true);
        startScanner();
        return;
      }

      // Call check-in API
      const response = await sessionAPI.checkInQR({
        station_id: qrData.station_id
      });

      if (response.data.success) {
        const info = response.data.data;
        setCheckinInfo(info);
        
        toast.success('Check-in thành công!');

        // Redirect to active session page after 3 seconds
        setTimeout(() => {
          navigate(`/sessions/${info.session_id}`);
        }, 3000);
      }

    } catch (error) {
      console.error('QR check-in error:', error);
      const errorMsg = error.response?.data?.message || 'Không thể check-in. Vui lòng thử lại';
      
      setError(errorMsg);
      toast.error(errorMsg);
      
      // Allow retry after 2 seconds
      setTimeout(() => {
        setError(null);
        setProcessing(false);
        setScanning(true);
        startScanner();
      }, 2000);
    }
  };

  if (error && !scanning) {
    return (
      <PageLayout 
        title="Quét QR Check-in"
        showBack
        onBack={() => navigate('/bookings')}
      >
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Không thể quét QR
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setScanning(true);
              startScanner();
            }}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
          >
            Thử lại
          </button>
        </div>
      </PageLayout>
    );
  }

  if (checkinInfo) {
    return (
      <PageLayout 
        title="Check-in Thành công"
        showBack
        onBack={() => navigate('/sessions')}
      >
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8 text-white text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Check-in thành công!</h2>
              <p className="text-green-100">Đang bắt đầu sạc...</p>
            </div>

            {/* Station Info */}
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {checkinInfo.station_name}
                </h3>
                <p className="text-sm text-gray-600 flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{checkinInfo.station_address}</span>
                </p>
              </div>

              {/* Connector Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-3">Thông tin cổng sạc</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã cổng:</span>
                    <span className="font-semibold text-gray-900">{checkinInfo.connector_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loại cổng:</span>
                    <span className="font-semibold text-gray-900">{checkinInfo.connector_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Công suất:</span>
                    <span className="font-semibold text-gray-900">{checkinInfo.power_kw} kW</span>
                  </div>
                </div>
              </div>

              {/* Confirmation Code */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-2 text-center">Mã xác nhận</p>
                <p className="text-3xl font-mono font-bold text-blue-700 text-center tracking-wider">
                  {checkinInfo.confirmation_code}
                </p>
              </div>

              {/* Instructions */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>📍 Hướng dẫn:</strong> Vui lòng đến cổng <strong>{checkinInfo.connector_code}</strong> và cắm dây sạc vào xe. 
                  Phiên sạc sẽ bắt đầu tự động.
                </p>
              </div>

              {/* Auto redirect notice */}
              <p className="text-center text-sm text-gray-500 pt-4">
                Đang chuyển đến trang giám sát...
              </p>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Quét QR Check-in"
      showBack
      onBack={() => navigate('/bookings')}
    >
      <div className="max-w-2xl mx-auto px-4 py-6">
        
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <QrCode className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Hướng dẫn check-in
              </h3>
              <ol className="text-sm text-blue-800 space-y-1.5 list-decimal list-inside">
                <li>Tìm mã QR trên biển hiệu/lối vào trạm sạc</li>
                <li>Đưa camera vào vùng quét bên dưới</li>
                <li>Đợi app tự động nhận diện</li>
                <li>Đến cổng sạc được chỉ định và bắt đầu sạc</li>
              </ol>
            </div>
          </div>
        </div>

        {/* QR Scanner */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b">
            <h3 className="font-semibold text-gray-900 text-center">
              {processing ? '⏳ Đang xử lý...' : '📷 Đang quét QR code'}
            </h3>
          </div>
          
          <div className="relative">
            {/* Scanner container */}
            <div id="qr-reader" className="w-full"></div>

            {/* Processing overlay */}
            {processing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-xl p-6 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-900 font-medium">Đang check-in...</p>
                </div>
              </div>
            )}
          </div>

          <div className="px-4 py-3 bg-gray-50 border-t text-center text-sm text-gray-600">
            Đưa QR code vào khung hình để quét
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 space-y-3">
          <div className="flex items-start gap-3 text-sm">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-green-600 font-bold text-xs">✓</span>
            </div>
            <p className="text-gray-700">
              <strong>Đúng booking:</strong> QR code sẽ tự động xác định cổng sạc mà bạn đã đặt
            </p>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-green-600 font-bold text-xs">✓</span>
            </div>
            <p className="text-gray-700">
              <strong>Tự động bắt đầu:</strong> Sau khi check-in, phiên sạc sẽ bắt đầu ngay
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

