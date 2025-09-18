// routes/weather.js - COMPLETE UPDATED VERSION
import express from 'express';
import {
  getCurrentWeather,
  getWeatherForecast,
  getWeatherAlerts,
  markAlertsAsRead,
  testAIConnection
} from '../controllers/weatherController.js';
import { 
  authenticate, 
  requireVerification 
} from '../middleware/auth.js';
import { 
  requireFarmer 
} from '../middleware/roleCheck.js';

const router = express.Router();

// Public routes (no auth required)
router.get('/test-ai', testAIConnection);

// Protected routes for farmers
router.use(authenticate);
router.use(requireVerification);
router.use(requireFarmer);

// Weather data endpoints
router.get('/current', getCurrentWeather);
router.get('/forecast', getWeatherForecast);

// Weather alerts endpoints
router.get('/alerts', getWeatherAlerts);
router.post('/alerts/mark-read', markAlertsAsRead);

// Additional endpoints for the full system
router.post('/advisory/feedback', async (req, res) => {
  // Simple feedback acknowledgment
  res.json({
    success: true,
    message: 'Feedback received successfully'
  });
});

export default router;
