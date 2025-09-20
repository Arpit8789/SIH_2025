// backend/routes/marketRoutes.js - ES MODULE VERSION
import express from 'express';

// ✅ Import ONLY real-time microcontroller
import marketController from '../controllers/marketController1.js';

const router = express.Router();

/* ------------------- REAL DATA (Agmarknet API) ------------------- */
// Live real-time prices
router.get('/prices', (req, res) => marketController.getRealTimePrices(req, res));

// Live historical prices
router.get('/history', (req, res) => marketController.getRealHistoricalData(req, res));

export default router;
