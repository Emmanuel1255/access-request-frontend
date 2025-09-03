import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5555/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
      // Log successful responses in development
      if (import.meta.env.DEV) {
        console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
      }
      return response;
    },
    (error) => {
      // Handle different error scenarios
      if (error.response) {
        const { status, data } = error.response;
        
        // Log error in development
        if (import.meta.env.DEV) {
          console.error(`❌ API Error: ${status} - ${error.config?.url}`, data);
        }
        
        // Handle 401 - Unauthorized (token expired/invalid)
        if (status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          
          // Only redirect to login if not already on login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        
        // Handle 403 - Forbidden
        if (status === 403) {
          console.error('Access denied - insufficient permissions');
        }
        
        // Handle 404 - Not Found
        if (status === 404) {
          console.error('Resource not found');
        }
        
        // Handle 422 - Validation Error
        if (status === 422 && data.validationErrors) {
          console.error('Validation errors:', data.validationErrors);
        }
        
        // Handle 500+ - Server Errors
        if (status >= 500) {
          console.error('Server error - please try again later');
        }
      } else if (error.request) {
        // Network error (no response received)
        console.error('❌ Network error - check your connection');
      } else {
        // Request setup error
        console.error('❌ Request setup error:', error.message);
      }
      
      return Promise.reject(error);
    }
);

export default api;

export const checkApiHealth = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
        return { success: true, data: response.data };
    } catch (error) {
        return { 
            success: false, 
            error: error.message,
            details: error.response?.data || 'Connection failed'
        };
    }
};
