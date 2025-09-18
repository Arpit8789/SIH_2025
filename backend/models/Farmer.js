// models/Farmer.js
import mongoose from 'mongoose';
import User from './User.js';

const farmerSchema = new mongoose.Schema({
  farmLocation: {
    state: { type: String, required: true },
    district: { type: String, required: true },
    village: String,
    pincode: { type: String, match: /^[1-9][0-9]{5}$/ },
    coordinates: {
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 }
    }
  },
  landSize: {
    type: Number, // in acres
    required: true,
    min: 0.1
  },
  currentCrops: [String],
  soilType: {
    type: String,
    enum: ['clay', 'sandy', 'loamy', 'silt', 'peaty', 'chalky']
  },
  farmingExperience: {
    type: Number, // in years
    default: 0,
    min: 0
  },
  preferredLanguage: {
    type: String,
    enum: ['english', 'hindi', 'punjabi'],
    default: 'hindi'
  },
  governmentSchemes: [{
    schemeName: String,
    schemeId: String,
    appliedDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['applied', 'approved', 'rejected', 'pending'],
      default: 'pending'
    },
    amount: Number,
    documents: [String]
  }],
  farmingType: {
    type: String,
    enum: ['organic', 'traditional', 'mixed'],
    default: 'traditional'
  },
  irrigationSystem: {
    type: String,
    enum: ['drip', 'sprinkler', 'flood', 'none']
  }
});

export default User.discriminator('Farmer', farmerSchema);
