// models/GovernmentScheme.js
import mongoose from 'mongoose';

const governmentSchemeSchema = new mongoose.Schema({
  schemeName: {
    type: String,
    required: true,
    trim: true
  },
  schemeCode: {
    type: String,
    unique: true,
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  category: {
    type: String,
    enum: ['subsidy', 'loan', 'insurance', 'training', 'equipment', 'seeds', 'fertilizers'],
    required: true
  },
  eligibility: {
    landSize: {
      min: Number,
      max: Number
    },
    income: {
      min: Number,
      max: Number
    },
    age: {
      min: Number,
      max: Number
    },
    states: [String],
    cropTypes: [String],
    farmerType: {
      type: String,
      enum: ['small', 'marginal', 'medium', 'large', 'all']
    }
  },
  benefits: {
    monetaryBenefit: {
      amount: Number,
      percentage: Number,
      unit: String
    },
    nonMonetaryBenefits: [String]
  },
  applicationProcess: {
    steps: [String],
    requiredDocuments: [String],
    applicationFee: {
      type: Number,
      default: 0
    },
    processingTime: String,
    applicationMode: {
      type: String,
      enum: ['online', 'offline', 'both']
    }
  },
  contactInfo: {
    department: String,
    phoneNumber: String,
    email: String,
    website: String,
    address: String
  },
  timeline: {
    startDate: Date,
    endDate: Date,
    isOngoing: {
      type: Boolean,
      default: true
    }
  },
  popularity: {
    totalApplications: {
      type: Number,
      default: 0
    },
    approvedApplications: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  language: {
    type: String,
    enum: ['english', 'hindi', 'punjabi', 'all'],
    default: 'all'
  }
}, { timestamps: true });

governmentSchemeSchema.index({ category: 1, isActive: 1 });
governmentSchemeSchema.index({ 'eligibility.states': 1 });
governmentSchemeSchema.index({ 'timeline.startDate': 1, 'timeline.endDate': 1 });

export default mongoose.model('GovernmentScheme', governmentSchemeSchema);
