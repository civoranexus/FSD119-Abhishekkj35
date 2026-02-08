import axios from 'axios';

// Vite environment variable `VITE_API_URL` may or may not include the `/api` path.
// The code below normalizes it so either form works:
// - VITE_API_URL=https://your-backend.onrender.com
// - VITE_API_URL=https://your-backend.onrender.com/api
const rawApiUrl = import.meta.env.VITE_API_URL;
const API_BASE_URL = rawApiUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : rawApiUrl.replace(/\/+$/, '') + '/api')
  : 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('401 Unauthorized - clearing auth data');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
      
      // Only redirect if NOT already on login page
      if (!window.location.pathname.includes('/login')) {
        console.log('Redirecting to login from:', window.location.pathname);
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================
export const authService = {
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
  register: (data) =>
    apiClient.post('/auth/register', data),
  getCurrentUser: () =>
    apiClient.get('/auth/me'),
};

// ==================== APPOINTMENTS API ====================
export const appointmentService = {
  bookAppointment: (data) =>
    apiClient.post('/appointments', data),
  getMyAppointments: () =>
    apiClient.get('/appointments'),
  updateAppointmentStatus: (id, status) =>
    apiClient.patch(`/appointments/${id}/status`, { status }),
  getAvailableDoctors: () =>
    apiClient.get('/appointments/doctors/available'),
  setAvailability: (slots) =>
    apiClient.patch('/appointments/availability', { availabilitySlots: slots }),
};

// ==================== CONSULTATION API ====================
export const consultationService = {
  initiateSession: (appointmentId) =>
    apiClient.post('/consultations/initiate', { appointmentId }),
  startSession: (sessionId) =>
    apiClient.post(`/consultations/${sessionId}/start`, {}),
  endSession: (sessionId) =>
    apiClient.post(`/consultations/${sessionId}/end`, {}),
  getSession: (sessionId) =>
    apiClient.get(`/consultations/${sessionId}`),
  getUserSessions: () =>
    apiClient.get('/consultations'),
  getSessionToken: (sessionId) =>
    apiClient.get(`/consultations/${sessionId}/token`),
};

// ==================== EHR API ====================
export const ehrService = {
  createEHR: (data) =>
    apiClient.post('/ehr', data),
  getMyEHRs: () =>
    apiClient.get('/ehr'),
  getEHRById: (ehrId) =>
    apiClient.get(`/ehr/${ehrId}`),
  updateEHR: (ehrId, data) =>
    apiClient.patch(`/ehr/${ehrId}`, data),
  getAccessLog: (ehrId) =>
    apiClient.get(`/ehr/${ehrId}/access-log`),
};

// ==================== PRESCRIPTION API ====================
export const prescriptionService = {
  issuePrescription: (data) =>
    apiClient.post('/prescriptions', data),
  getMyPrescriptions: () =>
    apiClient.get('/prescriptions'),
  getPrescriptionById: (prescriptionId) =>
    apiClient.get(`/prescriptions/${prescriptionId}`),
  verifyPrescription: (prescriptionId) =>
    apiClient.get(`/prescriptions/${prescriptionId}/verify`),
  revokePrescription: (prescriptionId) =>
    apiClient.patch(`/prescriptions/${prescriptionId}/revoke`, {}),
  completePrescription: (prescriptionId) =>
    apiClient.patch(`/prescriptions/${prescriptionId}/complete`, {}),
};

// ==================== REMINDERS API ====================
export const reminderService = {
  getMyReminders: () =>
    apiClient.get('/reminders'),
  acknowledgeReminder: (reminderId) =>
    apiClient.patch(`/reminders/${reminderId}/acknowledge`, {}),
  dismissReminder: (reminderId) =>
    apiClient.patch(`/reminders/${reminderId}/dismiss`, {}),
};

// ==================== ADMIN API ====================
export const adminService = {
  getUserStats: () =>
    apiClient.get('/analytics/users'),
  getDoctorUtilization: () =>
    apiClient.get('/analytics/doctors/utilization'),
  getAppointmentAnalytics: () =>
    apiClient.get('/analytics/appointments'),
  getSystemOverview: () =>
    apiClient.get('/analytics/overview'),
  getAuditLog: (page = 1, limit = 20) =>
    apiClient.get(`/analytics/audit-log?page=${page}&limit=${limit}`),
};

export default apiClient;
