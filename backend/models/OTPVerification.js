// models/OTPVerification.js
import mongoose from 'mongoose';

const otpVerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['registration', 'password_reset', 'email_change'],
    required: true
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-delete expired documents
otpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Methods
otpVerificationSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

otpVerificationSchema.methods.canAttempt = function() {
  return this.attempts < 5 && !this.isUsed && !this.isExpired();
};

export default mongoose.model('OTPVerification', otpVerificationSchema);
