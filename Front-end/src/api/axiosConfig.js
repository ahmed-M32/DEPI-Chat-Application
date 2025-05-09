import axios from 'axios';
import { getStoredToken } from './auth';

const API_URL = 'https://depi-back-production-fb68.up.railway.app/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});


axiosInstance.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {

      config.headers['Authorization'] = `Bearer ${token}`;

      config.headers['X-Auth-Token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {

    return Promise.reject(error);
  }
);

export default axiosInstance;
