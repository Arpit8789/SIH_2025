// utils/validators.js
import validator from 'validator';

export class Validators {
  // Email validation
  static validateEmail(email) {
    if (!email) {
      return { isValid: false, message: 'Email is required' };
    }
    
    if (!validator.isEmail(email)) {
      return { isValid: false, message: 'Please provide a valid email address' };
    }
    
    return { isValid: true };
  }

  // Phone number validation (Indian)
  static validatePhone(phone) {
    if (!phone) {
      return { isValid: false, message: 'Phone number is required' };
    }
    
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return { isValid: false, message: 'Please provide a valid Indian phone number' };
    }
    
    return { isValid: true };
  }

  // Password validation
  static validatePassword(password) {
    if (!password) {
      return { isValid: false, message: 'Password is required' };
    }
    
    if (password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters long' };
    }
    
    return { isValid: true };
  }

  // Name validation
  static validateName(name, fieldName = 'Name') {
    if (!name) {
      return { isValid: false, message: `${fieldName} is required` };
    }
    
    if (name.trim().length < 2) {
      return { isValid: false, message: `${fieldName} must be at least 2 characters long` };
    }
    
    if (name.length > 50) {
      return { isValid: false, message: `${fieldName} cannot exceed 50 characters` };
    }
    
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(name)) {
      return { isValid: false, message: `${fieldName} can only contain letters and spaces` };
    }
    
    return { isValid: true };
  }

  // OTP validation
  static validateOTP(otp) {
    if (!otp) {
      return { isValid: false, message: 'OTP is required' };
    }
    
    const otpRegex = /^\d{6}$/;
    if (!otpRegex.test(otp)) {
      return { isValid: false, message: 'OTP must be a 6-digit number' };
    }
    
    return { isValid: true };
  }

  // Coordinates validation
  static validateCoordinates(latitude, longitude) {
    const errors = [];
    
    if (latitude !== undefined) {
      if (isNaN(latitude) || latitude < -90 || latitude > 90) {
        errors.push('Latitude must be a number between -90 and 90');
      }
    }
    
    if (longitude !== undefined) {
      if (isNaN(longitude) || longitude < -180 || longitude > 180) {
        errors.push('Longitude must be a number between -180 and 180');
      }
    }
    
    return {
      isValid: errors.length === 0,
      message: errors.length > 0 ? errors.join(', ') : undefined
    };
  }

  // Pincode validation (Indian)
  static validatePincode(pincode) {
    if (!pincode) {
      return { isValid: false, message: 'Pincode is required' };
    }
    
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(pincode)) {
      return { isValid: false, message: 'Please provide a valid Indian pincode' };
    }
    
    return { isValid: true };
  }

  // Land size validation
  static validateLandSize(size) {
    if (size === undefined || size === null) {
      return { isValid: false, message: 'Land size is required' };
    }
    
    if (isNaN(size) || size <= 0) {
      return { isValid: false, message: 'Land size must be a positive number' };
    }
    
    if (size > 10000) {
      return { isValid: false, message: 'Land size seems too large. Please verify.' };
    }
    
    return { isValid: true };
  }

  // Validate multiple fields
  static validateFields(data, rules) {
    const errors = [];
    
    for (const [field, rule] of Object.entries(rules)) {
      const value = data[field];
      let validation;
      
      switch (rule.type) {
        case 'email':
          validation = this.validateEmail(value);
          break;
        case 'phone':
          validation = this.validatePhone(value);
          break;
        case 'password':
          validation = this.validatePassword(value);
          break;
        case 'name':
          validation = this.validateName(value, rule.fieldName || field);
          break;
        case 'otp':
          validation = this.validateOTP(value);
          break;
        case 'pincode':
          validation = this.validatePincode(value);
          break;
        case 'landSize':
          validation = this.validateLandSize(value);
          break;
        default:
          validation = { isValid: true };
      }
      
      if (!validation.isValid) {
        errors.push({
          field,
          message: validation.message
        });
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
