// "Shree Radha Radha"
// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'farmer', 'buyer'],
      message: 'Role must be either admin, farmer, or buyer'
    },
    required: [true, 'Role is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  profileImage: {
    type: String,
    default: null
  },
  // OTP related fields
  otp: {
    code: {
      type: String,
      default: null
    },
    expiresAt: {
      type: Date,
      default: null
    },
    attempts: {
      type: Number,
      default: 0,
      max: 5
    }
  },
  // Password reset fields
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Account security
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  lastLogin: Date,
  
  // Registration tracking
  registrationDate: {
    type: Date,
    default: Date.now
  },
  registrationIP: String
}, { 
  timestamps: true,
  discriminatorKey: 'role'
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Password strength validation
userSchema.methods.validatePasswordStrength = function(password) {
  const strength = {
    score: 0,
    level: 'weak',
    suggestions: []
  };

  // Length check (minimum 6, recommended 8+)
  if (password.length >= 6) strength.score += 1;
  if (password.length >= 8) strength.score += 1;
  if (password.length >= 12) strength.score += 1;
  else if (password.length < 8) {
    strength.suggestions.push('Use at least 8 characters for better security');
  }

  // Complexity checks
  if (/[a-z]/.test(password)) strength.score += 1;
  else strength.suggestions.push('Include lowercase letters');
  
  if (/[A-Z]/.test(password)) strength.score += 1;
  else strength.suggestions.push('Include uppercase letters');
  
  if (/\d/.test(password)) strength.score += 1;
  else strength.suggestions.push('Include numbers');
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength.score += 1;
  else strength.suggestions.push('Include special characters (!@#$%^&*)');

  // Common patterns to avoid
  if (/(.)\1{2,}/.test(password)) {
    strength.score -= 1;
    strength.suggestions.push('Avoid repeating characters');
  }
  
  if (/123|abc|password|qwerty/i.test(password)) {
    strength.score -= 2;
    strength.suggestions.push('Avoid common patterns like "123", "abc", "password"');
  }

  // Determine strength level
  if (strength.score >= 6) strength.level = 'strong';
  else if (strength.score >= 4) strength.level = 'medium';
  else strength.level = 'weak';

  return strength;
};

// Generate OTP
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp.code = otp;
  this.otp.expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  this.otp.attempts = 0;
  return otp;
};

// Verify OTP
userSchema.methods.verifyOTP = function(inputOTP) {
  if (!this.otp.code) return { success: false, message: 'No OTP generated' };
  if (this.otp.expiresAt < new Date()) return { success: false, message: 'OTP has expired' };
  if (this.otp.attempts >= 5) return { success: false, message: 'Too many attempts. Please request a new OTP' };
  
  this.otp.attempts += 1;
  
  if (this.otp.code === inputOTP) {
    this.isVerified = true;
    this.otp.code = null;
    this.otp.expiresAt = null;
    this.otp.attempts = 0;
    return { success: true, message: 'OTP verified successfully' };
  }
  
  return { 
    success: false, 
    message: `Invalid OTP. ${5 - this.otp.attempts} attempts remaining` 
  };
};

// Clear expired OTP
userSchema.methods.clearExpiredOTP = function() {
  if (this.otp.expiresAt && this.otp.expiresAt < new Date()) {
    this.otp.code = null;
    this.otp.expiresAt = null;
    this.otp.attempts = 0;
  }
};

// Handle failed login attempts
userSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours lock
  }
  
  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: new Date() }
  });
};

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Validate password strength before hashing
    const strengthCheck = this.validatePasswordStrength(this.password);
    if (strengthCheck.level === 'weak') {
      const error = new Error(`Password is too weak. ${strengthCheck.suggestions.join(', ')}`);
      return next(error);
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Clean up expired data
userSchema.methods.cleanup = function() {
  this.clearExpiredOTP();
  
  // Clear expired password reset token
  if (this.resetPasswordExpires && this.resetPasswordExpires < new Date()) {
    this.resetPasswordToken = undefined;
    this.resetPasswordExpires = undefined;
  }
};

// Index for performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ 'otp.expiresAt': 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('User', userSchema);

