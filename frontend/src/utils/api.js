import axios from 'axios';

/**
 * API Base URL Configuration
 * 
 * Development: Uses Vite proxy - /api requests are proxied to http://localhost:5001
 * Production: Uses relative URL - /api requests are proxied by Nginx to backend server
 * 
 * You can override with VITE_API_URL environment variable for custom deployments
 */
const getBaseURL = () => {
  // Check for custom API URL (useful for staging, testing, or custom deployments)
  const customApiUrl = import.meta.env.VITE_API_URL;
  
  if (customApiUrl) {
    // If custom URL is provided, use it (ensure it ends with /api)
    return customApiUrl.endsWith('/api') 
      ? customApiUrl 
      : `${customApiUrl.replace(/\/$/, '')}/api`;
  }
  
  // Default: Use relative URL (works with Vite proxy in dev, Nginx proxy in production)
  // In development: Vite's proxy will forward /api -> http://localhost:5001
  // In production: Nginx will forward /api -> backend server (e.g., http://localhost:5001)
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // Required for cookies/auth tokens
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for API requests
});

// Log API configuration in development
if (import.meta.env.DEV) {
  console.log('🔗 API Base URL:', api.defaults.baseURL);
  console.log('🌐 Environment:', import.meta.env.MODE);
  console.log('📝 Custom API URL:', import.meta.env.VITE_API_URL || 'Not set (using default)');
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors (no response from server)
    if (!error.response) {
      console.error('🌐 Network Error:', error.message);
      // Could show a user-friendly message here
      return Promise.reject({
        ...error,
        message: 'Network error. Please check your connection and try again.',
      });
    }

    // Suppress 401 errors in console for /auth/me endpoint
    // These are expected when user is not logged in
    if (error.response?.status === 401 && error.config?.url?.includes('/auth/me')) {
      return Promise.reject(error);
    }
    
    // Handle 403 Forbidden - user doesn't have permission
    if (error.response?.status === 403) {
      const errorMessage = error.response?.data?.message || 'Access denied';
      if (window.location.pathname !== '/login') {
        console.warn('403 Forbidden:', errorMessage);
        if (window.location.pathname.startsWith('/admin')) {
          // AdminRoute component will handle the redirect
        }
      }
    }

    // Handle 500/502/503 server errors
    if ([500, 502, 503, 504].includes(error.response?.status)) {
      console.error('🔴 Server Error:', error.response.status, error.response?.data?.message || 'Internal server error');
      // Could show a user-friendly message here
    }
    
    // Don't auto-redirect on 401 - let components handle it
    // This prevents infinite redirect loops
    // Components like ProtectedRoute and AdminRoute will handle navigation
    return Promise.reject(error);
  }
);

export default api;

