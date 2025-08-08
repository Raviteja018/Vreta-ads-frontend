import axios from 'axios';
import { API_CONFIG } from '../config';

// Create a new axios instance with a custom configuration
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // This is important for sending cookies with cross-origin requests
});



// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response ? error.response.data : error.message);
    // Return the error response from the API to be handled by the calling function
    return Promise.reject(error.response ? error.response.data : error);
  }
);

// --- API Service Definitions ---



// Advertisement endpoints
export const advertisementAPI = {
  getAll: () => api.get(API_CONFIG.ENDPOINTS.ADVERTISEMENTS),
  getById: (id) => api.get(`${API_CONFIG.ENDPOINTS.ADVERTISEMENTS}/${id}`),
  create: (formData) => api.post(API_CONFIG.ENDPOINTS.ADVERTISEMENTS, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  update: (id, formData) => api.put(`${API_CONFIG.ENDPOINTS.ADVERTISEMENTS}/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  delete: (id) => api.delete(`${API_CONFIG.ENDPOINTS.ADVERTISEMENTS}/${id}`),
};

// Application endpoints
export const applicationAPI = {
  create: (appData) => api.post(API_CONFIG.ENDPOINTS.APPLICATIONS, appData),
  getByAdvertisementId: (adId) => api.get(`${API_CONFIG.ENDPOINTS.APPLICATIONS}/advertisement/${adId}`),
  getByClient: () => api.get(`${API_CONFIG.ENDPOINTS.APPLICATIONS}/client`),
  getByAgency: () => api.get(`${API_CONFIG.ENDPOINTS.APPLICATIONS}/agency`),
  updateStatus: (id, status) => api.patch(`${API_CONFIG.ENDPOINTS.APPLICATIONS}/${id}`, { status }),
  getById: (id) => api.get(`${API_CONFIG.ENDPOINTS.APPLICATIONS}/${id}`),
};

// Projects API
export const projectAPI = {
  getAll: () => api.get(API_CONFIG.ENDPOINTS.PROJECTS),
  getById: (id) => api.get(`${API_CONFIG.ENDPOINTS.PROJECTS}/${id}`),
  create: (data) => api.post(API_CONFIG.ENDPOINTS.PROJECTS, data),
  update: (id, data) => api.put(`${API_CONFIG.ENDPOINTS.PROJECTS}/${id}`, data),
  delete: (id) => api.delete(`${API_CONFIG.ENDPOINTS.PROJECTS}/${id}`),
};

export default api;
