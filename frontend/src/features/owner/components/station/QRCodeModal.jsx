import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { X, Download, Printer, Copy, CheckCircle } from 'lucide-react';
import QRCode from 'qrcode';
import { toast } from 'sonner';
import { ownerAPI } from '../../../../services/api';

/**
 * QR Code Modal
 * Display, download, and print QR code for station check-in
 */
export default function QRCodeModal({ isOpen, onClose, station }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isOpen && station) {
      generateQRCode();
    }
  }, [isOpen, station]);

  const generateQRCode = async () => {
    try {
      setLoading(true);

      // Get QR data from backend
      const response = await ownerAPI.getStationQR(station.id_tram);

      if (response.data.success) {
        const { qrData } = response.data.data;

        // Generate QR code image
        const dataUrl = await QRCode.toDataURL(qrData, {
          width: 400,
          margin: 2,
          color: {
            dark: '#1F2937',
            light: '#FFFFFF',
          },
        });

        setQrDataUrl(dataUrl);
      }
    } catch (error) {
      console.error('Generate QR error:', error);
      toast.error('Không thể tạo QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QR-${station.ten_tram.replace(/\s+/g, '-')}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Đã tải xuống QR code');
  };

  const handlePrint = () => {
    if (!qrDataUrl) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${station.ten_tram}</title>
          <style>
            @media print {
              @page { margin: 0; }
              body { margin: 1cm; }
            }
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              text-align: center;
            }
            .header {
              margin-bottom: 20px;
            }
            h1 {
              font-size: 28px;
              margin: 0 0 10px 0;
              color: #1F2937;
            }
            .address {
              font-size: 16px;
              color: #6B7280;
              margin: 5px 0;
            }
            .qr-container {
              margin: 30px 0;
            }
            img {
              width: 400px;
              height: 400px;
            }
            .instructions {
              margin-top: 30px;
              padding: 20px;
              background: #F3F4F6;
              border-radius: 8px;
              max-width: 500px;
            }
            .instructions h2 {
              font-size: 18px;
              margin: 0 0 10px 0;
              color: #1F2937;
            }
            .instructions p {
              font-size: 14px;
              color: #4B5563;
              margin: 5px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>⚡ ${station.ten_tram}</h1>
            <p class="address">📍 ${station.dia_chi}</p>
          </div>
          
          <div class="qr-container">
            <img src="${qrDataUrl}" alt="QR Code" />
          </div>
          
          <div class="instructions">
            <h2>📱 Hướng dẫn sử dụng</h2>
            <p>1. Mở ứng dụng ChargeEVDN</p>
            <p>2. Đăng nhập tài khoản</p>
            <p>3. Quét mã QR để check-in</p>
            <p>4. Chọn cổng sạc và bắt đầu sạc</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/qr-checkin?station=${station.id_tram}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Đã sao chép link');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              QR Code Check-in
            </h2>
            <p className="text-sm text-gray-600 mt-1">{station?.ten_tram}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Đang tạo QR code...</p>
            </div>
          ) : (
            <>
              {/* QR Code Display */}
              <div className="flex flex-col items-center mb-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg border-4 border-blue-100">
                  {qrDataUrl && (
                    <img
                      ref={canvasRef}
                      src={qrDataUrl}
                      alt="QR Code"
                      className="w-80 h-80"
                    />
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-4 text-center">
                  📍 {station?.dia_chi}
                </p>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">
                  📱 Hướng dẫn sử dụng
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>1. Người dùng mở app ChargeEVDN</li>
                  <li>2. Đăng nhập tài khoản</li>
                  <li>3. Quét mã QR này để check-in tại trạm</li>
                  <li>4. Chọn cổng sạc và bắt đầu sạc pin</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Tải xuống
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Printer className="w-5 h-5" />
                  In QR Code
                </button>

                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Đã sao chép
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>

              {/* Tips */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Mẹo:</strong> In QR code và dán tại vị trí dễ thấy
                  ở trạm sạc để người dùng có thể dễ dàng check-in.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

QRCodeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  station: PropTypes.shape({
    id_tram: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    ten_tram: PropTypes.string,
    dia_chi: PropTypes.string,
  }),
};
