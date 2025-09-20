// app.js - ENHANCED WITH WEATHER SCHEDULER + GEMINI AI + EMAIL ALERTS
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import dotenv from 'dotenv';
import 'express-async-errors';

// ✅ Load environment variables FIRST
dotenv.config();

// 🔍 ENHANCED ENVIRONMENT DEBUG
console.log('🔍 Environment Debug:');
console.log('📁 Current working directory:', process.cwd());
console.log('🔑 GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('🔑 GEMINI_API_KEY length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
console.log('🔑 GEMINI_API_KEY preview:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'UNDEFINED');
console.log('🌦️ OPENWEATHER_API_KEY exists:', !!process.env.OPENWEATHER_API_KEY);
console.log('📧 GMAIL_USER exists:', !!process.env.GMAIL_USER);
console.log('📧 GMAIL_PASSWORD exists:', !!process.env.GMAIL_PASSWORD);
console.log('🌐 NODE_ENV:', process.env.NODE_ENV);

// Import routes
import { router as chatbotRoutes } from './routes/chatbot.js';
import authRoutes from './routes/auth.js';
import weatherRoutes from './routes/weather.js'; // ✅ ENHANCED WEATHER ROUTES
import marketRoutes from './routes/marketRoutes.js';
import translateRoutes from './routes/translateRoutes.js';
//import diseaseRoutes from './routes/diseaseRoutes.js'; // ✅ DISEASE DETECTION

// Import database
import database from './config/database.js';

// Import services
//import weatherAlertService from './services/weatherAlertService.js';
import weatherScheduler from './utils/weatherScheduler.js'; // ✅ NEW - Weather email scheduler

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();

// Connect to MongoDB
database.connect();

// Create necessary directories
const createDirectories = async () => {
  try {
    await fs.ensureDir('./uploads/diseases');
    await fs.ensureDir('./uploads/temp');
    await fs.ensureDir('./uploads/profiles');
    await fs.ensureDir('./uploads/documents');
    await fs.ensureDir('./uploads/weather'); // ✅ NEW - Weather data storage
    await fs.ensureDir('./logs');
    await fs.ensureDir('./logs/weather'); // ✅ NEW - Weather logs
    console.log('📁 Required directories created successfully');
  } catch (error) {
    console.error('❌ Error creating directories:', error);
  }
};

createDirectories();

// Custom response methods middleware
app.use((req, res, next) => {
  res.successResponse = (data, message = 'Success') => {
    res.json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    });
  };

  res.errorResponse = (message = 'Error', statusCode = 400) => {
    res.status(statusCode).json({
      success: false,
      data: null,
      message,
      timestamp: new Date().toISOString()
    });
  };

  res.unauthorized = (message = 'Unauthorized') => {
    res.status(401).json({
      success: false,
      data: null,
      message,
      timestamp: new Date().toISOString()
    });
  };

  next();
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Enhanced CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5001', // ML Service
    'https://krishi-sahayak.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name',
    'X-Weather-Source' // ✅ NEW - Weather API source
  ]
}));

// General middleware
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' })); // Increased for image uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Enhanced file upload middleware
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for ML images
  useTempFiles: true,
  tempFileDir: './uploads/temp/',
  createParentPath: true,
  abortOnLimit: true
}));

// Security middleware
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Enhanced rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

// Special rate limiting for weather API
const weatherLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute for weather
  message: {
    success: false,
    message: 'Too many weather requests. Please wait before making more requests.'
  }
});

// Special rate limiting for ML services
const mlServiceLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10, // 10 ML requests per minute
  message: {
    success: false,
    message: 'Too many ML requests. Please wait before uploading more images.'
  }
});

