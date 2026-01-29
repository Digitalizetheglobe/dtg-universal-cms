// API Base URL Configuration
// Default: https://api.harekrishnavidya.org
// To use local backend, set: VITE_API_BASE_URL=http://localhost:5000
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://api.harekrishnavidya.org';

// Helper: normalize asset/image URLs coming from the backend (handles relative URLs,
// localhost URLs saved from local dashboards, protocol mismatch, and /uploads vs /api/uploads)
export const normalizeImageUrl = (rawUrl, baseUrl = API_BASE_URL) => {
  const trimmed = (rawUrl || '').toString().trim();
  if (!trimmed) return trimmed;
  if (/^data:/i.test(trimmed)) return trimmed;

  let baseOrigin = baseUrl;
  let baseHost = null;
  let baseProtocol = null;
  try {
    const base = new URL(baseUrl);
    baseOrigin = base.origin;
    baseHost = base.hostname;
    baseProtocol = base.protocol;
  } catch {
    // keep baseUrl as-is if it's not a valid URL
  }

  const rewriteUploadsPath = (path) => {
    if (!path) return path;
    // Prefer /api/uploads so it works behind proxies forwarding only /api/*
    if (path.startsWith('/uploads/')) return `/api${path}`;
    return path;
  };

  // Absolute URL
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const u = new URL(trimmed);
      const nextPath = rewriteUploadsPath(u.pathname);

      // If stored as absolute localhost URL, rewrite to current API base origin
      if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
        return `${baseOrigin}${nextPath}${u.search}`;
      }

      // Fix mixed-content / protocol mismatch on same host
      if (baseHost && baseProtocol && u.hostname === baseHost && u.protocol !== baseProtocol) {
        return `${baseOrigin}${nextPath}${u.search}`;
      }

      // Only rewrite path; keep original origin
      if (nextPath !== u.pathname) {
        return `${u.protocol}//${u.host}${nextPath}${u.search}`;
      }

      return trimmed;
    } catch {
      return trimmed;
    }
  }

  // Relative path -> make it absolute from API origin
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${baseOrigin}${rewriteUploadsPath(path)}`;
};

// Helper function to build API URLs
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Common base used by most backend routes in this project
export const API_BASE_URL_API = getApiUrl('api');

export default {
  API_BASE_URL,
  API_BASE_URL_API,
  normalizeImageUrl,
  getApiUrl
};

