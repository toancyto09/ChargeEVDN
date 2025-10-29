import { useState, useEffect } from 'react';

/**
 * Hook lấy vị trí với fallback 3 cấp:
 * 1. GPS (enableHighAccuracy: true) - Độ chính xác cao nhất
 * 2. WiFi/Network (enableHighAccuracy: false) - Fallback nhanh
 * 3. Default (48 Cao Thắng, Đà Nẵng) - Khi không có GPS/WiFi
 */
export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationSource, setLocationSource] = useState(null); // 'gps', 'wifi', 'default'

  useEffect(() => {
    const DEFAULT_LOCATION = {
      lat: 16.0775118,
      lng: 108.2127375,
      accuracy: null,
    };

    if (!navigator.geolocation) {
      console.error('❌ Geolocation not supported');
      setError('Trình duyệt không hỗ trợ định vị');
      setLoading(false);
      setLocation(DEFAULT_LOCATION);
      setLocationSource('default');
      return;
    }

    console.log('🎯 [STEP 1/3] Trying GPS (high accuracy)...');
    let gpsTimeout;
    let wifiAttempted = false;

    // ============================================
    // STEP 1: Thử GPS trước (enableHighAccuracy: true)
    // ============================================
    const tryGPS = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(gpsTimeout);
          const { latitude, longitude, accuracy } = position.coords;

          console.log('✅ GPS SUCCESS!', {
            lat: latitude,
            lng: longitude,
            accuracy: Math.round(accuracy) + 'm',
          });

          setLocation({
            lat: latitude,
            lng: longitude,
            accuracy: accuracy,
          });
          setLocationSource('gps');
          setError(null);
          setLoading(false);
        },
        (err) => {
          clearTimeout(gpsTimeout);
          console.warn('⚠️ GPS failed:', err.message);

          // Nếu GPS fail, thử WiFi
          if (!wifiAttempted) {
            wifiAttempted = true;
            tryWiFi();
          }
        },
        {
          enableHighAccuracy: true, // ← Bắt buộc dùng GPS chip
          timeout: 10000, // 10s timeout cho GPS
          maximumAge: 0, // Không dùng cache
        }
      );

      // Timeout backup: Nếu GPS quá lâu, tự động chuyển WiFi
      gpsTimeout = setTimeout(() => {
        if (!location && !wifiAttempted) {
          console.warn('⏱️ GPS timeout (10s). Switching to WiFi...');
          wifiAttempted = true;
          tryWiFi();
        }
      }, 10000);
    };

    // ============================================
    // STEP 2: Thử WiFi/Network (enableHighAccuracy: false)
    // ============================================
    const tryWiFi = () => {
      console.log('🎯 [STEP 2/3] Trying WiFi/Network (fallback)...');

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;

          console.log('✅ WiFi/Network SUCCESS!', {
            lat: latitude,
            lng: longitude,
            accuracy: Math.round(accuracy) + 'm',
          });

          setLocation({
            lat: latitude,
            lng: longitude,
            accuracy: accuracy,
          });
          setLocationSource('wifi');
          setError({
            message: 'Đang dùng vị trí ước lượng (WiFi)',
            details: 'Bật GPS để có vị trí chính xác hơn',
          });
          setLoading(false);
        },
        (err) => {
          console.warn('⚠️ WiFi/Network failed:', err.message);
          useDefaultLocation();
        },
        {
          enableHighAccuracy: false, // ← Cho phép dùng WiFi/IP
          timeout: 8000, // 8s timeout cho WiFi
          maximumAge: 60000, // Cho phép dùng cache 1 phút
        }
      );
    };

    // ============================================
    // STEP 3: Dùng vị trí mặc định
    // ============================================
    const useDefaultLocation = () => {
      console.log(
        '🎯 [STEP 3/3] Using default location (48 Cao Thắng, Đà Nẵng)'
      );

      setLocation(DEFAULT_LOCATION);
      setLocationSource('default');
      setError({
        message: 'Không thể lấy vị trí GPS/WiFi',
        details: 'Đang hiển thị vị trí mặc định tại 48 Cao Thắng, Đà Nẵng',
      });
      setLoading(false);
    };

    // ============================================
    // Bắt đầu từ GPS
    // ============================================
    tryGPS();

    // Cleanup
    return () => {
      clearTimeout(gpsTimeout);
    };
  }, []);

  // ============================================
  // Refetch: Thử lại GPS
  // ============================================
  const refetch = () => {
    console.log('🔄 Manual refetch - Trying GPS again...');
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log('✅ Refetch GPS success:', {
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy) + 'm',
        });

        setLocation({
          lat: latitude,
          lng: longitude,
          accuracy: accuracy,
        });
        setLocationSource('gps');
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('❌ Refetch failed:', err.message);
        setError({
          message: 'Không thể cập nhật vị trí',
          details: 'Vui lòng kiểm tra GPS và thử lại',
        });
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return {
    location,
    error,
    loading,
    refetch,
    locationSource, // 'gps', 'wifi', 'default'
  };
};
