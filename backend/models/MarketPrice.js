// models/MarketPrice.js
import mongoose from 'mongoose';

const marketPriceSchema = new mongoose.Schema({
  cropName: {
    type: String,
    required: true
  },
  cropId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  },
  market: {
    name: String,
    state: String,
    district: String
  },
  priceData: {
    minimum: { type: Number, required: true },
    maximum: { type: Number, required: true },
    average: { type: Number, required: true },
    unit: { type: String, default: 'per quintal' }
  },
  quality: {
    type: String,
    enum: ['FAQ', 'Grade A', 'Grade B', 'Grade C'],
    default: 'FAQ'
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  source: {
    type: String,
    enum: ['api', 'manual', 'farmer_input'],
    default: 'api'
  }
}, { timestamps: true });

marketPriceSchema.index({ cropName: 1, date: -1 });
marketPriceSchema.index({ 'market.state': 1, date: -1 });

export default mongoose.model('MarketPrice', marketPriceSchema);
