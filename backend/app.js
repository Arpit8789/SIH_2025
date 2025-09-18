// app.js - Enhanced with Weather System
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

// Load environment variables
dotenv.config();

// Import database
import database from './config/database.js';

// Import weather alert service
import weatherAlertService from './services/weatherAlertService.js';

// Import routes
import authRoutes from './routes/auth.js';
import weatherRoutes from './routes/weather.js'; // ⭐ ADD THIS

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage(),
    platform: process.platform,
    weatherService: weatherAlertService.getStatus() // ⭐ ADD WEATHER STATUS
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
      '📱 Multi-language Support'
    ]
  }, 'Krishi Sahayak API - Empowering Indian Farmers with Technology');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes); // ⭐ ADD WEATHER ROUTES

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    data: null
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    data: null
  });
});

// ⭐ START WEATHER SERVICE WHEN SERVER STARTS


// ⭐ GRACEFUL SHUTDOWN
const gracefulShutdown = () => {
  console.log('📴 Shutting down gracefully...');
  
  // Stop weather service
  try {
    weatherAlertService.stop();
    console.log('✅ Weather Alert Service stopped');
  } catch (error) {
    console.error('❌ Error stopping Weather Alert Service:', error);
  }
  
  // Close server
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('❌ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;
