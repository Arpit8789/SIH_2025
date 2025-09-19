const i18nConfig = {
  // LibreTranslate service configuration
  LIBRETRANSLATE_URL: process.env.LIBRETRANSLATE_URL || 'http://127.0.0.1:5000',
  
  // Supported languages (Hindi, English, Punjabi)
  SUPPORTED_LANGUAGES: ['en', 'hi', 'pa'],
  
  // Language names mapping
  LANGUAGE_NAMES: {
    'en': 'English',
    'hi': 'Hindi',
    'pa': 'Punjabi'
  },

  // Request configuration
  REQUEST_TIMEOUT: parseInt(process.env.TRANSLATION_TIMEOUT) || 30000, // 30 seconds
  MAX_BATCH_SIZE: parseInt(process.env.MAX_BATCH_SIZE) || 50,
  CONCURRENT_REQUESTS: parseInt(process.env.CONCURRENT_REQUESTS) || 5,

  // Retry configuration
  MAX_RETRIES: parseInt(process.env.MAX_RETRIES) || 3,
  RETRY_DELAY: parseInt(process.env.RETRY_DELAY) || 1000, // 1 second base delay

  // Rate limiting
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX) || 1000, // 1000 requests per window
    message: 'Too many translation requests, please try again later'
  },

  // Text processing limits
  MAX_TEXT_LENGTH: parseInt(process.env.MAX_TEXT_LENGTH) || 5000, // 5000 characters
  MIN_TEXT_LENGTH: 1,

  // LibreTranslate API endpoints
  ENDPOINTS: {
    TRANSLATE: '/translate',
    LANGUAGES: '/languages',
    DETECT: '/detect'
  },

  // Default values
  DEFAULTS: {
    SOURCE_LANGUAGE: 'auto',
    TARGET_LANGUAGE: 'en',
    FORMAT: 'text'
  },

  // Cache configuration (for future use)
  CACHE: {
    ENABLED: process.env.TRANSLATION_CACHE_ENABLED === 'true',
    TTL: parseInt(process.env.CACHE_TTL) || 3600, // 1 hour
    MAX_SIZE: parseInt(process.env.CACHE_MAX_SIZE) || 1000
  },

  // Logging configuration
  LOGGING: {
    ENABLED: process.env.NODE_ENV !== 'production',
    LOG_REQUESTS: process.env.LOG_TRANSLATION_REQUESTS === 'true',
    LOG_ERRORS: true
  },

  // Development helpers
  DEV_MODE: process.env.NODE_ENV === 'development',
  
  // Health check configuration
  HEALTH_CHECK: {
    ENABLED: true,
    TIMEOUT: 5000,
    INTERVAL: 60000 // Check every minute
  }
};

// Validation function for language codes
const isValidLanguageCode = (code) => {
  return i18nConfig.SUPPORTED_LANGUAGES.includes(code);
};

// Validation function for batch size
const isValidBatchSize = (size) => {
  return size > 0 && size <= i18nConfig.MAX_BATCH_SIZE;
};

// Validation function for text length
const isValidTextLength = (text) => {
  if (typeof text !== 'string') return false;
  return text.length >= i18nConfig.MIN_TEXT_LENGTH && text.length <= i18nConfig.MAX_TEXT_LENGTH;
};

// Get language name from code
const getLanguageName = (code) => {
  return i18nConfig.LANGUAGE_NAMES[code] || code;
};

// Build LibreTranslate URL for endpoint
const buildUrl = (endpoint) => {
  return `${i18nConfig.LIBRETRANSLATE_URL}${i18nConfig.ENDPOINTS[endpoint.toUpperCase()]}`;
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'production') {
  // Production optimizations
  i18nConfig.CONCURRENT_REQUESTS = 10;
  i18nConfig.MAX_BATCH_SIZE = 100;
  i18nConfig.RATE_LIMIT.maxRequests = 5000;
} else if (process.env.NODE_ENV === 'development') {
  // Development settings
  i18nConfig.CONCURRENT_REQUESTS = 3;
  i18nConfig.LOGGING.LOG_REQUESTS = true;
}

export {
  i18nConfig,
  isValidLanguageCode,
  isValidBatchSize,
  isValidTextLength,
  getLanguageName,
  buildUrl
};
