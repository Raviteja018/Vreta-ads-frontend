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
  getAll: () => {
    const token = localStorage.getItem('token');
    console.log('API getAll called with token:', token ? 'Present' : 'Missing');
    console.log('API endpoint:', API_CONFIG.ENDPOINTS.ADVERTISEMENTS);
    return api.get(API_CONFIG.ENDPOINTS.ADVERTISEMENTS, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
  },
  getPublic: () => {
    // Get public advertisements without authentication
    return api.get(`${API_CONFIG.ENDPOINTS.ADVERTISEMENTS}/public`);
  },
  getById: (id) => api.get(`${API_CONFIG.ENDPOINTS.ADVERTISEMENTS}/${id}`),
  create: (formData) => {
    const token = localStorage.getItem('token');
    return api.post(API_CONFIG.ENDPOINTS.ADVERTISEMENTS, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
    });
  },
  update: (id, formData) => {
    const token = localStorage.getItem('token');
    return api.put(`${API_CONFIG.ENDPOINTS.ADVERTISEMENTS}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
    });
  },
  updateStatus: (id, status) => {
    const token = localStorage.getItem('token');
    return api.patch(`${API_CONFIG.ENDPOINTS.ADVERTISEMENTS}/${id}/status`, { status }, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
  },
  delete: (id) => {
    const token = localStorage.getItem('token');
    return api.delete(`${API_CONFIG.ENDPOINTS.ADVERTISEMENTS}/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
  },
};

// Application endpoints
export const applicationAPI = {
  create: (appData) => {
    const token = localStorage.getItem('token');
    return api.post(API_CONFIG.ENDPOINTS.APPLICATIONS, appData, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
  },
  getByAdvertisementId: (adId) => api.get(`${API_CONFIG.ENDPOINTS.APPLICATIONS}/advertisement/${adId}`),
  getByClient: () => {
    const token = localStorage.getItem('token');
    return api.get(`${API_CONFIG.ENDPOINTS.APPLICATIONS}/client`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
  },
  getByAgency: () => {
    const token = localStorage.getItem('token');
    return api.get(`${API_CONFIG.ENDPOINTS.APPLICATIONS}/agency`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
  },
  updateStatus: (id, status) => {
    const token = localStorage.getItem('token');
    return api.patch(`${API_CONFIG.ENDPOINTS.APPLICATIONS}/${id}`, { status }, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
  },
          refreshAll: () => {
          const token = localStorage.getItem('token');
          return api.get(`${API_CONFIG.ENDPOINTS.APPLICATIONS}/refresh/all-applications`, {
            headers: {
              'Authorization': `Bearer ${token}`
            },
          });
        },
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
