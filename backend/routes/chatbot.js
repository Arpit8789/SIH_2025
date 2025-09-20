// routes/chatbot.js - Chatbot API Routes (CORRECTLY FIXED)
import express from 'express';
import ChatbotController from '../controllers/chatbotController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js'; // âœ… CORRECT IMPORTS
import multer from 'multer';

const router = express.Router();

// Multer setup for voice file uploads (if needed later)
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  }
});

// Public routes (no authentication required)
router.post('/initialize', optionalAuth, ChatbotController.initializeChat);
router.post('/message', optionalAuth, ChatbotController.sendMessage);
router.post('/quick-action', optionalAuth, ChatbotController.handleQuickAction);
router.get('/quick-actions', optionalAuth, ChatbotController.getQuickActions);
router.get('/health', ChatbotController.healthCheck);

// Semi-protected routes (optional authentication)
router.put('/context', optionalAuth, ChatbotController.updateContext);
router.get('/history/:sessionId', optionalAuth, ChatbotController.getChatHistory);
router.post('/end-session', optionalAuth, ChatbotController.endSession);

// Future voice routes (if needed)
router.post('/voice-message', optionalAuth, upload.single('audio'), (req, res) => {
  res.json({ message: 'Voice processing will be implemented soon' });
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Audio file too large. Maximum size is 5MB.'
      });
    }
  }
  next(error);
});

export { router };
