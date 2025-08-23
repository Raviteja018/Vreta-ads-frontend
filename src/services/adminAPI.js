import axios from 'axios';
import { API_CONFIG } from '../config';

const adminAPI = {
  // Get dashboard analytics
  getAnalytics: async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/admin/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get clients with pagination
  getClients: async (page = 1, limit = 10) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/admin/clients?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get agencies with pagination
  getAgencies: async (page = 1, limit = 10) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/admin/agencies?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get advertisements with pagination
  getAdvertisements: async (page = 1, limit = 10) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/admin/advertisements?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get applications with pagination
  getApplications: async (page = 1, limit = 10) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/admin/applications?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Approve/Reject client
  approveClient: async (clientId, action) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.patch(`${API_CONFIG.BASE_URL}/admin/clients/${clientId}/approve`, 
        { action },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Approve/Reject agency
  approveAgency: async (agencyId, action) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.patch(`${API_CONFIG.BASE_URL}/admin/agencies/${agencyId}/approve`, 
        { action },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Edit advertisement
  editAdvertisement: async (adId, updateData) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(`${API_CONFIG.BASE_URL}/advertisements/${adId}`, 
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Edit application
  editApplication: async (appId, updateData) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.patch(`${API_CONFIG.BASE_URL}/applications/${appId}`, 
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Edit agency
  editAgency: async (agencyId, updateData) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(`${API_CONFIG.BASE_URL}/admin/agencies/${agencyId}`, 
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Edit client
  editClient: async (clientId, updateData) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(`${API_CONFIG.BASE_URL}/admin/clients/${clientId}`, 
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get recent activity
  getRecentActivity: async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/admin/recent-activity`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default adminAPI;
