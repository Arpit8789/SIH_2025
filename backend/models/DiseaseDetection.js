// models/DiseaseDetection.js
import mongoose from 'mongoose';

const diseaseDetectionSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  cropName: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  originalFileName: String,
  detectionResults: {
    diseaseName: String,
    confidence: {
      type: Number,
      min: 0,
      max: 100
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      default: 'moderate'
    },
    affectedArea: {
      type: Number, // percentage
      min: 0,
      max: 100
    }
  },
  aiModelUsed: {
    name: String,
    version: String,
    accuracy: Number
  },
  recommendations: [{
    treatment: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent']
    },
    cost: Number,
    timeframe: String,
    description: String
  }],
  preventiveMeasures: [String],
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  status: {
    type: String,
    enum: ['detected', 'treated', 'resolved', 'monitoring'],
    default: 'detected'
  },
  isVerifiedByExpert: {
    type: Boolean,
    default: false
  },
  expertNotes: String,
  detectionDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

diseaseDetectionSchema.index({ farmerId: 1, detectionDate: -1 });
diseaseDetectionSchema.index({ cropName: 1, 'detectionResults.diseaseName': 1 });

export default mongoose.model('DiseaseDetection', diseaseDetectionSchema);
