// src/utils/helpers.js
import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { UPLOAD_LIMITS, PAGINATION } from './constants';

// Date formatting helpers - connected to backend date formats
export const dateHelpers = {
  // Format backend date string
  formatDate: (dateString, formatString = 'MMM dd, yyyy') => {
    try {
      if (!dateString) return '';
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      if (!isValid(date)) return 'Invalid date';
      return format(date, formatString);
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  },

  // Format relative time (e.g., "2 hours ago")
  formatRelativeTime: (dateString) => {
    try {
      if (!dateString) return '';
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      if (!isValid(date)) return 'Invalid date';
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Relative time formatting error:', error);
      return 'Invalid date';
    }
  },

  // Format backend datetime for display
  formatDateTime: (dateString) => {
    return dateHelpers.formatDate(dateString, 'MMM dd, yyyy HH:mm');
  },

  // Check if date is recent (within last 24 hours)
  isRecent: (dateString) => {
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      return diffInHours <= 24;
    } catch (error) {
      return false;
    }
  },
};

// Number formatting helpers - for API data
export const numberHelpers = {
  // Format currency from backend (INR)
  formatCurrency: (amount, currency = 'INR') => {
    try {
      if (amount === null || amount === undefined) return '₹0';
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      console.error('Currency formatting error:', error);
      return `₹${amount || 0}`;
    }
  },

  // Format numbers with Indian number system
  formatNumber: (number) => {
    try {
      if (number === null || number === undefined) return '0';
      return new Intl.NumberFormat('en-IN').format(number);
    } catch (error) {
      console.error('Number formatting error:', error);
      return String(number || 0);
    }
  },

  // Format percentage
  formatPercentage: (value, decimals = 1) => {
    try {
      if (value === null || value === undefined) return '0%';
      return `${Number(value).toFixed(decimals)}%`;
    } catch (error) {
      console.error('Percentage formatting error:', error);
      return '0%';
    }
  },

  // Format land size with units
  formatLandSize: (acres) => {
    try {
      if (!acres) return '0 acres';
      if (acres < 1) {
        const sqft = acres * 43560;
        return `${numberHelpers.formatNumber(Math.round(sqft))} sq ft`;
      }
      return `${numberHelpers.formatNumber(acres)} ${acres === 1 ? 'acre' : 'acres'}`;
    } catch (error) {
      console.error('Land size formatting error:', error);
      return '0 acres';
    }
  },

  // Calculate price change percentage
  calculatePriceChange: (oldPrice, newPrice) => {
    try {
      if (!oldPrice || !newPrice) return 0;
      return ((newPrice - oldPrice) / oldPrice) * 100;
    } catch (error) {
      console.error('Price change calculation error:', error);
      return 0;
    }
  },
};

