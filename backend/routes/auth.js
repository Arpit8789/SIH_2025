// routes/auth.js
import express from 'express';
import { 
  register, 
  verifyOTP, 
  login, 
  refreshToken, 
  forgotPassword, 
  resetPassword,
  resendOTP 
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

// Public routes
router.post('/register', registrationRateLimit, register);
router.post('/verify-otp', otpRateLimit, verifyOTP);
router.post('/resend-otp', otpRateLimit, resendOTP);
router.post('/login', loginRateLimit, login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', otpRateLimit, forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes (optional - for checking token validity)
router.get('/verify-token', optionalAuth, (req, res) => {
  if (req.user) {
    res.successResponse(
      { 
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          isVerified: req.user.isVerified
        }
      }, 
      'Token is valid'
    );
  } else {
    res.unauthorized('Invalid or expired token');
  }
});

// Logout (client-side token removal, but we can blacklist tokens if needed)
router.post('/logout', authenticate, (req, res) => {
  res.successResponse(null, 'Logged out successfully');
});

export default router;
