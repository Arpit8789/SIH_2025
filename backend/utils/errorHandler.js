// utils/errorHandler.js
import { ResponseHandler } from './responseHandler.js';

// Custom Error Classes
export class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400);
    this.errors = errors;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429);
  }
}

// Global Error Handler Middleware
export const globalErrorHandler = (err, req, res, next) => {
  // Set default error properties
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error for debugging (except validation errors)
  if (err.statusCode >= 500) {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  }

  // Handle different types of errors
  if (process.env.NODE_ENV === 'development') {
    handleDevelopmentError(err, req, res);
  } else {
    handleProductionError(err, req, res);
  }
};

const handleDevelopmentError = (err, req, res) => {
  const response = {
    success: false,
    message: err.message,
    error: err,
    stack: err.stack,
    timestamp: new Date().toISOString()
  };

  if (err.errors) {
    response.errors = err.errors;
  }

  res.status(err.statusCode).json(response);
};

const handleProductionError = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    const response = {
      success: false,
      message: err.message,
      timestamp: new Date().toISOString()
    };

    if (err.errors) {
      response.errors = err.errors;
    }

    return res.status(err.statusCode).json(response);
  }

  // Programming or other unknown error: don't leak error details
  console.error('ERROR:', err);
  
  ResponseHandler.serverError(res, 'Something went wrong!');
};

// MongoDB Error Handlers
export const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

export const handleDuplicateFieldError = (err) => {
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/);
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

export const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(val => ({
    field: val.path,
    message: val.message,
    value: val.value
  }));
  
  const message = 'Invalid input data';
  return new ValidationError(message, errors);
};

export const handleJWTError = () => new AuthenticationError('Invalid token. Please log in again!');

export const handleJWTExpiredError = () => new AuthenticationError('Your token has expired! Please log in again.');

// Async error wrapper
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// 404 Handler
export const notFoundHandler = (req, res, next) => {
  const err = new NotFoundError(`Can't find ${req.originalUrl} on this server!`);
  next(err);
};
