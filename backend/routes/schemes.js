// routes/schemes.js - ❌ NEW FILE NEEDED
import express from 'express';
import {
  getAllSchemes,
  getSchemeById,
  getSchemesByCategory,
  searchSchemes,
  getEligibleSchemes,
  getApplicationHistory,
  getSchemeDetails
} from '../controllers/schemeController.js';
import { 
  authenticate, 
  requireVerification,
  optionalAuth 
} from '../middleware/auth.js';
import { 
  requireFarmer 
} from '../middleware/roleCheck.js';

const router = express.Router();

// Public routes (with optional authentication for personalized results)
router.get('/', optionalAuth, getAllSchemes);
router.get('/search', optionalAuth, searchSchemes);
router.get('/category/:category', optionalAuth, getSchemesByCategory);
router.get('/:schemeId', optionalAuth, getSchemeById);
router.get('/:schemeId/details', optionalAuth, getSchemeDetails);

// Protected routes for farmers
router.use(authenticate);
router.use(requireVerification);
router.use(requireFarmer);

// Get schemes eligible for current farmer
router.get('/eligible/for-me', getEligibleSchemes);

// Get farmer's application history
router.get('/applications/history', getApplicationHistory);

export default router;
