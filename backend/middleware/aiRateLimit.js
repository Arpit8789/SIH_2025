// middleware/aiRateLimit.js
import rateLimit from 'express-rate-limit';

// Basic rate limiter for AI endpoints
export const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 AI requests per windowMs
  message: {
    success: false,
    message: 'Too many AI requests from this IP, please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for admin users
    return req.user && req.user.role === 'admin';
  }
});

// Strict rate limiter for resource-intensive AI operations
export const strictAiRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per hour
  message: {
    success: false,
    message: 'Rate limit exceeded for intensive AI operations. Please try again in 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.user && req.user.role === 'admin';
  }
});

// Disease detection specific rate limiter
export const diseaseDetectionRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // 20 disease detections per 10 minutes
  message: {
    success: false,
    message: 'Too many disease detection requests. Please wait 10 minutes before trying again.'
  },
  keyGenerator: (req) => {
    // Rate limit per user if authenticated, otherwise per IP
    return req.user ? req.user._id.toString() : req.ip;
  }
});

// Chatbot rate limiter
export const chatbotRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // 30 messages per 5 minutes
  message: {
    success: false,
    message: 'Too many chatbot messages. Please wait a few minutes before continuing.'
  },
  keyGenerator: (req) => {
    return req.user ? req.user._id.toString() : req.ip;
  }
});

// OTP request rate limiter
export const otpRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // Maximum 3 OTP requests per minute
  message: {
    success: false,
    message: 'Too many OTP requests. Please wait 1 minute before requesting again.'
  },
  keyGenerator: (req) => {
    return req.body.email || req.body.phone || req.ip;
  }
});

// Login attempt rate limiter
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Maximum 10 login attempts per 15 minutes
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.'
  },
  skipSuccessfulRequests: true
});

// Registration rate limiter
export const registrationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Maximum 5 registrations per hour per IP
  message: {
    success: false,
    message: 'Too many registration attempts. Please try again in 1 hour.'
  }
});

// Dynamic rate limiter creator
export const createDynamicRateLimit = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: options.message || {
      success: false,
      message: 'Rate limit exceeded. Please try again later.'
    },
    standardHeaders: options.standardHeaders !== false,
    legacyHeaders: options.legacyHeaders || false,
    keyGenerator: options.keyGenerator || ((req) => req.ip),
    skip: options.skip || (() => false)
  });
};
