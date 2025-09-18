// models/WeatherAlert.js
import mongoose from 'mongoose';

const weatherAlertSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  alertType: {
    type: String,
    enum: ['rain', 'drought', 'storm', 'hailstorm', 'frost', 'heatwave'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  message: {
    type: String,
    required: true
  },
  recommendations: [String],
  location: {
    state: String,
    district: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

weatherAlertSchema.index({ farmerId: 1, isRead: 1 });
weatherAlertSchema.index({ validUntil: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('WeatherAlert', weatherAlertSchema);
