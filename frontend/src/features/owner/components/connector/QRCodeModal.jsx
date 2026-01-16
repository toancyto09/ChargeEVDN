import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { X, Download, Printer, QrCode, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeCanvas } from 'qrcode.react';
import { ownerAPI } from '../../../../services/api';

export default function QRCodeModal({ connector, onClose }) {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQRData();
  }, [connector]);

  const loadQRData = async () => {
    try {
      setLoading(true);
      const response = await ownerAPI.getConnectorQR(connector.id_cong_sac);
      const qrDataString = response.data?.qrData || response.data?.data?.qrData;
      
      console.log('QR Data loaded:', qrDataString);
      setQrData(qrDataString);

    } catch (error) {
      console.error('Error loading QR code:', error);
      toast.error('Không thể tải QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const canvas = document.getElementById('qr-canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `QR_${connector.ma_cong_tram || 'connector'}.png`;
      link.href = url;
      link.click();
      toast.success('Đã tải QR code');
    }
  };

  const handlePrint = () => {
    window.print();
    toast.info('Đang in QR code...');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">QR Code Cổng Sạc</h2>
                <p className="text-blue-100 text-sm mt-1">{connector.ma_cong_tram}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Connector Info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <h3 className="font-semibold text-gray-900 mb-3">Thông tin cổng sạc</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">Mã cổng:</div>
              <div className="font-semibold text-right">{connector.ma_cong_tram}</div>
              
              <div className="text-gray-600">Loại:</div>
              <div className="font-semibold text-right">{connector.ma_cong || 'N/A'}</div>
              
              <div className="text-gray-600">Công suất:</div>
              <div className="font-semibold text-right">{connector.cong_suat_kwh} kW</div>
            </div>
          </div>

          {/* QR Code Display */}
          <div className="flex flex-col items-center justify-center py-4">
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader className="w-12 h-12 animate-spin text-blue-600" />
              </div>
            ) : qrData ? (
              <>
                <div className="border-4 border-gray-200 rounded-xl p-4 bg-white">
                  <QRCodeCanvas
                    id="qr-canvas"
                    value={qrData}
                    size={256}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center max-w-xs">
                  💡 Dán QR code này lên cổng sạc để khách hàng quét và check-in
                </p>
              </>
            ) : (
              <div className="text-center text-gray-500 py-12">
                Không thể tạo QR code
              </div>
            )}
          </div>

          {/* Actions */}
          {!loading && qrData && (
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Tải xuống
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" />
                In QR
              </button>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

QRCodeModal.propTypes = {
  connector: PropTypes.shape({
    id_cong_sac: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    ma_cong_tram: PropTypes.string,
    ma_cong: PropTypes.string,
    cong_suat_kwh: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  }).isRequired,
  onClose: PropTypes.func.isRequired
};
