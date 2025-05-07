import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

// Token storage helpers
export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('authToken', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        localStorage.removeItem('authToken');
        delete axios.defaults.headers.common['Authorization'];
    }
};

export const getStoredToken = () => {
    return localStorage.getItem('authToken');
};

const getAxiosConfig = (token = null) => ({
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    }
});

/**
 * Login user
 * @param {Object} credentials - User credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} Response object
 */
export const login = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/login`, credentials, getAxiosConfig());
        if (response.data?.data?.token) {
            setAuthToken(response.data.data.token);
        }
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            code: error.response?.status || 500,
            message: error.response?.data?.message || "Failed to login"
        };
    }
};

/**
 * Register new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Response object
 */
export const register = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/signup`, userData, getAxiosConfig());
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            code: error.response?.status || 500,
            message: error.response?.data?.message || "Failed to register"
        };
    }
};

/**
 * Get current user data
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Response object
 */
export const getCurrentUser = async (token) => {
    try {
        const response = await axios.get(`${API_URL}/me`, getAxiosConfig(token));
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            code: error.response?.status || 500,
            message: error.response?.data?.message || "Failed to get current user"
        };
    }
};

/**
 * Logout user
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Response object
 */
export const logout = async (token) => {
    try {
        const response = await axios.post(`${API_URL}/logout`, {}, getAxiosConfig(token));
        setAuthToken(null); // Clear the token on logout
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            code: error.response?.status || 500,
            message: error.response?.data?.message || "Failed to logout"
        };
    }
};
