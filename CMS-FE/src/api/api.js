// API Base URL Configuration
// For local development, use: http://localhost:5000
// For production, use: https://api.harekrishnavidya.org

// Check if we're in development mode (Vite sets this automatically)
const isDevelopment = import.meta.env.DEV;

// Use environment variable if set, otherwise default based on mode
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (isDevelopment ? 'http://localhost:5000' : 'https://api.harekrishnavidya.org');

// Helper function to build API URLs
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

export default {
  API_BASE_URL,
  getApiUrl
};

