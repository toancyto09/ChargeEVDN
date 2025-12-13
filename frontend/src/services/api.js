import axios from 'axios';
import { toast } from 'sonner';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const token = localStorage.getItem('token');
    const currentPath = window.location.pathname;

    // Xử lý token hết hạn hoặc không hợp lệ (401 hoặc 403)
    if ((status === 401 || status === 403) && token) {
      // Chỉ redirect nếu KHÔNG đang ở trang login/register
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('token');

        // Hiển thị thông báo
        toast.warning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', {
          duration: 3000,
        });

        // Redirect sau 800ms để user thấy toast
        setTimeout(() => {
          window.location.href = '/login';
        }, 800);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getProfile: () => api.get('/api/auth/profile'),
  logout: () => api.post('/api/auth/logout'),
  // Password reset with OTP
  forgotPassword: (data) => api.post('/api/auth/forgot-password', data),
  verifyOTP: (data) => api.post('/api/auth/verify-otp', data),
  resetPassword: (data) => api.post('/api/auth/reset-password', data),
};

// Stations API
export const stationsAPI = {
  getAll: (params) => api.get('/api/stations', { params }),
  getById: (id) => api.get(`/api/stations/${id}`),
  getStationDetail: (id) => api.get(`/api/stations/${id}/detail`),
  create: (stationData) => api.post('/api/stations', stationData),
  update: (id, stationData) => api.put(`/api/stations/${id}`, stationData),
  delete: (id) => api.delete(`/api/stations/${id}`),
  search: (searchParams) =>
    api.get('/api/stations/search', { params: searchParams }),
};

// Bookings API
export const bookingsAPI = {
  getMyBookings: () => api.get('/api/bookings/my'),
  create: (bookingData) => api.post('/api/bookings', bookingData),
  cancel: (id) => api.post(`/api/bookings/${id}/cancel`),
  getById: (id) => api.get(`/api/bookings/${id}`),
};

// Sessions API
export const sessionsAPI = {
  checkin: (data) => api.post('/api/sessions/checkin', data),
  finish: (id, data) => api.patch(`/api/sessions/${id}/finish`, data),
  getById: (id) => api.get(`/api/sessions/${id}`),
};

// Payments API (Session-based only - PAY AFTER model)
export const paymentAPI = {
  // Create payment from completed session
  create: (sessionId) => api.post('/api/payment/create', { sessionId }),
  
  // Get payment details by session ID
  getBySession: (sessionId) => api.get(`/api/payment/session/${sessionId}`),
  
  // Get payment details by payment ID
  getById: (paymentId) => api.get(`/api/payment/${paymentId}`),
};

// Vehicles API
export const vehiclesAPI = {
  getAll: () => api.get('/api/vehicles'),
  getById: (id) => api.get(`/api/vehicles/${id}`),
  create: (vehicleData) => api.post('/api/vehicles', vehicleData),
  update: (id, vehicleData) => api.put(`/api/vehicles/${id}`, vehicleData),
  delete: (id) => api.delete(`/api/vehicles/${id}`),
  updateSOC: (id, soc) => api.put(`/api/vehicles/${id}/soc`, { soc }),
  setMain: (id) => api.put(`/api/vehicles/${id}/set-main`),
  getConnectorTypes: () => api.get('/api/vehicles/connectors/types'),
};

// Reviews API
export const reviewsAPI = {
  create: (reviewData) => api.post('/api/reviews', reviewData),
  getByStation: (stationId) => api.get(`/api/stations/${stationId}/reviews`),
};

// AI Recommendations API
export const aiAPI = {
  getRecommendations: (params) =>
    api.get('/api/ai/recommendations', { params }),
  explainRecommendation: (stationId, params) =>
    api.get(`/api/ai/recommendations/explain/${stationId}`, { params }),
};

// Booking API
export const bookingAPI = {
  // Create a new booking
  create: (bookingData) => api.post('/api/bookings', bookingData),

  // Get user's bookings
  getMyBookings: (params) => api.get('/api/bookings', { params }),

  // Get booking by ID
  getById: (id) => api.get(`/api/bookings/${id}`),

  // Extend booking expiry (for late arrivals)
  extend: (id, extension_minutes = 15) =>
    api.post(`/api/bookings/${id}/extend`, { extension_minutes }),

  // Cancel booking
  cancel: (id) => api.delete(`/api/bookings/${id}`),

  // Get available time slots for a connector
  getAvailableSlots: (connectorId, date) =>
    api.get(`/api/bookings/connector/${connectorId}/slots`, {
      params: { date },
    }),
};

// Rating API
export const ratingAPI = {
  // Create a new rating
  create: (ratingData) => api.post('/api/ratings', ratingData),

  // Get ratings for a station
  getStationRatings: (stationId, params) =>
    api.get(`/api/ratings/station/${stationId}`, { params }),

  // Get average rating for a station
  getStationAverage: (stationId) =>
    api.get(`/api/ratings/station/${stationId}/average`),

  // Get user's ratings
  getMyRatings: (params) => api.get('/api/ratings/my', { params }),

  // Check if user can rate a booking
  canRate: (bookingId) => api.get(`/api/ratings/can-rate/${bookingId}`),
};

// Session API (Charging Session Management)
export const sessionAPI = {
  // Start a charging session
  start: (bookingId) => api.post('/api/sessions/start', { bookingId }),

  // Finish a charging session
  finish: (sessionId, data) => api.post(`/api/sessions/${sessionId}/finish`, data),

  // Get session details by ID
  getById: (sessionId) => api.get(`/api/sessions/${sessionId}`),

  // Get user's sessions (with optional status filter)
  getMySessions: (status) => api.get('/api/sessions', { params: { status } }),

  // Get unpaid sessions
  getUnpaid: () => api.get('/api/sessions/unpaid'),

  // Check-in via QR code (Station-level)
  checkInQR: (data) => api.post('/api/sessions/checkin-qr', data),
};

export default api;