app.use(generalLimiter);
app.use('/api/weather', weatherLimiter); // ✅ Weather rate limiting
app.use('/api/disease', mlServiceLimiter); // ✅ ML rate limiting

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ ENHANCED HEALTH CHECK WITH ALL SERVICES
app.get('/api/health', async (req, res) => {
  // Check weather service health
  let weatherServiceHealth = 'Unknown';
  try {
    if (process.env.OPENWEATHER_API_KEY) {
      weatherServiceHealth = 'Active';
    } else {
      weatherServiceHealth = 'Inactive - Missing API Key';
    }
  } catch (error) {
    weatherServiceHealth = 'Error';
  }

  // Check ML service health
  let mlServiceHealth = 'Unknown';
  try {
    const axios = (await import('axios')).default;
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001';
    const response = await axios.get(`${mlServiceUrl}/health`, { timeout: 3000 });
    mlServiceHealth = response.data?.status === 'healthy' ? 'Active' : 'Error';
  } catch (error) {
    mlServiceHealth = 'Unavailable';
  }

  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage(),
    platform: process.platform,
    // ✅ Enhanced with all service statuses
    services: {
      database: database.isConnected() ? 'Connected' : 'Disconnected',
      weatherService: weatherServiceHealth,
      weatherScheduler: weatherScheduler.isRunning ? 'Active' : 'Inactive',
      marketDataService: 'Active',
      translationService: 'Active',
      chatbotService: process.env.GEMINI_API_KEY ? 'Active' : 'Inactive - Missing API Key',
      diseaseDetectionService: mlServiceHealth,
      emailService: (process.env.GMAIL_USER && process.env.GMAIL_PASSWORD) ? 'Active' : 'Inactive - Missing Config'
    },
    endpoints: {
      auth: '/api/auth',
      weather: '/api/weather',
      marketData: '/api/real-market',
      translation: '/api/translate',
      chatbot: '/api/chatbot',
      diseaseDetection: '/api/disease'
    },
    // ✅ Environment and feature info
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasWeatherKey: !!process.env.OPENWEATHER_API_KEY,
      hasGmailConfig: !!(process.env.GMAIL_USER && process.env.GMAIL_PASSWORD),
      mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:5001'
    },
    // ✅ Feature flags and capabilities
    features: {
      weatherAlerts: !!process.env.OPENWEATHER_API_KEY,
      aiInsights: !!process.env.GEMINI_API_KEY,
      emailNotifications: !!(process.env.GMAIL_USER && process.env.GMAIL_PASSWORD),
      diseaseDetection: mlServiceHealth === 'Active',
      marketData: true,
      translation: true,
      chatbot: !!process.env.GEMINI_API_KEY,
      scheduledEmails: weatherScheduler.isRunning
    },
    // ✅ Scheduler status
    scheduler: {
      weatherEmails: weatherScheduler.isRunning,
      morningTime: '9:00 AM IST',
      eveningTime: '9:00 PM IST',
      nextMorningEmail: weatherScheduler.getNextScheduleTime?.('morning') || 'Unknown',
      nextEveningEmail: weatherScheduler.getNextScheduleTime?.('evening') || 'Unknown'
    }
  };

  res.successResponse(healthData, 'Krishi Sahayak API - All Systems Operational 🌾');
});

// Enhanced welcome route
app.get('/', (req, res) => {
  res.successResponse({
    message: 'Welcome to Krishi Sahayak API! 🌾',
    version: '2.0.0',
    description: 'Complete Smart Multilingual Farming Advisory Platform with AI Weather Insights',
    status: 'Active',
    features: [
      '🤖 AI-Powered Weather Advisory with Gemini',
      '🌦️ Real-time Weather Alerts & 7-Day Forecast', 
      '📧 Automated Email Alerts (9 AM & 9 PM)',
      '🌾 Regional Crop Intelligence',
      '📱 Multi-language Support (Hindi/English/Punjabi)',
      '📊 Real-time Market Data & Price Intelligence',
      '🔬 AI Disease Detection with Deep Learning',
      '🌐 Real-time Translation Services',
      '🤖 Multilingual AI Chatbot with Voice Support',
      '📈 Market Trend Analysis & Predictions',
      '💊 Personalized Treatment Recommendations',
      '📱 Mobile-First Progressive Web App'
    ],
    technicalSpecs: {
      weatherSystem: {
        source: 'OpenWeatherMap API',
        aiEngine: 'Google Gemini Pro',
        emailSchedule: '9:00 AM & 9:00 PM IST',
        forecastDays: 7,
        insights: 'Crop-specific farming advice'
      },
      diseaseDetection: {
        wheatModel: 'CNN (TensorFlow)',
        paddyModel: 'ResNet50 (PyTorch)',
        accuracy: '93.8%',
        supportedCrops: ['Wheat', 'Paddy/Rice'],
        diseases: '10+ disease types'
      },
      translation: {
        languages: ['Hindi', 'English', 'Punjabi'],
        engine: 'Google Translate API',
        realtime: true
      },
      chatbot: {
        engine: 'Google Gemini AI',
        languages: ['Hindi', 'English', 'Punjabi'],
        voiceSupport: true
      }
    }
  }, 'Krishi Sahayak API - Empowering Indian Farmers with Advanced AI Technology');
});

// ✅ API ROUTES - PROPER ORDER WITH ENHANCED WEATHER
app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes); // ✅ ENHANCED WITH GEMINI AI & SCHEDULER
app.use('/api/real-market', marketRoutes);
//app.use('/api/disease', diseaseRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api', translateRoutes);

