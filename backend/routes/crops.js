// routes/crops.js
import express from 'express';
import {
  getAllCrops,
  getCropById,
  getCropsByCategory,
  getCropsBySeason,
  searchCrops
} from '../controllers/cropController.js';
import { 
  optionalAuth 
} from '../middleware/auth.js';

const router = express.Router();

// Public routes (with optional authentication for personalized data)
router.use(optionalAuth);

router.get('/', getAllCrops);
router.get('/search', searchCrops);
router.get('/category/:category', getCropsByCategory);
router.get('/season/:season', getCropsBySeason);
router.get('/:cropId', getCropById);

export default router;