// String utilities for backend data processing
export const stringHelpers = {
  // Truncate text with ellipsis
  truncate: (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  },

  // Capitalize first letter
  capitalize: (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  // Convert snake_case to Title Case
  snakeToTitle: (text) => {
    if (!text) return '';
    return text
      .split('_')
      .map(word => stringHelpers.capitalize(word))
      .join(' ');
  },

  // Generate initials from name
  getInitials: (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  },

  // Clean phone number for display
  formatPhone: (phone) => {
    if (!phone) return '';
    // Remove non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    // Format as +91 XXXXX XXXXX
    if (cleaned.length === 10) {
      return `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
    }
    return phone;
  },

  // Generate slug from title
  generateSlug: (title) => {
    if (!title) return '';
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  },
};

// File handling utilities - for backend uploads
export const fileHelpers = {
  // Validate file before upload to backend
  validateFile: (file, type = 'image') => {
    const errors = [];

    if (!file) {
      errors.push('No file selected');
      return { isValid: false, errors };
    }

    // Check file size
    if (file.size > UPLOAD_LIMITS.MAX_FILE_SIZE) {
      errors.push(`File size must be less than ${UPLOAD_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    // Check file type
    const allowedTypes = type === 'image' 
      ? UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES 
      : UPLOAD_LIMITS.ALLOWED_DOCUMENT_TYPES;

    if (!allowedTypes.includes(file.type)) {
      errors.push(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Format file size for display
  formatFileSize: (bytes) => {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  },

  // Create FormData for backend upload
  createUploadFormData: (file, additionalData = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add additional data from backend requirements
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    return formData;
  },

  // Get file extension
  getFileExtension: (filename) => {
    if (!filename) return '';
    return filename.split('.').pop().toLowerCase();
  },
};

// Array utilities for backend data processing
export const arrayHelpers = {
  // Group array by property (for backend data)
  groupBy: (array, key) => {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  },

  // Sort array by multiple properties
  sortBy: (array, ...keys) => {
    return [...array].sort((a, b) => {
      for (const key of keys) {
        let aVal = a[key];
        let bVal = b[key];

        // Handle nested properties (e.g., 'user.name')
        if (key.includes('.')) {
          aVal = key.split('.').reduce((obj, prop) => obj?.[prop], a);
          bVal = key.split('.').reduce((obj, prop) => obj?.[prop], b);
        }

        if (aVal < bVal) return -1;
        if (aVal > bVal) return 1;
      }
      return 0;
    });
  },

  // Remove duplicates by property
  uniqueBy: (array, key) => {
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  },

  // Chunk array for pagination
  chunk: (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },
};

// URL and query parameter utilities
export const urlHelpers = {
  // Build query string from object (for API calls)
  buildQueryString: (params) => {
    const filteredParams = Object.entries(params)
      .filter(([_, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => [key, encodeURIComponent(value)]);

    if (filteredParams.length === 0) return '';
    
    return '?' + filteredParams.map(([key, value]) => `${key}=${value}`).join('&');
  },

  // Parse query string to object
  parseQueryString: (queryString) => {
    const params = new URLSearchParams(queryString.replace('?', ''));
    const result = {};
    
    for (const [key, value] of params) {
      result[key] = decodeURIComponent(value);
    }
    
    return result;
  },

  // Generate pagination URLs
  generatePaginationUrl: (baseUrl, page, limit = PAGINATION.DEFAULT_LIMIT, additionalParams = {}) => {
    const params = {
      page,
      limit,
      ...additionalParams,
    };
    
    return baseUrl + urlHelpers.buildQueryString(params);
  },
};

// Color utilities for crop categories and status
export const colorHelpers = {
  // Get color for crop category (from backend data)
  getCropCategoryColor: (category) => {
    const colors = {
      cereals: '#f59e0b', // Golden
      pulses: '#10b981', // Green
      vegetables: '#06b6d4', // Cyan
      fruits: '#f472b6', // Pink
      spices: '#ef4444', // Red
      oilseeds: '#8b5cf6', // Purple
    };
    return colors[category?.toLowerCase()] || '#6b7280';
  },

  // Get color for price trend
  getPriceTrendColor: (trend) => {
    const colors = {
      rising: '#10b981', // Green
      falling: '#ef4444', // Red
      stable: '#6b7280', // Gray
    };
    return colors[trend?.toLowerCase()] || '#6b7280';
  },

  // Get color for weather severity
  getWeatherSeverityColor: (severity) => {
    const colors = {
      low: '#10b981', // Green
      medium: '#f59e0b', // Yellow
      high: '#f97316', // Orange
      critical: '#ef4444', // Red
    };
    return colors[severity?.toLowerCase()] || '#6b7280';
  },

  // Get status color
  getStatusColor: (status) => {
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      pending: '#f59e0b',
      completed: '#10b981',
      cancelled: '#6b7280',
    };
    return colors[status?.toLowerCase()] || '#6b7280';
  },
};

// Utility for handling backend API responses
export const apiHelpers = {
  // Extract data from backend response
  extractData: (response, defaultValue = null) => {
    if (!response) return defaultValue;
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return defaultValue;
  },

  // Extract pagination info from backend response
  extractPagination: (response) => {
    if (!response || !response.pagination) {
      return {
        page: 1,
        limit: PAGINATION.DEFAULT_LIMIT,
        total: 0,
        totalPages: 0,
      };
    }

    const { page, limit, total } = response.pagination;
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  },

  // Handle API errors consistently
  handleApiError: (error, defaultMessage = 'An error occurred') => {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    return defaultMessage;
  },
};

// Device and browser detection
export const deviceHelpers = {
  // Check if mobile device
  isMobile: () => {
    return window.innerWidth < 768;
  },

  // Check if touch device
  isTouchDevice: () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  // Get device info for backend logging
  getDeviceInfo: () => {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      touchSupport: deviceHelpers.isTouchDevice(),
      mobile: deviceHelpers.isMobile(),
    };
  },
};

// Export all helpers
// export {
//   dateHelpers,
//   numberHelpers,
//   stringHelpers,
//   fileHelpers,
//   arrayHelpers,
//   urlHelpers,
//   colorHelpers,
//   apiHelpers,
//   deviceHelpers,
// };
