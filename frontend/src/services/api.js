// src/services/api.js
import axios from 'axios';
import { storage } from '@utils/storage';
import toast from 'react-hot-toast';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const TIMEOUT = 30000; // 30 seconds

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracking
    config.metadata = {
      requestId: `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      startTime: Date.now(),
    };

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request [${config.metadata.requestId}]:`, {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling responses and errors
apiClient.interceptors.response.use(
  (response) => {
    const requestId = response.config.metadata?.requestId;
    const duration = Date.now() - (response.config.metadata?.startTime || 0);

    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response [${requestId}]:`, {
        status: response.status,
        duration: `${duration}ms`,
        data: response.data,
      });
    }

    // Return response data directly
    return response.data;
  },
  async (error) => {
    const requestId = error.config?.metadata?.requestId;
    const duration = Date.now() - (error.config?.metadata?.startTime || 0);

    // Log error in development
    if (import.meta.env.DEV) {
      console.error(`❌ API Error [${requestId}]:`, {
        status: error.response?.status,
        duration: `${duration}ms`,
        message: error.response?.data?.message || error.message,
      });
    }

    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - try to refresh token
          if (!error.config._retry) {
            error.config._retry = true;
            
            try {
              const refreshToken = storage.getRefreshToken();
              if (refreshToken) {
                const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
                  refreshToken,
                });

                if (response.data.success) {
                  storage.setToken(response.data.data.tokens.accessToken);
                  return apiClient(error.config);
                }
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
            }
          }

          // Clear auth and redirect to login
          storage.clearAuth();
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
          break;

        case 403:
          toast.error('Access denied. You don\'t have permission to perform this action.');
          break;

        case 404:
          toast.error('The requested resource was not found.');
          break;

        case 429:
          toast.error('Too many requests. Please try again later.');
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          toast.error('Server error. Please try again later.');
          break;

        default:
          toast.error(data?.message || 'An unexpected error occurred.');
      }

      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your internet connection.');
      return Promise.reject({
        success: false,
        message: 'Network error. Please check your internet connection.',
      });
    } else {
      // Other errors
      toast.error('An unexpected error occurred.');
      return Promise.reject({
        success: false,
        message: error.message || 'An unexpected error occurred.',
      });
    }
  }
);

// API utility functions
export const api = {
  // GET request
  get: (url, config = {}) => {
    return apiClient.get(url, config);
  },

  // POST request
  post: (url, data = {}, config = {}) => {
    return apiClient.post(url, data, config);
  },

  // PUT request
  put: (url, data = {}, config = {}) => {
    return apiClient.put(url, data, config);
  },

  // PATCH request
  patch: (url, data = {}, config = {}) => {
    return apiClient.patch(url, data, config);
  },

  // DELETE request
  delete: (url, config = {}) => {
    return apiClient.delete(url, config);
  },

  // Upload file
  upload: (url, formData, config = {}) => {
    return apiClient.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers,
      },
    });
  },

  // Download file
  download: (url, config = {}) => {
    return apiClient.get(url, {
      ...config,
      responseType: 'blob',
    });
  },
};

// Export axios instance for advanced usage
export { apiClient };
export default api;
