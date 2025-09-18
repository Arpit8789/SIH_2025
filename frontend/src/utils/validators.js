// src/utils/validators.js
// All validation connected to backend validation rules
export const validationRules = {
  // Email validation (matches backend)
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Please enter a valid email address',
    },
  },

  // Phone validation (Indian format, matches backend)
  phone: {
    required: 'Phone number is required',
    pattern: {
      value: /^[6-9]\d{9}$/,
      message: 'Please enter a valid 10-digit phone number',
    },
  },

  // Password validation (matches backend requirements)
  password: {
    required: 'Password is required',
    minLength: {
      value: 8,
      message: 'Password must be at least 8 characters',
    },
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      message: 'Password must contain uppercase, lowercase, number and special character',
    },
  },

  // Name validation (matches backend)
  name: {
    required: 'Name is required',
    minLength: {
      value: 2,
      message: 'Name must be at least 2 characters',
    },
    maxLength: {
      value: 50,
      message: 'Name cannot exceed 50 characters',
    },
    pattern: {
      value: /^[a-zA-Z\s]+$/,
      message: 'Name can only contain letters and spaces',
    },
  },

  // OTP validation (matches backend format)
  otp: {
    required: 'OTP is required',
    pattern: {
      value: /^\d{6}$/,
      message: 'OTP must be 6 digits',
    },
  },

  // Land size validation (for farmers)
  landSize: {
    required: 'Land size is required',
    min: {
      value: 0.1,
      message: 'Land size must be at least 0.1 acres',
    },
    max: {
      value: 10000,
      message: 'Land size cannot exceed 10,000 acres',
    },
  },

  // Price validation (for market data)
  price: {
    required: 'Price is required',
    min: {
      value: 1,
      message: 'Price must be at least ₹1',
    },
    max: {
      value: 100000,
      message: 'Price cannot exceed ₹1,00,000 per quintal',
    },
  },

  // Quantity validation
  quantity: {
    required: 'Quantity is required',
    min: {
      value: 1,
      message: 'Quantity must be at least 1',
    },
    max: {
      value: 10000,
      message: 'Quantity cannot exceed 10,000',
    },
  },

  // Rating validation (1-5 stars)
  rating: {
    required: 'Rating is required',
    min: {
      value: 1,
      message: 'Rating must be at least 1 star',
    },
    max: {
      value: 5,
      message: 'Rating cannot exceed 5 stars',
    },
  },

  // Pincode validation (Indian format)
  pincode: {
    pattern: {
      value: /^[1-9][0-9]{5}$/,
      message: 'Please enter a valid 6-digit pincode',
    },
  },
};

// Validation utility functions
export const validators = {
  // Validate email format
  isValidEmail: (email) => {
    return validationRules.email.pattern.value.test(email || '');
  },

  // Validate phone number
  isValidPhone: (phone) => {
    return validationRules.phone.pattern.value.test(phone || '');
  },

  // Check password strength (matches backend logic)
  checkPasswordStrength: (password) => {
    if (!password) return { strength: 'weak', suggestions: ['Password is required'] };

    const suggestions = [];
    let score = 0;

    // Length check
    if (password.length >= 8) score += 1;
    else suggestions.push('Use at least 8 characters');

    // Lowercase check
    if (/[a-z]/.test(password)) score += 1;
    else suggestions.push('Include lowercase letters');

    // Uppercase check
    if (/[A-Z]/.test(password)) score += 1;
    else suggestions.push('Include uppercase letters');

    // Number check
    if (/\d/.test(password)) score += 1;
    else suggestions.push('Include numbers');

    // Special character check
    if (/[@$!%*?&]/.test(password)) score += 1;
    else suggestions.push('Include special characters (@$!%*?&)');

    let strength;
    if (score < 3) strength = 'weak';
    else if (score < 5) strength = 'medium';
    else strength = 'strong';

    return { strength, suggestions };
  },

  // Validate Indian pincode
  isValidPincode: (pincode) => {
    return validationRules.pincode.pattern.value.test(pincode || '');
  },

  // Validate file for backend upload
  validateFileForUpload: (file, maxSizeInMB = 10, allowedTypes = []) => {
    const errors = [];

    if (!file) {
      errors.push('File is required');
      return { isValid: false, errors };
    }

    // Size validation
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      errors.push(`File size must be less than ${maxSizeInMB}MB`);
    }

    // Type validation
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      errors.push(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Validate coordinates (for farm location)
  isValidCoordinates: (lat, lng) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    return (
      !isNaN(latitude) &&
      !isNaN(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  },

  // Validate Indian mobile number variations
  normalizeAndValidatePhone: (phone) => {
    if (!phone) return { isValid: false, normalized: '' };

    // Remove all non-numeric characters
    let normalized = phone.replace(/\D/g, '');

    // Handle country code
    if (normalized.startsWith('91') && normalized.length === 12) {
      normalized = normalized.substring(2);
    } else if (normalized.startsWith('+91') && normalized.length === 13) {
      normalized = normalized.substring(3);
    }

    // Validate final format
    const isValid = /^[6-9]\d{9}$/.test(normalized);

    return {
      isValid,
      normalized: isValid ? normalized : '',
    };
  },

  // Real-time form validation
  validateField: (fieldName, value, rules = {}) => {
    const errors = [];
    
    // Get validation rule for field
    const rule = validationRules[fieldName] || rules;
    
    if (!rule) return { isValid: true, errors: [] };

    // Required validation
    if (rule.required && (!value || value.toString().trim() === '')) {
      errors.push(typeof rule.required === 'string' ? rule.required : `${fieldName} is required`);
      return { isValid: false, errors };
    }

    // Skip other validations if field is empty and not required
    if (!value || value.toString().trim() === '') {
      return { isValid: true, errors: [] };
    }

    // Length validations
    if (rule.minLength && value.length < rule.minLength.value) {
      errors.push(rule.minLength.message);
    }

    if (rule.maxLength && value.length > rule.maxLength.value) {
      errors.push(rule.maxLength.message);
    }

    // Numeric validations
    if (rule.min && parseFloat(value) < rule.min.value) {
      errors.push(rule.min.message);
    }

    if (rule.max && parseFloat(value) > rule.max.value) {
      errors.push(rule.max.message);
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.value.test(value)) {
      errors.push(rule.pattern.message);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Validate entire form object
  validateForm: (formData, fieldRules = {}) => {
    const errors = {};
    let isValid = true;

    Object.entries(formData).forEach(([fieldName, value]) => {
      const rules = fieldRules[fieldName] || validationRules[fieldName];
      if (rules) {
        const validation = validators.validateField(fieldName, value, rules);
        if (!validation.isValid) {
          errors[fieldName] = validation.errors; // First error only
          isValid = false;
        }
      }
    });

    return {
      isValid,
      errors,
    };
  },
};

// Export for use in forms
export default validators;
