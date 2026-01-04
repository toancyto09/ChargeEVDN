import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Zap, Battery, AlertCircle, CheckCircle, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { bookingAPI } from '../../../services/api';

export default function BookingModal({ isOpen, onClose, station, connector, vehicle }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(1); // hours
  const [estimatedKwh, setEstimatedKwh] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [endTime, setEndTime] = useState(''); // Calculated end time

  useEffect(() => {
    if (isOpen) {
      // Set default date to TODAY (not tomorrow)
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      setSelectedDate(todayStr);
      
      // Set default time to next available slot (30 min from now)
      const now = new Date();
      const nextSlot = new Date(now);
      nextSlot.setMinutes(Math.ceil(now.getMinutes() / 30) * 30 + 30); // Next 30-min slot + 30 min buffer
      const hours = nextSlot.getHours().toString().padStart(2, '0');
      const minutes = nextSlot.getMinutes().toString().padStart(2, '0');
      const timeStr = `${hours}:${minutes}`;
      setSelectedTime(timeStr);
      
      // Calculate initial estimates
      calculateEstimates(1);
      
      // Calculate initial end time
      updateEndTime(todayStr, timeStr, 1);
    }
  }, [isOpen]);

  const calculateEstimates = (durationHours) => {
    if (!vehicle || !connector || !station) return;

    // Estimate kWh based on connector power and duration
    const connectorPowerKw = parseFloat(connector.cong_suat_kwh) || 0;
    const kWh = Math.min(
      connectorPowerKw * durationHours,
      parseFloat(vehicle.dung_luong_pin_kwh) || 0
    );
    
    setEstimatedKwh(kWh);
    
    // Calculate cost
    const pricePerKwh = parseFloat(station.gia_kwh) || 0;
    setEstimatedCost(kWh * pricePerKwh);
  };

  const handleDurationChange = (e) => {
    const hours = parseFloat(e.target.value);
    setDuration(hours);
    calculateEstimates(hours);
    updateEndTime(selectedDate, selectedTime, hours);
  };

  const updateEndTime = (date, time, durationHours) => {
    if (!date || !time) return;
    
    try {
      const [year, month, day] = date.split('-').map(Number);
      const [hours, minutes] = time.split(':').map(Number);
      const startDateTime = new Date(year, month - 1, day, hours, minutes);
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + (durationHours * 60));
      
      const endTimeStr = endDateTime.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        hour12: false
      });
      setEndTime(endTimeStr);
    } catch (e) {
      setEndTime('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      toast.error('Vui lòng chọn ngày và giờ');
      return;
    }

    if (!vehicle) {
      toast.error('Vui lòng chọn phương tiện');
      return;
    }

    if (!connector || !connector.id_cong_sac) {
      console.error('Connector data:', connector);
      toast.error('Không tìm thấy cổng sạc khả dụng. Vui lòng thử lại.');
      return;
    }

    setLoading(true);

    try {
      // Combine date and time with proper timezone handling
      // Parse as local time (Vietnam timezone)
      const [year, month, day] = selectedDate.split('-').map(Number);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      
      const startDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
      const now = new Date();
      
      // ========================================
      // DEBUG: Log chi tiết để kiểm tra
      // ========================================
      console.log('🔍 ========== DEBUG TIME VALIDATION ==========');
      console.log('📅 Selected Date:', selectedDate);
      console.log('🕐 Selected Time:', selectedTime);
      console.log('📊 Parsed values:', { year, month: month - 1, day, hours, minutes });
      console.log('📅 Start DateTime (Local):', startDateTime.toLocaleString('vi-VN', { 
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }));
      console.log('📅 Start DateTime (ISO):', startDateTime.toISOString());
      console.log('📅 Start DateTime (Timestamp):', startDateTime.getTime());
      console.log('⏰ Current DateTime (Local):', now.toLocaleString('vi-VN', { 
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }));
      console.log('⏰ Current DateTime (ISO):', now.toISOString());
      console.log('⏰ Current DateTime (Timestamp):', now.getTime());
      console.log('⏱️  Time Difference (ms):', startDateTime.getTime() - now.getTime());
      console.log('⏱️  Time Difference (minutes):', Math.round((startDateTime.getTime() - now.getTime()) / 60000));
      console.log('🌍 Browser Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
      console.log('🔍 ===========================================');
      
      // Validate 1: Not in the past
      if (startDateTime < now) {
        const diffMs = now.getTime() - startDateTime.getTime();
        const diffMinutes = Math.round(diffMs / 60000);
        const diffHours = Math.floor(diffMinutes / 60);
        
        const startTimeFormatted = startDateTime.toLocaleString('vi-VN', {
          timeZone: 'Asia/Ho_Chi_Minh',
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        
        const nowTimeFormatted = now.toLocaleString('vi-VN', {
          timeZone: 'Asia/Ho_Chi_Minh',
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        
        console.error('❌ VALIDATION FAILED: Past time detected');
        console.error('   Selected:', startTimeFormatted);
        console.error('   Current:', nowTimeFormatted);
        console.error('   Difference:', diffHours > 0 ? `${diffHours} giờ ${diffMinutes % 60} phút` : `${diffMinutes} phút`);
        
        toast.error(
          `Không thể đặt chỗ trong quá khứ! Bạn chọn ${startTimeFormatted} nhưng hiện tại là ${nowTimeFormatted}. Vui lòng chọn thời gian trong tương lai (ít nhất 15 phút nữa).`,
          { 
            duration: 8000,
            description: `Chênh lệch: ${diffHours > 0 ? `${diffHours} giờ ${diffMinutes % 60} phút` : `${diffMinutes} phút`}`
          }
        );
        setLoading(false);
        return;
      }

      // Validate 2: At least 15 minutes from now
      const minAdvanceTime = new Date(now);
      minAdvanceTime.setMinutes(minAdvanceTime.getMinutes() + 15);
      
      if (startDateTime < minAdvanceTime) {
        const diffMs = minAdvanceTime.getTime() - startDateTime.getTime();
        const diffMinutes = Math.round(diffMs / 60000);
        
        console.warn('⚠️  VALIDATION WARNING: Less than 15 minutes');
        console.warn('   Selected:', startDateTime.toLocaleString('vi-VN'));
        console.warn('   Minimum required:', minAdvanceTime.toLocaleString('vi-VN'));
        console.warn('   Need to wait:', diffMinutes, 'more minutes');
        
        const minTimeFormatted = minAdvanceTime.toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit'
        });
        
        toast.error(
          `Vui lòng đặt chỗ ít nhất 15 phút trước giờ sạc! Thời gian sớm nhất có thể: ${minTimeFormatted}`,
          { duration: 6000 }
        );
        setLoading(false);
        return;
      }

      // Validate 3: Maximum 6 hours in advance (EV charging doesn't need booking too far ahead)
      const maxAdvanceTime = new Date(now);
      maxAdvanceTime.setHours(maxAdvanceTime.getHours() + 6);
      
      if (startDateTime > maxAdvanceTime) {
        const diffMs = startDateTime.getTime() - maxAdvanceTime.getTime();
        const diffHours = Math.round(diffMs / 3600000);
        
        console.warn('⚠️  VALIDATION WARNING: More than 6 hours ahead');
        console.warn('   Selected:', startDateTime.toLocaleString('vi-VN'));
        console.warn('   Maximum allowed:', maxAdvanceTime.toLocaleString('vi-VN'));
        console.warn('   Too far:', diffHours, 'hours');
        
        const maxTimeFormatted = maxAdvanceTime.toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit'
        });
        
        toast.error(
          `Chỉ có thể đặt chỗ trong vòng 6 giờ tới! Thời gian muộn nhất có thể: ${maxTimeFormatted}`,
          { duration: 6000 }
        );
        setLoading(false);
        return;
      }
      
      console.log('✅ All validations passed!');

      const endDateTime = new Date(startDateTime);
      // Convert duration (hours) to minutes and add
      const durationMinutes = duration * 60;
      endDateTime.setMinutes(endDateTime.getMinutes() + durationMinutes);

      console.log('🕐 Start time (local):', startDateTime);
      console.log('🕐 End time (local):', endDateTime);
      console.log('🕐 Duration (hours):', duration, '→', durationMinutes, 'minutes');
      console.log('🕐 Start ISO:', startDateTime.toISOString());
      console.log('🕐 End ISO:', endDateTime.toISOString());

      const bookingData = {
        id_phuong_tien: parseInt(vehicle.id_phuong_tien),
        id_cong_sac: parseInt(connector.id_cong_sac),
        thoi_gian_bat_dau: startDateTime.toISOString(),
        thoi_gian_ket_thuc: endDateTime.toISOString(),
        uoc_tinh_kwh: parseFloat(estimatedKwh),
      };

      console.log('📤 Booking data:', bookingData);

      const response = await bookingAPI.create(bookingData);

      if (response.data.success) {
        const booking = response.data.data;
        
        // ✅ INSTANT BOOKING SUCCESS!
        // Store booking result to show in Success Modal
        setBookingResult({
          booking: booking,
          station: station,
          connector: connector,
          vehicle: vehicle,
          checkInDeadline: new Date(booking.het_han),
          startTime: new Date(booking.thoi_gian_bat_dau)
        });
        
        // Show Success Modal with QR Code
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Booking error:', error);
      
      // Handle 409 Conflict (slot not available)
      if (error.response?.status === 409) {
        toast.error(
          error.response?.data?.message || 'Khung giờ này đã kín. Vui lòng chọn thời gian khác.',
          { duration: 5000 }
        );
      } else {
        toast.error(error.response?.data?.message || 'Đặt chỗ thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle close success modal and navigate
  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setBookingResult(null);
    onClose(); // Close booking modal
    
    // Navigate to bookings page
    setTimeout(() => {
      navigate('/bookings');
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Booking Modal */}
      <div className="fixed inset-0 z-[1002] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">Đặt chỗ sạc</h2>
                <p className="text-blue-100 text-sm">{station?.ten_tram}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Station & Connector Info */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Loại cổng:</span>
                <span className="font-semibold">{connector?.loai_cong}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Công suất:</span>
                <span className="font-semibold">{connector?.cong_suat_kwh} kW</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Giá:</span>
                <span className="font-semibold text-green-600">
                  {Math.round(station?.gia_kwh || 0).toLocaleString('vi-VN')} đ/kWh
                </span>
              </div>
            </div>

            {/* Vehicle Info */}
            {vehicle && (
              <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-semibold mb-2">
                  <Battery className="w-5 h-5" />
                  <span>Phương tiện</span>
                </div>
                <div className="text-sm space-y-1">
                  <p><span className="text-gray-600">Xe:</span> {vehicle.hang_xe} {vehicle.dong_xe}</p>
                  <p><span className="text-gray-600">Biển số:</span> {vehicle.bien_so || 'N/A'}</p>
                  <p><span className="text-gray-600">Pin:</span> {vehicle.dung_luong_pin_kwh} kWh</p>
                </div>
              </div>
            )}

            {/* Date Selection - Smart 6h window */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Ngày sạc
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  updateEndTime(e.target.value, selectedTime, duration);
                }}
                min={new Date().toISOString().split('T')[0]}
                max={(() => {
                  const maxTime = new Date();
                  maxTime.setHours(maxTime.getHours() + 6);
                  return maxTime.toISOString().split('T')[0];
                })()}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Có thể đặt trong vòng 6 giờ tới (kể cả qua ngày)
              </p>
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Giờ bắt đầu
              </label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => {
                  setSelectedTime(e.target.value);
                  updateEndTime(selectedDate, e.target.value, duration);
                }}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Tối thiểu 15 phút từ bây giờ
              </p>
            </div>

            {/* Duration Selection - Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Zap className="w-4 h-4 inline mr-2" />
                Thời gian sạc: <span className="text-blue-600 font-semibold">{duration}h</span>
                <span className="text-gray-500 text-sm ml-2">({Math.round(duration * 60)} phút)</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="6"
                step="0.5"
                value={duration}
                onChange={handleDurationChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>30 phút</span>
                <span>6 giờ</span>
              </div>
            </div>

            {/* End Time Display */}
            {endTime && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Kết thúc dự kiến:</p>
                    <p className="text-lg font-semibold text-blue-600">{endTime}</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-400" />
                </div>
              </div>
            )}

            {/* Estimates */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 space-y-3 border-2 border-emerald-200">
              <h3 className="font-semibold text-emerald-900 mb-2">Ước tính</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Điện năng:</span>
                <span className="font-bold text-emerald-700">~{estimatedKwh.toFixed(1)} kWh</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Chi phí:</span>
                <span className="font-bold text-emerald-700 text-lg">
                  ~{estimatedCost.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                Vui lòng đến trước giờ đặt chỗ 15 phút. Đặt chỗ sẽ tự động hủy nếu bạn không check-in đúng giờ.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận đặt chỗ'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ✅ SUCCESS MODAL - INSTANT BOOKING APPROVED */}
      {showSuccessModal && bookingResult && (
        <div className="fixed inset-0 z-[1003] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[95vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-2xl">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 animate-bounce">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Đặt chỗ thành công! 🎉</h2>
                <p className="text-green-100 text-sm">
                  Đơn đặt chỗ đã được xác nhận tự động
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* QR Code Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <QrCode className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-blue-900 text-lg">Mã QR Check-in</h3>
                </div>
                
                {/* QR Code Display */}
                <div className="bg-white p-4 rounded-xl shadow-inner flex justify-center">
                  <QRCodeSVG 
                    value={bookingResult.booking.ma_xac_nhan || 'BOOKING_CODE'}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-600 mb-1">Mã xác nhận</p>
                  <p className="font-mono font-bold text-lg text-blue-600">
                    {bookingResult.booking.ma_xac_nhan}
                  </p>
                </div>
              </div>

              {/* Booking Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-gray-900 border-b pb-2">Thông tin đặt chỗ</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạm sạc:</span>
                    <span className="font-semibold text-right">{bookingResult.station.ten_tram}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cổng sạc:</span>
                    <span className="font-semibold">
                      {bookingResult.connector.loai_cong} - {bookingResult.connector.cong_suat_kwh}kW
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phương tiện:</span>
                    <span className="font-semibold text-right">
                      {bookingResult.vehicle.hang_xe} {bookingResult.vehicle.dong_xe}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian:</span>
                    <span className="font-semibold">
                      {bookingResult.startTime.toLocaleString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Check-in Deadline Warning */}
              <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-amber-900 mb-1">Lưu ý quan trọng!</p>
                    <p className="text-sm text-amber-800 leading-relaxed">
                      Vui lòng đến trạm và check-in trước{' '}
                      <span className="font-bold">
                        {bookingResult.checkInDeadline.toLocaleString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit'
                        })}
                      </span>
                      {' '}(15 phút sau giờ bắt đầu). Đặt chỗ sẽ tự động hủy nếu bạn không đến đúng giờ.
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <QrCode className="w-4 h-4" />
                  Hướng dẫn check-in
                </h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Đến trạm sạc trước giờ hẹn</li>
                  <li>Quét mã QR tại trạm hoặc nhập mã xác nhận</li>
                  <li>Kết nối cáp sạc và bắt đầu sạc</li>
                  <li>Thanh toán sau khi hoàn thành sạc</li>
                </ol>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    // Copy QR code to clipboard
                    navigator.clipboard.writeText(bookingResult.booking.ma_xac_nhan);
                    toast.success('Đã sao chép mã xác nhận!');
                  }}
                  className="flex-1 px-4 py-3 border-2 border-blue-500 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                >
                  Sao chép mã
                </button>
                <button
                  onClick={handleSuccessClose}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all shadow-lg"
                >
                  Xem đơn đặt chỗ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

