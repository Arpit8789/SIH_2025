// models/Buyer.js
import mongoose from 'mongoose';
import User from './User.js';

const buyerSchema = new mongoose.Schema({
  companyName: String,
  businessType: {
    type: String,
    enum: ['retailer', 'wholesaler', 'processor', 'exporter'],
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  interestedCrops: [String],
  purchaseHistory: [{
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer'
    },
    cropName: String,
    quantity: Number,
    pricePerUnit: Number,
    totalAmount: Number,
    purchaseDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending'
    }
  }],
  creditRating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  businessLicense: {
    licenseNumber: String,
    validUntil: Date
  }
});

export default User.discriminator('Buyer', buyerSchema);
