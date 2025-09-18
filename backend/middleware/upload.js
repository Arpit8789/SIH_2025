// middleware/upload.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    './uploads',
    './uploads/diseases',
    './uploads/temp',
    './uploads/profiles',
    './uploads/documents'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Storage configuration for different file types
const createStorage = (subfolder) => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `uploads/${subfolder}/`);
    },
    filename: function (req, file, cb) {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const name = file.fieldname + '-' + uniqueSuffix + ext;
      cb(null, name);
    }
  });
};

// File filter functions
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, WebP) are allowed!'), false);
  }
};

const documentFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)|text\/plain/.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only document files (PDF, DOC, DOCX, TXT) are allowed!'), false);
  }
};

// Disease detection image upload
export const uploadDiseaseImage = multer({
  storage: createStorage('diseases'),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  },
  fileFilter: imageFilter
}).single('diseaseImage');

// Profile image upload
export const uploadProfileImage = multer({
  storage: createStorage('profiles'),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  },
  fileFilter: imageFilter
}).single('profileImage');

// Document upload (for government schemes)
export const uploadDocuments = multer({
  storage: createStorage('documents'),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
    files: 5 // Maximum 5 documents
  },
  fileFilter: documentFilter
}).array('documents', 5);

// Multiple image upload (for crop showcase)
export const uploadCropImages = multer({
  storage: createStorage('temp'),
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB per file
    files: 10 // Maximum 10 images
  },
  fileFilter: imageFilter
}).array('cropImages', 10);

// General file upload handler with error handling
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File too large. Please upload a smaller file.'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files. Please reduce the number of files.'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected field name in file upload.'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'File upload error: ' + error.message
        });
    }
  }
  
  if (error.message.includes('Only')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

// File cleanup utility
export const cleanupTempFiles = (filePaths) => {
  if (!Array.isArray(filePaths)) {
    filePaths = [filePaths];
  }
  
  filePaths.forEach(filePath => {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
};

// Validate uploaded file
export const validateUploadedFile = (req, res, next) => {
  if (!req.file && !req.files) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded.'
    });
  }
  
  // Add file info to request for easier access
  if (req.file) {
    req.uploadedFile = {
      path: req.file.path,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    };
  }
  
  if (req.files) {
    req.uploadedFiles = req.files.map(file => ({
      path: file.path,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    }));
  }
  
  next();
};
