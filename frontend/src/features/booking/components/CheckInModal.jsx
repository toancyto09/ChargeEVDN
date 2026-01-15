import { useState } from 'react';
import { X, QrCode, Loader, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CheckInModal({ isOpen, onClose, booking, onCheckInSuccess }) {
  const [confirmationCode, setConfirmationCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate confirmation code
    if (!confirmationCode || confirmationCode.trim().length !== 8) {
      toast.error('Vui lòng nhập mã xác nhận 8 ký tự');
      return;
    }

    // Check if code matches
    if (confirmationCode.toUpperCase() !== booking.ma_xac_nhan.toUpperCase()) {
      toast.error('Mã xác nhận không đúng! Vui lòng kiểm tra lại.');
      return;
    }

    // Call parent success handler
    setLoading(true);
    try {
      await onCheckInSuccess(booking);
    } catch (error) {
      console.error('Check-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData('text').trim().toUpperCase();
    setConfirmationCode(pastedText);
  };

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-[1003] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Check-in</h2>
                <p className="text-blue-100 text-sm mt-1">Nhập mã xác nhận</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Booking Info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <h3 className="font-semibold text-gray-900 mb-3">Thông tin đặt chỗ</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">Trạm sạc:</div>
              <div className="font-semibold text-right">{booking.ten_tram}</div>
              
              <div className="text-gray-600">Cổng sạc:</div>
              <div className="font-semibold text-right">
                {booking.loai_cong} - {booking.cong_suat_kwh}kW
              </div>
              
              {/* Hiển thị mã trụ để user biết đỗ xe vào đúng chỗ */}
              {booking.ma_cong_tram && (
                <>
                  <div className="text-gray-600">Vị trí trụ:</div>
                  <div className="font-bold text-right text-amber-600 flex items-center justify-end gap-1">
                    <span>📍</span>
                    <span>{booking.ma_cong_tram}</span>
                  </div>
                </>
              )}
              
              <div className="text-gray-600">Thời gian:</div>
              <div className="font-semibold text-right">
                {new Date(booking.thoi_gian_bat_dau).toLocaleString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit'
                })}
              </div>
            </div>
          </div>

          {/* Input mã xác nhận */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã xác nhận <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value.toUpperCase())}
              onPaste={handlePaste}
              placeholder="Nhập mã 8 ký tự (VD: A3B5C7D9)"
              maxLength={8}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-lg text-center tracking-widest uppercase"
              autoFocus
            />
            <p className="mt-2 text-xs text-gray-500">
              💡 Mã xác nhận có trong email hoặc thông báo đặt chỗ của bạn
            </p>
          </div>

          {/* Hint */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Hướng dẫn check-in:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Nhập mã xác nhận 8 ký tự</li>
                  <li>Nhấn "Xác nhận check-in"</li>
                  <li>Kết nối cáp sạc vào xe</li>
                  <li>Bắt đầu sạc pin!</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || confirmationCode.length !== 8}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="w-5 h-5 animate-spin" />
                  Đang xử lý...
                </span>
              ) : (
                'Xác nhận check-in'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
