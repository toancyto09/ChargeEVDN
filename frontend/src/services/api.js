import axios from 'axios';

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
    // Chỉ redirect nếu có token (tức là user đang logged in)
    // Nếu đang ở trang login/register thì không redirect
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');
      const currentPath = window.location.pathname;

      // Chỉ redirect nếu user đã có token và KHÔNG đang ở login/register
      if (token && currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getProfile: () => api.get('/api/auth/me'),
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

// Payments API
export const paymentsAPI = {
  create: (bookingId) => api.post(`/api/payments/${bookingId}`),
  getStatus: (paymentId) => api.get(`/api/payments/${paymentId}/status`),
};

// Vehicles API
export const vehiclesAPI = {
  getAll: () => api.get('/api/vehicles'),
  create: (vehicleData) => api.post('/api/vehicles', vehicleData),
  update: (id, vehicleData) => api.put(`/api/vehicles/${id}`, vehicleData),
  delete: (id) => api.delete(`/api/vehicles/${id}`),
};

// Reviews API
export const reviewsAPI = {
  create: (reviewData) => api.post('/api/reviews', reviewData),
  getByStation: (stationId) => api.get(`/api/stations/${stationId}/reviews`),
};

export default api;
