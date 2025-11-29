import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { X, Clock, DollarSign, AlertCircle } from 'lucide-react';
import { bookingAPI } from '../../../services/api';
import { toast } from 'sonner';

/**
 * Modal for extending booking expiry time
 * Calculates and shows late fee before confirmation
 */
export default function ExtendBookingModal({ 
  isOpen, 
  onClose, 
  booking,
  onExtendSuccess 
}) {
  const [selectedMinutes, setSelectedMinutes] = useState(15);
  const [loading, setLoading] = useState(false);

  const phiChoPhut = parseFloat(booking?.phi_cho_phut) || 0;
  const lateFee = phiChoPhut * selectedMinutes;

  const extensionOptions = [
    { value: 10, label: '10 phút' },
    { value: 15, label: '15 phút' },
    { value: 20, label: '20 phút' },
    { value: 30, label: '30 phút' },
  ];

  const handleExtend = async () => {
    try {
      setLoading(true);

      const response = await bookingAPI.extend(booking.id_dat_cho, selectedMinutes);

      toast.success(response.data.message || 'Đã gia hạn thành công!', {
        duration: 4000
      });

      if (onExtendSuccess) {
        onExtendSuccess(response.data.data);
      }

      onClose();
    } catch (error) {
      console.error('Extend booking error:', error);
      toast.error(error.response?.data?.message || 'Không thể gia hạn');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Gia hạn đặt chỗ</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Bị kẹt xe?</p>
              <p className="opacity-90">
                Gia hạn thời gian đặt chỗ để không bị hủy tự động. 
                Phí chờ sẽ được tính theo đơn giá <strong>{phiChoPhut.toFixed(0)}đ/phút</strong>.
              </p>
            </div>
          </div>

          {/* Booking Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="text-sm">
              <span className="text-gray-600">Trạm:</span>
              <span className="ml-2 font-medium">{booking?.ten_tram}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Giờ sạc:</span>
              <span className="ml-2 font-medium">
                {new Date(booking?.thoi_gian_bat_dau).toLocaleString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit'
                })}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Hết hạn lúc:</span>
              <span className="ml-2 font-medium text-orange-600">
                {new Date(booking?.het_han).toLocaleString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>

          {/* Extension Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Chọn thời gian gia hạn:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {extensionOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSelectedMinutes(option.value)}
                  className={`
                    px-4 py-3 rounded-lg border-2 transition-all
                    ${selectedMinutes === option.value
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <Clock className={`w-5 h-5 mx-auto mb-1 ${
                    selectedMinutes === option.value ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <div className="font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Fee Display */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-gray-700">Phí chờ:</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">
                  {lateFee.toFixed(0)}đ
                </div>
                <div className="text-xs text-gray-600">
                  {selectedMinutes} phút × {phiChoPhut.toFixed(0)}đ
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <p className="text-xs text-gray-500 text-center">
            Phí chờ sẽ được cộng vào tổng chi phí đặt chỗ
          </p>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 border-t">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleExtend}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : `Xác nhận - ${lateFee.toFixed(0)}đ`}
          </button>
        </div>
      </div>
    </div>
  );
}

ExtendBookingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  booking: PropTypes.object,
  onExtendSuccess: PropTypes.func
};

