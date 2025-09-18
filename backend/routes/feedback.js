// routes/feedback.js - ❌ NEW FILE NEEDED
import express from 'express';
import {
  submitFeedback,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  getUserFeedback
} from '../controllers/feedbackController.js';
import { 
  authenticate, 
  requireVerification 
} from '../middleware/auth.js';
import { 
  requireOwnership 
} from '../middleware/roleCheck.js';
import { 
  uploadDocuments,
  handleUploadError
} from '../middleware/upload.js';
import { createDynamicRateLimit } from '../middleware/aiRateLimit.js';

const router = express.Router();

// Apply authentication to all feedback routes
router.use(authenticate);
router.use(requireVerification);

// Feedback rate limiting
const feedbackRateLimit = createDynamicRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Maximum 10 feedback submissions per hour
  message: {
    success: false,
    message: 'Too many feedback submissions. Please wait before submitting again.'
  }
});

// Submit new feedback
router.post('/', 
  feedbackRateLimit,
  uploadDocuments,
  handleUploadError,
  submitFeedback
);

// Get user's feedback history
router.get('/my-feedback', getUserFeedback);

// Get specific feedback by ID
router.get('/:feedbackId', 
  requireOwnership('userId'),
  getFeedbackById
);

// Update feedback (only if not responded yet)
router.put('/:feedbackId', 
  requireOwnership('userId'),
  updateFeedback
);

// Delete feedback
router.delete('/:feedbackId', 
  requireOwnership('userId'),
  deleteFeedback
);

export default router;
