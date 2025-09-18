// config/config.js - ES Modules Version (FIXED)
const config = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  chatAnywhereApiKey: process.env.CHATANYWHERE_API_KEY || '',
  
  // Weather Service Configuration
  weatherService: {
    provider: 'open-meteo', // or 'openweather' for fallback
    defaultTimezone: 'Asia/Kolkata',
    cacheTimeout: 30 * 60 * 1000, // 30 minutes
  },
  // Database Configuration
  database: {
    // ✅ FIXED - Use env vars first, fallback only if not provided
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_URI_PROD: process.env.MONGODB_URI_PROD,
    
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 30000,
    }
  },

  // JWT Configuration
  jwt: {
    JWT_SECRET: process.env.JWT_SECRET || 'krishi_sahayak_super_secret_key_2025',
    JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
    JWT_COOKIE_EXPIRE: process.env.JWT_COOKIE_EXPIRE || 30
  },

  // JWT shortcuts for easy access
  jwtSecret: process.env.JWT_SECRET || 'krishi_sahayak_super_secret_key_2025',
  jwtExpire: process.env.JWT_EXPIRE || '30d',

  // External API Keys
  apis: {
    WEATHER_API_KEY: process.env.WEATHER_API_KEY || '',
    WEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    GEMINI_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta',
  },

  // File Upload Configuration
  upload: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
    UPLOAD_DIR: './uploads',
    DISEASE_IMAGES_DIR: './uploads/diseases'
  },

  // Application Settings
  app: {
    APP_NAME: 'Krishi Sahayak',
    APP_VERSION: '1.0.0',
    APP_DESCRIPTION: 'Smart Multilingual Farming Advisory Platform',
    SUPPORTED_LANGUAGES: ['hi', 'en', 'pa'], // Hindi, English, Punjabi
    DEFAULT_LANGUAGE: 'hi',
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    CACHE_TTL: 3600, // 1 hour in seconds
  }
};

// Helper functions
config.isDevelopment = () => config.NODE_ENV === 'development';
config.isProduction = () => config.NODE_ENV === 'production';
config.isTest = () => config.NODE_ENV === 'test';

// ✅ FIXED - Smart URI selection based on actual env vars
config.getMongoURI = () => {
  // If production URI exists and we're in production, use it
  if (config.isProduction() && config.database.MONGODB_URI_PROD) {
    return config.database.MONGODB_URI_PROD;
  }
  
  // If development URI exists, use it
  if (config.database.MONGODB_URI) {
    return config.database.MONGODB_URI;
  }
  
  // If production URI exists as fallback, use it
  if (config.database.MONGODB_URI_PROD) {
    return config.database.MONGODB_URI_PROD;
  }
  
  // Final fallback (should never reach here with your setup)
  throw new Error('No MongoDB URI found in environment variables');
};

export default config;
