import axios from 'axios';

// Ensure we always use http (not https) and include /api prefix
const getBaseURL = () => {
  const envURL = import.meta.env.VITE_API_URL;
  if (envURL) {
    // Ensure it doesn't have https and has /api
    return envURL.replace(/^https?:\/\//, 'http://').replace(/\/api$/, '') + '/api';
  }
  return 'http://localhost:5001/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log API configuration in development
if (import.meta.env.DEV) {
  console.log('🔗 API Base URL:', api.defaults.baseURL);
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
    // Suppress 401 errors in console for /auth/me endpoint
    // These are expected when user is not logged in
    if (error.response?.status === 401 && error.config?.url?.includes('/auth/me')) {
      // Silently handle - don't log to console
      return Promise.reject(error);
    }
    
    // Handle 403 Forbidden - user doesn't have permission
    if (error.response?.status === 403) {
      const errorMessage = error.response?.data?.message || 'Access denied';
      // Only show error if not already on login page
      if (window.location.pathname !== '/login') {
        console.warn('403 Forbidden:', errorMessage);
        // If user is trying to access admin routes but isn't admin, redirect
        if (window.location.pathname.startsWith('/admin')) {
          // AdminRoute component will handle the redirect
        }
      }
    }
    
    // Don't auto-redirect on 401 - let components handle it
    // This prevents infinite redirect loops
    // Components like ProtectedRoute and AdminRoute will handle navigation
    return Promise.reject(error);
  }
);

export default api;

