// backend/routes/auth.js - UPDATED COMPLETE VERSION WITH ALL FEATURES
import express from 'express';
import { 
  register, 
  verifyOTP, 
  login, 
  refreshToken, 
  forgotPassword, 
  resetPassword,
  resendOTP,
  debugOTP,
  getProfile
} from '../controllers/authController.js';
import { 
  authenticate, 
  optionalAuth 
} from '../middleware/auth.js';
import { 
  loginRateLimit, 
  registrationRateLimit, 
  otpRateLimit 
} from '../middleware/aiRateLimit.js';

const router = express.Router();

// ✅ PUBLIC ROUTES WITH RATE LIMITING
router.post('/register', registrationRateLimit, register);
router.post('/verify-otp', otpRateLimit, verifyOTP);
router.post('/resend-otp', otpRateLimit, resendOTP);
router.post('/login', loginRateLimit, login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', otpRateLimit, forgotPassword);
router.post('/reset-password', resetPassword);

// ✅ PROTECTED ROUTES
router.get('/profile', authenticate, getProfile);

// ✅ TOKEN VERIFICATION ROUTE (Updated to use your response format)
router.get('/verify-token', optionalAuth, (req, res) => {
  if (req.user) {
    // Use your existing response format if available
    if (res.successResponse) {
      res.successResponse(
        { 
          user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            isVerified: req.user.isVerified,
            ...(req.user.farmLocation && {
              state: req.user.farmLocation.state,
              district: req.user.farmLocation.district
            })
          }
        }, 
        'Token is valid'
      );
    } else {
      // Fallback to standard response format
      res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: {
          user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            isVerified: req.user.isVerified,
            ...(req.user.farmLocation && {
              state: req.user.farmLocation.state,
              district: req.user.farmLocation.district
            })
          }
        }
      });
    }
  } else {
    // Use your existing response format if available
    if (res.unauthorized) {
      res.unauthorized('Invalid or expired token');
    } else {
      // Fallback to standard response format
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  }
});

// ✅ LOGOUT ROUTE (Enhanced)
router.post('/logout', authenticate, (req, res) => {
  try {
    // Here you could add token blacklisting logic if needed
    // For now, it's handled client-side by removing tokens
    
    console.log('👋 User logged out:', req.user.email);
    
    // Use your existing response format if available
    if (res.successResponse) {
      res.successResponse(null, 'Logged out successfully 👋');
    } else {
      // Fallback to standard response format
      res.status(200).json({
        success: true,
        message: 'Logged out successfully 👋',
        data: null
      });
    }
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

// ✅ DEBUG ROUTES (Only in development)
if (process.env.NODE_ENV === 'development') {
  router.get('/debug-otp/:email', debugOTP);
  
  // ✅ Additional debug route for checking all user data
  router.get('/debug-user/:email', authenticate, async (req, res) => {
    try {
      const { email } = req.params;
      const User = (await import('../models/User.js')).default;
      const OTPVerification = (await import('../models/OTPVerification.js')).default;
      
      const user = await User.findOne({ email: email.toLowerCase() });
      const otpRecords = await OTPVerification.find({ email: email.toLowerCase() });
      
      res.json({
        success: true,
        message: 'Debug user information',
        data: {
          user: user ? {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            isActive: user.isActive,
            registrationDate: user.registrationDate,
            lastLogin: user.lastLogin,
            ...(user.farmLocation && { farmLocation: user.farmLocation })
          } : null,
          otpRecords: otpRecords.map(otp => ({
            id: otp._id,
            otp: otp.otp,
            purpose: otp.purpose,
            isUsed: otp.isUsed,
            attempts: otp.attempts,
            expiresAt: otp.expiresAt,
            isExpired: otp.expiresAt < new Date()
          }))
        }
      });
    } catch (error) {
      console.error('❌ Debug user error:', error);
      res.status(500).json({
        success: false,
        message: 'Debug failed',
        error: error.message
      });
    }
  });
}

// ✅ HEALTH CHECK ROUTE
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Krishi Sahayak Auth Service is running 🌾',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      public: [
        'POST /register',
        'POST /login', 
        'POST /verify-otp',
        'POST /resend-otp',
        'POST /refresh-token',
        'POST /forgot-password',
        'POST /reset-password'
      ],
      protected: [
        'GET /profile',
        'GET /verify-token',
        'POST /logout'
      ],
      ...(process.env.NODE_ENV === 'development' && {
        debug: [
          'GET /debug-otp/:email',
          'GET /debug-user/:email'
        ]
      })
    }
  });
});

// ✅ CATCH-ALL ROUTE FOR INVALID ENDPOINTS
router.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: '/auth/health'
  });
});

export default router;
