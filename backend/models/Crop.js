// models/Crop.js
import mongoose from 'mongoose';

const cropSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  scientificName: String,
  category: {
    type: String,
    enum: ['cereals', 'pulses', 'oilseeds', 'spices', 'vegetables', 'fruits', 'cash_crops'],
    required: true
  },
  season: {
    type: String,
    enum: ['kharif', 'rabi', 'zaid', 'perennial'],
    required: true
  },
  growthDuration: {
    type: Number, // in days
    required: true
  },
  soilRequirements: [{
    type: String,
    enum: ['clay', 'sandy', 'loamy', 'silt', 'peaty', 'chalky']
  }],
  climateRequirements: {
    temperature: {
      min: Number,
      max: Number
    },
    rainfall: {
      min: Number,
      max: Number
    },
    humidity: {
      min: Number,
      max: Number
    }
  },
  marketPrice: {
    current: Number,
    lastUpdated: { type: Date, default: Date.now },
    trend: {
      type: String,
      enum: ['rising', 'falling', 'stable']
    }
  },
  nutritionalValue: {
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number
  },
  commonDiseases: [String],
  fertilizers: [String],
  harvestingSeason: String,
  storageRequirements: String
}, { timestamps: true });

cropSchema.index({ name: 1 });
cropSchema.index({ category: 1, season: 1 });

export default mongoose.model('Crop', cropSchema);
