/**
 * Navigation Utilities
 * Provides functions to calculate distances and format navigation data
 */

/**
 * Detect user's platform
 * @returns {'ios' | 'android' | 'web'}
 */
export const getPlatform = () => {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return 'web';
};

/**
 * Open navigation in external app (Google Maps, Apple Maps)
 * Works on iOS, Android, and Desktop
 * 100% FREE - No API key needed
 * 
 * @param {Object} origin - Starting point {lat, lng}
 * @param {Object} destination - Destination point {lat, lng}
 * @param {string} stationName - Name of the destination station
 */
export const openNavigation = (origin, destination, stationName = 'Trạm sạc') => {
  if (!origin || !destination) {
    console.error('Origin or destination is missing');
    return;
  }

  const platform = getPlatform();
  const originStr = `${origin.lat},${origin.lng}`;
  const destStr = `${destination.lat},${destination.lng}`;
  
  let url;
  
  switch (platform) {
    case 'ios':
      // Apple Maps (iOS)
      url = `maps://maps.apple.com/?saddr=${originStr}&daddr=${destStr}&dirflg=d`;
      break;
      
    case 'android':
      // Google Maps (Android app)
      url = `google.navigation:q=${destStr}&mode=d`;
      break;
      
    default:
      // Google Maps Web (Universal - works everywhere)
      url = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}&travelmode=driving`;
      break;
  }
  
  try {
    if (platform === 'web') {
      // Desktop: Open in new tab
      window.open(url, '_blank');
    } else {
      // Mobile: Try to open native app
      window.location.href = url;
      
      // Fallback to Google Maps web if app not installed (after 2s)
      setTimeout(() => {
        const fallbackUrl = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}&travelmode=driving`;
        window.open(fallbackUrl, '_blank');
      }, 2000);
    }
  } catch (error) {
    console.error('Failed to open navigation:', error);
    // Final fallback: Always try Google Maps web
    const fallbackUrl = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}&travelmode=driving`;
    window.open(fallbackUrl, '_blank');
  }
};

/**
 * Calculate straight-line distance between two points (Haversine formula)
 * @param {Object} point1 - First point {lat, lng}
 * @param {Object} point2 - Second point {lat, lng}
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (point1, point2) => {
  if (!point1 || !point2) return 0;
  
  const R = 6371; // Earth's radius in kilometers
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLon = (point2.lng - point1.lng) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.lat * Math.PI / 180) * 
    Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Estimate driving time based on distance
 * Uses average city speed of 40 km/h
 * @param {number} distanceKm - Distance in kilometers
 * @returns {number} Estimated time in minutes
 */
export const estimateDrivingTime = (distanceKm) => {
  const avgSpeedKmh = 40; // Average city speed in Da Nang
  return Math.round((distanceKm / avgSpeedKmh) * 60);
};

/**
 * Format distance for display
 * @param {number} distanceKm - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distanceKm) => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};

/**
 * Format duration for display
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration string
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} phút`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}ph` : `${hours}h`;
};

