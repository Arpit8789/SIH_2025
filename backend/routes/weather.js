// backend/routes/weather.js - SIMPLE ROUTES FOR WEATHER CONTROLLER
import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getCurrentWeatherWithInsights,
  getDetailedForecast,
  getFarmingInsights,
  toggleWeatherNotifications,
  sendImmediateAlert,
  getWeatherStats,
  testWeatherService,
  getWeatherByLocation
} from '../controllers/weatherController.js';

const router = express.Router();

// ============================================
// 🌐 PUBLIC ROUTES (No Authentication Required) 
// ============================================

// Get current weather with AI insights
router.get('/current', getCurrentWeatherWithInsights);

// Get 7-day detailed forecast
router.get('/forecast', getDetailedForecast);

// Get AI farming insights only
router.get('/insights', getFarmingInsights);

// Test weather service status
router.get('/test', testWeatherService);

// Get weather for specific location by name
router.get('/location/:location', getWeatherByLocation);

// ============================================
// 🔒 PROTECTED ROUTES (Authentication Required)
// ============================================

// Apply authentication middleware to all routes below
router.use(authenticate);

// Toggle weather email notifications
router.post('/notifications/toggle', toggleWeatherNotifications);

// Send immediate weather alert
router.post('/alert/send', sendImmediateAlert);

// Get weather statistics for user
router.get('/stats', getWeatherStats);

export default router;
