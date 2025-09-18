// routes/market.js
import express from 'express';
import {
  getCurrentPrices,
  getPriceHistory,
  getPriceTrends,
  getMarketAnalysis
} from '../controllers/marketController.js';
import { 
  optionalAuth 
} from '../middleware/auth.js';

const router = express.Router();

// Public routes with optional authentication
router.use(optionalAuth);

router.get('/prices/current', getCurrentPrices);
router.get('/prices/history', getPriceHistory);
router.get('/prices/trends', getPriceTrends);
router.get('/analysis', getMarketAnalysis);

export default router;
