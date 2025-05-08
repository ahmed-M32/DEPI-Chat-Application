import axios from 'axios';
import { getStoredToken } from './auth';

const API_URL = 'https://depi-back-production-fb68.up.railway.app/api';

// Create axios instance with withCredentials set to true to send cookies with every request
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // This ensures cookies are sent with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in a custom header as a fallback
// This way, if cookies aren't working, the backend can still authenticate using this header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      // Add token to Authorization header for better compatibility
      config.headers['Authorization'] = `Bearer ${token}`;
      // Also add to custom header as fallback
      config.headers['X-Auth-Token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle authentication errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't handle 401 errors here, let the components handle them
    // This prevents automatic logout on network errors
    return Promise.reject(error);
  }
);

export default axiosInstance;
