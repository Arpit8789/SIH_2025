// backend/models/OTPVerification.js - IMPROVED WITH BETTER DEBUGGING
import mongoose from 'mongoose';

const otpVerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true // ✅ Ensure lowercase for matching
  },
  otp: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['registration', 'password_reset', 'email_change'],
    required: true,
    default: 'registration'
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

// ✅ Auto-delete expired documents
otpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ✅ IMPROVED: Methods with better debugging
otpVerificationSchema.methods.isExpired = function() {
  const now = new Date();
  const expired = this.expiresAt < now;
  console.log(`🕒 OTP Expiry Check: Current=${now}, Expires=${this.expiresAt}, Expired=${expired}`);
  return expired;
};

otpVerificationSchema.methods.canAttempt = function() {
  const canAttempt = this.attempts < 5 && !this.isUsed && !this.isExpired();
  console.log(`🔍 OTP Can Attempt: attempts=${this.attempts}, isUsed=${this.isUsed}, expired=${this.isExpired()}, canAttempt=${canAttempt}`);
  return canAttempt;
};

// ✅ Add debug method
otpVerificationSchema.methods.debugInfo = function() {
  return {
    id: this._id,
    email: this.email,
    otp: this.otp,
    purpose: this.purpose,
    attempts: this.attempts,
    isUsed: this.isUsed,
    expiresAt: this.expiresAt,
    createdAt: this.createdAt,
    isExpired: this.isExpired(),
    canAttempt: this.canAttempt()
  };
};

export default mongoose.model('OTPVerification', otpVerificationSchema);
