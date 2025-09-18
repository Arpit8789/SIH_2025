// models/WeatherAdvisory.js
import mongoose from 'mongoose';

const weatherAdvisorySchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true,
    index: true
  },
  
  date: {
    type: String, // YYYY-MM-DD format
    required: true,
    index: true
  },
  
  location: {
    state: String,
    district: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  weatherConditions: {
    temperature: {
      type: Number,
      required: true
    },
    precipitation: {
      type: Number,
      default: 0
    },
    humidity: {
      type: Number,
      required: true
    },
    windSpeed: {
      type: Number,
      required: true
    },
    condition: {
      type: String,
      enum: ['clear', 'cloudy', 'rain', 'snow', 'thunderstorm', 'fog'],
      required: true
    },
    weatherCode: Number
  },
  
  crops: [{
    name: String,
    localName: String,
    season: {
      type: String,
      enum: ['kharif', 'rabi', 'zaid']
    },
    growthStage: String,
    waterRequirement: {
      type: String,
      enum: ['low', 'medium', 'high', 'very_high']
    }
  }],
  
  advice: {
    primaryAdvice: {
      type: String,
      required: true
    },
    additionalTips: [String],
    source: {
      type: String,
      enum: ['ai', 'fallback', 'expert'],
      default: 'ai'
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.8
    },
    language: {
      type: String,
      enum: ['en', 'hi', 'pa'],
      default: 'en'
    }
  },
  
  agriculturalInsights: {
    irrigationRecommended: {
      type: Boolean,
      default: false
    },
    sprayingRecommended: {
      type: Boolean,
      default: false
    },
    fieldWorkSuitable: {
      type: Boolean,
      default: true
    },
    cropRiskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    seasonalRecommendations: [String]
  },
  
  validUntil: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // Auto-delete expired documents
  },
  
  feedback: {
    isHelpful: Boolean,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    submittedAt: Date
  },
  
  viewedAt: Date,
  
  // API usage tracking
  apiUsage: {
    provider: {
      type: String,
      enum: ['chatanywhere', 'openai', 'fallback'],
      default: 'chatanywhere'
    },
    tokensUsed: Number,
    responseTime: Number, // in milliseconds
    cost: Number // in currency units
  }
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
weatherAdvisorySchema.index({ farmerId: 1, date: -1 });
weatherAdvisorySchema.index({ farmerId: 1, validUntil: 1 });
weatherAdvisorySchema.index({ date: 1, 'location.state': 1 });

// Virtual for checking if advisory is still valid
weatherAdvisorySchema.virtual('isValid').get(function() {
  return this.validUntil > new Date();
});

// Virtual for time until expiry
weatherAdvisorySchema.virtual('hoursUntilExpiry').get(function() {
  const now = new Date();
  const expiry = this.validUntil;
  return Math.max(0, Math.ceil((expiry - now) / (1000 * 60 * 60)));
});

// Static method to get today's advisory for a farmer
weatherAdvisorySchema.statics.getTodaysAdvice = function(farmerId) {
  const today = new Date().toISOString().split('T')[0];
  return this.findOne({
    farmerId: farmerId,
    date: today,
    validUntil: { $gt: new Date() }
  }).sort({ createdAt: -1 });
};

// Static method to get weekly advisory summary
weatherAdvisorySchema.statics.getWeeklySummary = function(farmerId, startDate = null) {
  const start = startDate || new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  
  return this.find({
    farmerId: farmerId,
    createdAt: {
      $gte: start,
      $lt: end
    }
  }).sort({ date: 1 });
};

// Instance method to mark as viewed
weatherAdvisorySchema.methods.markAsViewed = function() {
  this.viewedAt = new Date();
  return this.save();
};

// Instance method to add feedback
weatherAdvisorySchema.methods.addFeedback = function(isHelpful, rating = null, comments = null) {
  this.feedback = {
    isHelpful: isHelpful,
    rating: rating,
    comments: comments,
    submittedAt: new Date()
  };
  return this.save();
};

// Pre-save middleware to ensure date format
weatherAdvisorySchema.pre('save', function(next) {
  if (this.isNew && !this.date) {
    this.date = new Date().toISOString().split('T')[0];
  }
  next();
});

// Pre-save middleware to set default validUntil
weatherAdvisorySchema.pre('save', function(next) {
  if (this.isNew && !this.validUntil) {
    this.validUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
  }
  next();
});

export default mongoose.model('WeatherAdvisory', weatherAdvisorySchema);