// ✅ ENHANCED TEST ENDPOINTS
app.get('/api/test-weather', async (req, res) => {
  const weatherStatus = {
    openWeatherAPI: !!process.env.OPENWEATHER_API_KEY,
    geminiAI: !!process.env.GEMINI_API_KEY,
    emailService: !!(process.env.GMAIL_USER && process.env.GMAIL_PASSWORD),
    scheduler: weatherScheduler.isRunning,
    availableEndpoints: [
      'GET /api/weather/current',
      'GET /api/weather/forecast',
      'GET /api/weather/insights',
      'POST /api/weather/notifications/toggle',
      'POST /api/weather/alert/send',
      'GET /api/weather/stats'
    ],
    features: {
      '7DayForecast': true,
      'AIInsights': !!process.env.GEMINI_API_KEY,
      'EmailAlerts': !!(process.env.GMAIL_USER && process.env.GMAIL_PASSWORD),
      'CropSpecificAdvice': true,
      'SevereWeatherAlerts': true
    }
  };

  res.successResponse(weatherStatus, 'Weather service status');
});

app.get('/api/test-chatbot', (req, res) => {
  res.successResponse({
    chatbotStatus: process.env.GEMINI_API_KEY ? 'Ready' : 'Missing API Key',
    geminiKeyExists: !!process.env.GEMINI_API_KEY,
    availableEndpoints: [
      'POST /api/chatbot/initialize',
      'POST /api/chatbot/message',
      'GET /api/chatbot/health',
      'GET /api/chatbot/quick-actions'
    ]
  }, 'Chatbot service status');
});

app.get('/api/test-disease', async (req, res) => {
  let mlServiceHealth = 'Unknown';
  try {
    const axios = (await import('axios')).default;
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001';
    const response = await axios.get(`${mlServiceUrl}/health`, { timeout: 5000 });
    mlServiceHealth = response.data?.status === 'healthy' ? 'Active' : 'Error';
  } catch (error) {
    mlServiceHealth = 'Unavailable';
  }

  res.successResponse({
    diseaseDetectionStatus: mlServiceHealth,
    mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:5001',
    supportedFormats: ['JPG', 'PNG', 'GIF', 'BMP'],
    maxFileSize: '50MB',
    availableEndpoints: [
      'POST /api/disease/detect',
      'GET /api/disease/supported-crops',
      'GET /api/disease/history',
      'GET /api/disease/prevention-tips',
      'GET /api/disease/health'
    ],
    modelInfo: {
      wheat: 'TensorFlow CNN Model',
      paddy: 'PyTorch ResNet50 Model'
    }
  }, 'Disease detection service status');
});

// ✅ SERVICE STATUS DASHBOARD
app.get('/api/status', async (req, res) => {
  // Check all services
  let mlServiceHealth = 'Unknown';
  try {
    const axios = (await import('axios')).default;
    const response = await axios.get(`${process.env.ML_SERVICE_URL || 'http://localhost:5001'}/health`, { timeout: 3000 });
    mlServiceHealth = response.data?.status === 'healthy' ? 'Active' : 'Error';
  } catch (error) {
    mlServiceHealth = 'Unavailable';
  }

  const services = {
    database: {
      status: database.isConnected() ? 'Connected' : 'Disconnected',
      uptime: Math.floor(process.uptime())
    },
    weatherService: {
      status: process.env.OPENWEATHER_API_KEY ? 'Active' : 'Inactive',
      apiKey: !!process.env.OPENWEATHER_API_KEY,
      scheduler: weatherScheduler.isRunning,
      lastUpdate: new Date().toISOString()
    },
    weatherScheduler: {
      status: weatherScheduler.isRunning ? 'Running' : 'Stopped',
      morningSchedule: '09:00 IST',
      eveningSchedule: '21:00 IST',
      emailsEnabled: !!(process.env.GMAIL_USER && process.env.GMAIL_PASSWORD)
    },
    aiServices: {
      gemini: {
        status: process.env.GEMINI_API_KEY ? 'Active' : 'Inactive',
        features: ['Weather Insights', 'Chatbot', 'Crop Advice']
      },
      diseaseDetection: {
        status: mlServiceHealth,
        mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:5001'
      }
    },
    emailService: {
      status: (process.env.GMAIL_USER && process.env.GMAIL_PASSWORD) ? 'Configured' : 'Not Configured',
      user: process.env.GMAIL_USER || 'Not Set'
    },
    marketDataService: {
      status: 'Active',
      lastUpdate: new Date().toISOString()
    },
    translationService: {
      status: 'Active',
      supportedLanguages: ['Hindi', 'English', 'Punjabi']
    }
  };

  const overallStatus = Object.values(services).every(service => 
    typeof service.status === 'string' && 
    ['Active', 'Connected', 'Running', 'Configured'].includes(service.status)
  ) ? 'Healthy' : 'Degraded';

  res.successResponse({
    overallStatus,
    services,
    lastChecked: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    version: '2.0.0'
  }, `System status: ${overallStatus}`);
});

