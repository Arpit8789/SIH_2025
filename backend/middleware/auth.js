// backend/middleware/auth.js - UPDATED TO MATCH NEW AUTH CONTROLLER
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import User from '../models/User.js';

// ✅ Basic authentication middleware (Updated to match new controller)
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided or invalid format.' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // ✅ Verify token using updated secret structure
    const jwtSecret = config.jwtSecret || process.env.JWT_SECRET || 'krishi-sahayak-secret-key';
    const decoded = jwt.verify(token, jwtSecret);
    
    // ✅ Updated to match new controller token structure (userId instead of id)
    const userId = decoded.userId || decoded.id; // Support both formats for compatibility
    
    // Check if user exists and is active
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token is valid but user no longer exists.' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'User account is deactivated.' 
      });
    }

    if (user.isLocked) {
      return res.status(423).json({ 
        success: false, 
        message: 'User account is temporarily locked.' 
      });
    }

    // ✅ Check if user is verified (updated check)
    if (!user.isVerified) {
      return res.status(403).json({ 
        success: false, 
        message: 'Please verify your email before accessing this resource.' 
      });
    }

    // Clean up expired data if method exists
    if (user.cleanup && typeof user.cleanup === 'function') {
      user.cleanup();
    }
    
    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired. Please login again.' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token format.' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication.' 
    });
  }
};

// ✅ Optional authentication middleware (Updated)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next(); // Continue without user
    }

    const token = authHeader.substring(7);
    const jwtSecret = config.jwtSecret || process.env.JWT_SECRET || 'krishi-sahayak-secret-key';
    const decoded = jwt.verify(token, jwtSecret);
    
    // ✅ Support both userId and id formats
    const userId = decoded.userId || decoded.id;
    
    const user = await User.findById(userId).select('-password');
    if (user && user.isActive && !user.isLocked) {
      // Clean up expired data if method exists
      if (user.cleanup && typeof user.cleanup === 'function') {
        user.cleanup();
      }
      req.user = user;
    } else {
      req.user = null;
    }
    
    next();
  } catch (error) {
    // For optional auth, we continue even if token is invalid
    console.log('⚠️ Optional auth failed, continuing without user:', error.message);
    req.user = null;
    next();
  }
};

// ✅ Verified user only (email verified) - Enhanced
export const requireVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required.' 
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({ 
      success: false, 
      message: 'Email verification required to access this resource. Please check your email and verify your account.' 
    });
  }

  next();
};

// ✅ Role-based authorization middleware (New)
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access this resource.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

// ✅ Specific role middlewares
export const adminOnly = authorize('admin');
export const farmerOnly = authorize('farmer');
export const buyerOnly = authorize('buyer');
export const farmerOrAdmin = authorize('farmer', 'admin');

// ✅ Generate JWT token (Updated to match new controller)
export const generateToken = (user) => {
  const payload = {
    userId: user._id, // ✅ Updated to match new controller format
    email: user.email,
    role: user.role
  };

  const jwtSecret = config.jwtSecret || process.env.JWT_SECRET || 'krishi-sahayak-secret-key';
  
  return jwt.sign(payload, jwtSecret, { 
    expiresIn: config.jwtExpire || '24h', // ✅ Updated default to match controller
    issuer: 'krishi-sahayak',
    audience: user.role
  });
};

// ✅ Generate refresh token (Updated to match new controller)
export const generateRefreshToken = (user) => {
  const payload = {
    userId: user._id, // ✅ Updated to match new controller format
    type: 'refresh'
  };

  const jwtRefreshSecret = config.jwtRefreshSecret || process.env.JWT_REFRESH_SECRET || 'krishi-sahayak-refresh-secret';
  
  return jwt.sign(payload, jwtRefreshSecret, { 
    expiresIn: config.jwtRefreshExpire || '7d', // ✅ Updated default to match controller
    issuer: 'krishi-sahayak'
  });
};

// ✅ Verify refresh token (Updated to match new controller)
export const verifyRefreshToken = async (token) => {
  try {
    const jwtRefreshSecret = config.jwtRefreshSecret || process.env.JWT_REFRESH_SECRET || 'krishi-sahayak-refresh-secret';
    const decoded = jwt.verify(token, jwtRefreshSecret);
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    // ✅ Support both userId and id formats
    const userId = decoded.userId || decoded.id;
    
    const user = await User.findById(userId).select('-password');
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    if (user.isLocked) {
      throw new Error('User account is locked');
    }

    return user;
  } catch (error) {
    console.error('❌ Refresh token verification failed:', error.message);
    throw error;
  }
};

// ✅ Validate token without throwing errors (for health checks)
export const validateToken = async (token) => {
  try {
    const jwtSecret = config.jwtSecret || process.env.JWT_SECRET || 'krishi-sahayak-secret-key';
    const decoded = jwt.verify(token, jwtSecret);
    
    const userId = decoded.userId || decoded.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user || !user.isActive || user.isLocked) {
      return { valid: false, user: null };
    }

    return { valid: true, user, decoded };
  } catch (error) {
    return { valid: false, user: null, error: error.message };
  }
};

// ✅ Middleware to check if user owns resource (for user-specific data)
export const requireOwnership = (userIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Get resource user ID from request params, body, or query
    const resourceUserId = req.params[userIdField] || req.body[userIdField] || req.query[userIdField];
    
    if (!resourceUserId) {
      return res.status(400).json({
        success: false,
        message: 'Resource owner ID not provided.'
      });
    }

    // Allow access if user owns the resource or is admin
    if (req.user._id.toString() !== resourceUserId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }

    next();
  };
};

// ✅ Rate limiting helper for auth endpoints
export const createAuthLimiter = (windowMs = 15 * 60 * 1000, max = 5, message = 'Too many requests') => {
  return {
    windowMs,
    max,
    message: {
      success: false,
      message
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      console.warn(`⚠️ Rate limit exceeded for ${req.ip} on ${req.path}`);
      res.status(429).json({
        success: false,
        message: `${message}. Please try again later.`
      });
    }
  };
};

// ✅ Export all middleware functions
export default {
  authenticate,
  optionalAuth,
  requireVerification,
  authorize,
  adminOnly,
  farmerOnly,
  buyerOnly,
  farmerOrAdmin,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  validateToken,
  requireOwnership,
  createAuthLimiter
};
