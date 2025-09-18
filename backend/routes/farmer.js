// routes/farmer.js
import express from 'express';
import {
  getFarmerProfile,
  updateFarmerProfile,
  getCropRecommendations,
  getWeatherAlerts,
  getMarketPrices,
  getDiseaseHistory,
  getGovernmentSchemes,
  applyForScheme
} from '../controllers/farmerController.js';
import { 
  authenticate, 
  requireVerification 
} from '../middleware/auth.js';
import { 
  requireFarmer, 
  requireOwnership 
} from '../middleware/roleCheck.js';
import { 
  uploadProfileImage, 
  handleUploadError 
} from '../middleware/upload.js';

const router = express.Router();

// Apply authentication to all farmer routes
router.use(authenticate);
router.use(requireVerification);
router.use(requireFarmer);

// Profile Management
router.get('/profile', getFarmerProfile);
router.put('/profile', uploadProfileImage, handleUploadError, updateFarmerProfile);

// Agricultural Services
router.get('/crop-recommendations', getCropRecommendations);
router.get('/weather-alerts', getWeatherAlerts);
router.get('/market-prices', getMarketPrices);
router.get('/disease-history', getDiseaseHistory);

// Government Schemes
router.get('/schemes', getGovernmentSchemes);
router.post('/schemes/:schemeId/apply', applyForScheme);

export default router;