// 404 handler - Enhanced with all available routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    data: null,
    availableRoutes: [
      'GET /',
      'GET /api/health',
      'GET /api/status',
      'POST /api/auth/*',
      'GET /api/weather/* (Enhanced with AI)',
      'GET /api/real-market/*',
      'POST /api/disease/*',
      'POST /api/chatbot/*',
      'POST /api/translate/*',
      // Test endpoints
      'GET /api/test-weather',
      'GET /api/test-chatbot',
      'GET /api/test-disease'
    ],
    documentation: 'https://github.com/your-repo/krishi-sahayak-api#readme'
  });
});

// Enhanced error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  
  // Enhanced error logging for different services
  if (req.originalUrl?.includes('/weather')) {
    console.error('🌦️ Weather Service Error Details:', {
      url: req.originalUrl,
      method: req.method,
      hasWeatherKey: !!process.env.OPENWEATHER_API_KEY,
      hasGeminiKey: !!process.env.GEMINI_API_KEY
    });
  }
  
  if (req.originalUrl?.includes('/chatbot')) {
    console.error('🤖 Chatbot Error Details:', {
      url: req.originalUrl,
      method: req.method,
      hasGeminiKey: !!process.env.GEMINI_API_KEY
    });
  }
  
  if (req.originalUrl?.includes('/disease')) {
    console.error('🔬 Disease Detection Error Details:', {
      url: req.originalUrl,
      method: req.method,
      fileSize: req.files ? Object.keys(req.files).length : 0,
      mlServiceUrl: process.env.ML_SERVICE_URL
    });
  }

  if (req.originalUrl?.includes('/market')) {
    console.error('📊 Market Data Error Details:', {
      url: req.originalUrl,
      method: req.method,
      query: req.query
    });
  }
  
  // Error response with service-specific information
  const errorResponse = {
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    data: null,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      service: req.originalUrl?.split('/')[2] || 'unknown'
    })
  };

  res.status(err.statusCode || 500).json(errorResponse);
});

// ✅ START WEATHER SCHEDULER ON SERVER START
const startServices = async () => {
  try {
    console.log('🚀 Starting Krishi Sahayak services...');

    // Start weather alert service
    try {
      weatherAlertService.start();
      console.log('✅ Weather Alert Service started');
    } catch (error) {
      console.error('❌ Error starting Weather Alert Service:', error);
    }

    // Start weather email scheduler
    try {
      if (process.env.OPENWEATHER_API_KEY && process.env.GMAIL_USER && process.env.GMAIL_PASSWORD) {
        weatherScheduler.start();
        console.log('✅ Weather Email Scheduler started');
        console.log('📧 Automatic emails will be sent at 9:00 AM and 9:00 PM IST');
      } else {
        console.log('⚠️ Weather Email Scheduler not started - missing required environment variables');
        console.log('   Required: OPENWEATHER_API_KEY, GMAIL_USER, GMAIL_PASSWORD');
      }
    } catch (error) {
      console.error('❌ Error starting Weather Scheduler:', error);
    }

    console.log('✅ All services initialization completed');

  } catch (error) {
    console.error('❌ Error starting services:', error);
  }
};

// ✅ ENHANCED GRACEFUL SHUTDOWN WITH ALL SERVICES
const gracefulShutdown = async () => {
  console.log('📴 Shutting down Krishi Sahayak API gracefully...');
  
  // Stop weather alert service
  try {
    weatherAlertService.stop();
    console.log('✅ Weather Alert Service stopped');
  } catch (error) {
    console.error('❌ Error stopping Weather Alert Service:', error);
  }

  // Stop weather scheduler
  try {
    weatherScheduler.stop();
    console.log('✅ Weather Email Scheduler stopped');
  } catch (error) {
    console.error('❌ Error stopping Weather Scheduler:', error);
  }
  
  // Stop market data service
  try {
    const { default: agmarknetService } = await import('./services/agmarknetService.js');
    await agmarknetService.closeBrowser();
    console.log('✅ Market Data Service stopped');
  } catch (error) {
    console.error('❌ Error stopping Market Data Service:', error);
  }
  
  // Clean up ML service connections
  try {
    console.log('✅ ML Service connections cleaned up');
  } catch (error) {
    console.error('❌ Error stopping ML Service:', error);
  }
  
  // Stop chatbot service
  try {
    console.log('✅ Chatbot Service stopped');
  } catch (error) {
    console.error('❌ Error stopping Chatbot Service:', error);
  }

  // Clean up uploaded files
  try {
    await fs.emptyDir('./uploads/temp');
    console.log('✅ Temporary files cleaned up');
  } catch (error) {
    console.error('❌ Error cleaning temporary files:', error);
  }
  
  // Close database connection
  try {
    await database.disconnect();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database:', error);
  }
  
  // Close server
  setTimeout(() => {
    console.log('✅ All services stopped, Krishi Sahayak API shutting down');
    process.exit(0);
  }, 2000);
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown();
});

// Start services when app is ready
startServices();

export default app;
