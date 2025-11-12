/**
 * Token Helper Utilities
 * Functions to check and decode JWT tokens
 */

/**
 * Decode JWT token without verification (client-side only)
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded payload or null if invalid
 */
export const decodeToken = (token) => {
  try {
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if expired, false otherwise
 */
export const isTokenExpired = (token) => {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;
  
  // exp is in seconds, Date.now() is in milliseconds
  const expiryTime = payload.exp * 1000;
  const now = Date.now();
  
  return now >= expiryTime;
};

/**
 * Get token expiry date
 * @param {string} token - JWT token
 * @returns {Date|null} Expiry date or null if invalid
 */
export const getTokenExpiry = (token) => {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return null;
  
  return new Date(payload.exp * 1000);
};

/**
 * Get time until token expires (in milliseconds)
 * @param {string} token - JWT token
 * @returns {number} Milliseconds until expiry, or 0 if expired
 */
export const getTimeUntilExpiry = (token) => {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return 0;
  
  const expiryTime = payload.exp * 1000;
  const now = Date.now();
  const timeLeft = expiryTime - now;
  
  return timeLeft > 0 ? timeLeft : 0;
};

/**
 * Check token and auto-logout if expired
 * Call this on app mount or route changes
 */
export const checkTokenValidity = () => {
  const token = localStorage.getItem('token');
  
  if (!token) return false;
  
  if (isTokenExpired(token)) {
    localStorage.removeItem('token');
    return false;
  }
  
  return true;
};

