// routes/admin.js
import express from 'express';
import {
  getDashboardStats,
  getAllFarmers,
  getAllBuyers,
  getUserAnalytics,
  getFeedbackList,
  respondToFeedback,
  manageUser,
  getSystemHealth
} from '../controllers/adminController.js';
import { 
  authenticate, 
  requireVerification 
} from '../middleware/auth.js';
import { 
  requireAdmin, 
  requirePermission 
} from '../middleware/roleCheck.js';

const router = express.Router();

// Apply authentication to all admin routes
router.use(authenticate);
router.use(requireVerification);
router.use(requireAdmin);

// Dashboard and Analytics
router.get('/dashboard', requirePermission('view_analytics'), getDashboardStats);
router.get('/analytics', requirePermission('view_analytics'), getUserAnalytics);
router.get('/system-health', requirePermission('system_admin'), getSystemHealth);

// User Management
router.get('/farmers', requirePermission('manage_users'), getAllFarmers);
router.get('/buyers', requirePermission('manage_users'), getAllBuyers);
router.put('/users/:userId/status', requirePermission('manage_users'), manageUser);

// Feedback Management
router.get('/feedback', requirePermission('view_analytics'), getFeedbackList);
router.post('/feedback/:feedbackId/respond', requirePermission('manage_users'), respondToFeedback);

export default router;
