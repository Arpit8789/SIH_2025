const cors = require('cors');

// Development CORS configuration
const developmentConfig = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://localhost:4173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'User-Agent'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 hours
};

// Production CORS configuration
const productionConfig = {
  origin: function (origin, callback) {
    // List of allowed origins in production
    const allowedOrigins = [
      'https://yourdomain.com',
      'https://www.yourdomain.com',
      'https://sih2025.vercel.app',
      // Add your production domain here
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept'
  ],
  credentials: false,
  maxAge: 3600 // 1 hour
};

// LibreTranslate specific CORS (if needed)
const libretranslateConfig = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5000' // LibreTranslate local server
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'User-Agent',
    'Accept'
  ],
  credentials: false
};

// Create CORS middleware based on environment
const createCorsMiddleware = (environment = 'development') => {
  let config;

  switch (environment) {
    case 'production':
      config = productionConfig;
      break;
    case 'libretranslate':
      config = libretranslateConfig;
      break;
    case 'development':
    default:
      config = developmentConfig;
      break;
  }

  return cors(config);
};

// Error handler for CORS errors
const handleCorsError = (error, req, res, next) => {
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Origin not allowed',
      origin: req.headers.origin
    });
  }
  next(error);
};

// Preflight handler for complex requests
const handlePreflight = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.header('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }
  next();
};

module.exports = {
  createCorsMiddleware,
  handleCorsError,
  handlePreflight,
  developmentConfig,
  productionConfig,
  libretranslateConfig
};
