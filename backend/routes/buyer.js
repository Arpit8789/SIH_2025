// routes/buyer.js
import express from 'express';
import {
  getBuyerProfile,
  updateBuyerProfile,
  searchFarmers,
  getAvailableCrops,
  createPurchaseOrder,
  getPurchaseHistory,
  getMarketTrends
} from '../controllers/buyerController.js';
import { 
  authenticate, 
  requireVerification 
} from '../middleware/auth.js';
import { 
  requireBuyer, 
  requireOwnership 
} from '../middleware/roleCheck.js';
import { 
  uploadProfileImage, 
  handleUploadError 
} from '../middleware/upload.js';

const router = express.Router();

// Apply authentication to all buyer routes
router.use(authenticate);
router.use(requireVerification);
router.use(requireBuyer);

// Profile Management
router.get('/profile', getBuyerProfile);
router.put('/profile', uploadProfileImage, handleUploadError, updateBuyerProfile);

// Marketplace
router.get('/search-farmers', searchFarmers);
router.get('/available-crops', getAvailableCrops);
router.get('/market-trends', getMarketTrends);

// Purchase Management
router.post('/purchase-orders', createPurchaseOrder);
router.get('/purchase-history', getPurchaseHistory);

export default router;
