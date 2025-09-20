// app.js - Enhanced with Weather System + Market Data + Translation System + Chatbot
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

// 🔍 DEBUG ENVIRONMENT VARIABLES
console.log('🔍 Environment Debug:');
console.log('📁 Current working directory:', process.cwd());
console.log('🔑 GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('🔑 GEMINI_API_KEY length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
console.log('🔑 GEMINI_API_KEY preview:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'UNDEFINED');
console.log('📄 All GEMINI env keys:', Object.keys(process.env).filter(key => key.includes('GEMINI')));
console.log('🌐 NODE_ENV:', process.env.NODE_ENV);

// Import routes
import { router as chatbotRoutes } from './routes/chatbot.js';
import authRoutes from './routes/auth.js';
import weatherRoutes from './routes/weather.js';
import marketRoutes from './routes/marketRoutes.js'; // ⭐ EXISTING
import translateRoutes from './routes/translateRoutes.js'; // ✅ NEW - Translation routes

// Import database
import database from './config/database.js';

// Import weather alert service
import weatherAlertService from './services/weatherAlertService.js';

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
    await fs.ensureDir('./logs');
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
      message
    });
  };

  res.errorResponse = (message = 'Error', statusCode = 400) => {
    res.status(statusCode).json({
      success: false,
      data: null,
      message
    });
  };

  res.unauthorized = (message = 'Unauthorized') => {
    res.status(401).json({
      success: false,
      data: null,
      message
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

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:5173',
    'http://localhost:5174',
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
    'X-File-Name'
  ]
}));

// General middleware
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// File upload middleware
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 },
  useTempFiles: true,
  tempFileDir: './uploads/temp/',
  createParentPath: true,
  abortOnLimit: true
}));

// Security middleware
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use(generalLimiter);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint - ENHANCED
app.get('/api/health', (req, res) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage(),
    platform: process.platform,
    // ✅ Enhanced with chatbot service status
    services: {
      weatherService: weatherAlertService.getStatus(),
      marketDataService: 'Active', // ⭐ EXISTING
      translationService: 'Active', // ✅ NEW - Translation service status
      chatbotService: process.env.GEMINI_API_KEY ? 'Active' : 'Inactive - Missing API Key' // ✅ NEW
    },
    endpoints: {
      auth: '/api/auth',
      weather: '/api/weather',
      marketData: '/api/real-market', // ⭐ EXISTING
      translation: '/api/translate', // ✅ NEW - Translation endpoint
      chatbot: '/api/chatbot' // ✅ NEW - Chatbot endpoint
    },
    // ✅ Environment debug info
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      geminiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0
    }
  };

  res.successResponse(healthData, 'Server is healthy 🌾');
});

// Welcome route
app.get('/', (req, res) => {
  res.successResponse({
    message: 'Welcome to Krishi Sahayak API! 🌾',
    version: '1.0.0',
    description: 'Smart Multilingual Farming Advisory Platform',
    status: 'Active',
    features: [
      '🤖 AI-Powered Weather Advisory',
      '🌦️ Real-time Weather Alerts', 
      '🌾 Regional Crop Intelligence',
      '📱 Multi-language Support',
      '📊 Real-time Market Data', // ⭐ EXISTING
      '💰 Live Price Intelligence', // ⭐ EXISTING
      '🌐 Real-time Translation (Hindi/English/Punjabi)', // ✅ NEW - Translation feature
      '🤖 Multilingual AI Chatbot with Voice Support' // ✅ NEW - Chatbot feature
    ]
  }, 'Krishi Sahayak API - Empowering Indian Farmers with Technology');
});

// ✅ API Routes - PROPER ORDER
app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/real-market', marketRoutes); // ⭐ EXISTING
app.use('/api/chatbot', chatbotRoutes); // ✅ NEW - Chatbot routes (ADDED FIRST)
app.use('/api', translateRoutes); // ✅ NEW - Translation routes under /api

// ✅ Test chatbot route
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

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    data: null,
    availableRoutes: [
      'GET /',
      'GET /api/health',
      'POST /api/auth/*',
      'GET /api/weather/*',
      'GET /api/real-market/*',
      'POST /api/chatbot/*', // ✅ NEW
      'POST /api/translate/*' // ✅ NEW
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  
  // ✅ Enhanced error logging for chatbot issues
  if (req.originalUrl?.includes('/chatbot')) {
    console.error('🤖 Chatbot Error Details:', {
      url: req.originalUrl,
      method: req.method,
      body: req.body,
      hasGeminiKey: !!process.env.GEMINI_API_KEY
    });
  }
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    data: null,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ⭐ START WEATHER SERVICE WHEN SERVER STARTS
// (Keep your existing weather service initialization here)

// ⭐ ENHANCED GRACEFUL SHUTDOWN
const gracefulShutdown = async () => {
  console.log('📴 Shutting down gracefully...');
  
  // Stop weather service
  try {
    weatherAlertService.stop();
    console.log('✅ Weather Alert Service stopped');
  } catch (error) {
    console.error('❌ Error stopping Weather Alert Service:', error);
  }
  
  // ⭐ EXISTING: Stop market data service
  try {
    const { default: agmarknetService } = await import('./services/agmarknetService.js');
    await agmarknetService.closeBrowser();
    console.log('✅ Market Data Service stopped');
  } catch (error) {
    console.error('❌ Error stopping Market Data Service:', error);
  }
  
  // ✅ NEW: Stop chatbot service (if needed)
  try {
    console.log('✅ Chatbot Service stopped');
  } catch (error) {
    console.error('❌ Error stopping Chatbot Service:', error);
  }
  
  // Close server
  setTimeout(() => {
    console.log('✅ Services stopped, server shutting down');
    process.exit(0);
  }, 1000);
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;
