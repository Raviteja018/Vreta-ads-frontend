const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/signup',
      LOGIN: '/login',
      LOGOUT: '/logout',
      ME: '/me',
    },
    ADVERTISEMENTS: '/advertisements',
    APPLICATIONS: '/applications',
    PROJECTS: '/projects',
    USERS: '/users',
  },
};

export default API_CONFIG;
