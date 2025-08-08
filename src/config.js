// API Configuration
export const API_CONFIG = {
  // Base URL for all API requests
  BASE_URL: 'http://localhost:3000/api/v1',

  // Endpoints for different features
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      ME: '/auth/me',
    },
    ADVERTISEMENTS: '/advertisements',
    APPLICATIONS: '/applications',
    PROJECTS: '/projects'
  },
  
  // Get full URL for an endpoint
  getUrl: function(endpoint) {
    return `${this.BASE_URL}${endpoint}`;
  },
  
  // Get auth headers
  getAuthHeaders: () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }
};


