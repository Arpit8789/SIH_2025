// src/utils/constants.js
// API-based constants - NO static data, all from backend
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    LOGOUT: '/auth/logout',
  },

  // Farmer endpoints
  FARMER: {
    PROFILE: '/farmer/profile',
    CROP_RECOMMENDATIONS: '/farmer/crop-recommendations',
    WEATHER_ALERTS: '/farmer/weather-alerts',
    MARKET_PRICES: '/farmer/market-prices',
    DISEASE_HISTORY: '/farmer/disease-history',
    SCHEMES: '/farmer/schemes',
  },

  // Buyer endpoints
  BUYER: {
    PROFILE: '/buyer/profile',
    SEARCH_FARMERS: '/buyer/search-farmers',
    AVAILABLE_CROPS: '/buyer/available-crops',
    PURCHASE_ORDERS: '/buyer/purchase-orders',
    PURCHASE_HISTORY: '/buyer/purchase-history',
    MARKET_TRENDS: '/buyer/market-trends',
  },

  // General endpoints
  CROPS: '/crops',
  MARKET: '/market',
  WEATHER: '/weather',
  AI: '/ai',
  SCHEMES: '/schemes',
  FEEDBACK: '/feedback',
};

// App configuration from environment
export const APP_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Krishi Sahayak',
  ENABLE_VOICE: import.meta.env.VITE_ENABLE_VOICE === 'true',
  ENABLE_TRANSLATIONS: import.meta.env.VITE_ENABLE_TRANSLATIONS === 'true',
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
};

// Status constants from backend
export const STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  LOADING: 'loading',
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// User roles from backend
export const USER_ROLES = {
  FARMER: 'farmer',
  BUYER: 'buyer',
  ADMIN: 'admin',
};

// Crop categories - will be fetched from backend
export const CROP_CATEGORIES = {
  CEREALS: 'cereals',
  PULSES: 'pulses',
  VEGETABLES: 'vegetables',
  FRUITS: 'fruits',
  SPICES: 'spices',
  OILSEEDS: 'oilseeds',
};

// Seasons from backend
export const SEASONS = {
  KHARIF: 'kharif',
  RABI: 'rabi',
  ZAID: 'zaid',
  PERENNIAL: 'perennial',
};

// Weather alert severity from backend
export const WEATHER_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// Price trends from backend
export const PRICE_TRENDS = {
  RISING: 'rising',
  FALLING: 'falling',
  STABLE: 'stable',
};

// File upload limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'krishi_token',
  REFRESH_TOKEN: 'krishi_refresh_token',
  USER: 'krishi_user',
  LANGUAGE: 'krishi_language',
  THEME: 'krishi_theme',
  PREFERENCES: 'krishi_preferences',
};

// Animation durations
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

// Breakpoints for responsive design
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
};
