// backend/routes/marketRoutes.js - ES MODULE VERSION
import express from 'express';
import marketController from '../controllers/marketController1.js'; // Note: .js extension needed
const router = express.Router();

// GET real-time prices from agmarknet
router.get('/prices', marketController.getRealTimePrices);

// GET historical data from government sources
router.get('/history', marketController.getRealHistoricalData);

export default router; // ⭐ CHANGED: ES Module export
