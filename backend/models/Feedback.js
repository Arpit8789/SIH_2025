// models/Feedback.js
import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userRole: {
    type: String,
    enum: ['farmer', 'buyer', 'admin'],
    required: true
  },
  category: {
    type: String,
    enum: ['bug_report', 'feature_request', 'general_feedback', 'complaint', 'suggestion'],
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  featureRating: {
    easeOfUse: { type: Number, min: 1, max: 5 },
    accuracy: { type: Number, min: 1, max: 5 },
    speed: { type: Number, min: 1, max: 5 },
    helpfulness: { type: Number, min: 1, max: 5 }
  },
  screenshots: [String],
  deviceInfo: {
    browser: String,
    os: String,
    screenResolution: String
  },
  location: {
    state: String,
    district: String
  },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'resolved', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  adminResponse: {
    message: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    respondedAt: Date
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  votes: {
    helpful: { type: Number, default: 0 },
    notHelpful: { type: Number, default: 0 }
  },
  tags: [String]
}, { timestamps: true });

feedbackSchema.index({ userId: 1, createdAt: -1 });
feedbackSchema.index({ category: 1, status: 1 });
feedbackSchema.index({ rating: 1 });

export default mongoose.model('Feedback', feedbackSchema);
