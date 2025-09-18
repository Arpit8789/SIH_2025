// routes/ai.js - ✅ Updated with all AI features
import express from 'express';
import {
  chatWithAI,
  detectDiseaseFromImage,
  getAICropRecommendations
} from '../controllers/aiController.js';
import { 
  authenticate, 
  requireVerification 
} from '../middleware/auth.js';
import { 
  requireFarmer,
  requireFarmerOrBuyer 
} from '../middleware/roleCheck.js';
import { 
  uploadDiseaseImage,
  handleUploadError,
  validateUploadedFile
} from '../middleware/upload.js';
import { 
  aiRateLimit,
  chatbotRateLimit,
  diseaseDetectionRateLimit,
  strictAiRateLimit
} from '../middleware/aiRateLimit.js';

const router = express.Router();

// Apply authentication to all AI routes
router.use(authenticate);
router.use(requireVerification);

// Agricultural Chatbot
router.post('/chat', 
  chatbotRateLimit, 
  requireFarmerOrBuyer, 
  chatWithAI
);

// Disease Detection from Image
router.post('/detect-disease', 
  diseaseDetectionRateLimit,
  requireFarmer,
  uploadDiseaseImage,
  handleUploadError,
  validateUploadedFile,
  detectDiseaseFromImage
);

// AI-Powered Crop Recommendations
router.get('/crop-recommendations',
  strictAiRateLimit,
  requireFarmer,
  getAICropRecommendations
);

export default router;
