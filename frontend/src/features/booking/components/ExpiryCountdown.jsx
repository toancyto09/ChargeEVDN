import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Calendar } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * Countdown timer showing time until booking expires
 * Only shows countdown when booking is confirmed and close to expiry
 *
 * @param {Date|string} expiryTime - Booking expiry time (het_han)
 * @param {string} status - Booking status
 * @param {function} onExpired - Callback when countdown reaches 0
 */
export default function ExpiryCountdown({ expiryTime, status, onExpired }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Only show for pending or confirmed bookings
    if (status !== 'cho_xac_nhan' && status !== 'da_xac_nhan') {
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      const expiry = new Date(expiryTime);
      const diff = expiry - now;

      if (diff <= 0) {
        setIsExpired(true);
        if (onExpired) onExpired();
        return null;
      }

      const totalMinutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      return { hours, minutes, seconds, totalMinutes };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryTime, status, onExpired]);

  // Don't show for completed/cancelled bookings
  if (status !== 'cho_xac_nhan' && status !== 'da_xac_nhan') {
    return null;
  }

  // Expired
  if (isExpired) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
        <AlertTriangle className="w-4 h-4 text-red-600" />
        <span className="text-sm font-medium text-red-700">Đã hết hạn</span>
      </div>
    );
  }

  // No time left calculated yet
  if (!timeLeft) {
    return null;
  }

  // Status: Chờ xác nhận - Show waiting message
  if (status === 'cho_xac_nhan') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
        <Calendar className="w-4 h-4 text-yellow-600" />
        <div className="flex flex-col">
          <span className="text-xs font-medium text-yellow-700">
            Chờ trạm xác nhận
          </span>
          <span className="text-xs text-yellow-600">
            Giờ sạc:{' '}
            {new Date(expiryTime).toLocaleString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit',
            })}
          </span>
        </div>
      </div>
    );
  }

  // Status: Đã xác nhận
  if (status === 'da_xac_nhan') {
    // Still far away (> 1 hour) - Don't show countdown yet
    if (timeLeft.totalMinutes > 60) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <Calendar className="w-4 h-4 text-blue-600" />
          <div className="flex flex-col">
            <span className="text-xs font-medium text-blue-700">
              Đã xác nhận
            </span>
            <span className="text-xs text-blue-600">
              Giờ sạc:{' '}
              {new Date(expiryTime).toLocaleString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
              })}
            </span>
          </div>
        </div>
      );
    }

    // Close to expiry (< 1 hour) - SHOW COUNTDOWN!
    const getUrgencyColor = () => {
      if (timeLeft.totalMinutes <= 2) {
        return 'bg-red-50 border-red-200 text-red-700';
      } else if (timeLeft.totalMinutes <= 5) {
        return 'bg-orange-50 border-orange-200 text-orange-700';
      } else if (timeLeft.totalMinutes <= 15) {
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      }
      return 'bg-green-50 border-green-200 text-green-700';
    };

    const getIconColor = () => {
      if (timeLeft.totalMinutes <= 2) return 'text-red-600';
      if (timeLeft.totalMinutes <= 5) return 'text-orange-600';
      if (timeLeft.totalMinutes <= 15) return 'text-yellow-600';
      return 'text-green-600';
    };

    const formatTime = () => {
      if (timeLeft.hours > 0) {
        return `${timeLeft.hours}:${timeLeft.minutes.toString().padStart(2, '0')}:${timeLeft.seconds.toString().padStart(2, '0')}`;
      } else {
        return `${timeLeft.minutes}:${timeLeft.seconds.toString().padStart(2, '0')}`;
      }
    };

    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${getUrgencyColor()}`}
      >
        <Clock className={`w-4 h-4 ${getIconColor()} animate-pulse`} />
        <div className="flex flex-col">
          <span className="text-xs font-medium opacity-75">Hết hạn sau:</span>
          <span className="text-sm font-bold">{formatTime()}</span>
        </div>
      </div>
    );
  }

  return null;
}

ExpiryCountdown.propTypes = {
  expiryTime: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
  ]).isRequired,
  status: PropTypes.string.isRequired,
  onExpired: PropTypes.func,
};
