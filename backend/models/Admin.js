// models/Admin.js
import mongoose from 'mongoose';
import User from './User.js';

const adminSchema = new mongoose.Schema({
  permissions: [{
    type: String,
    enum: ['manage_users', 'view_analytics', 'manage_schemes', 'system_admin', 'moderate_content']
  }],
  department: {
    type: String,
    default: 'Agriculture'
  },
  employeeId: {
    type: String,
    unique: true,
    required: true
  },
  accessLevel: {
    type: Number,
    min: 1,
    max: 5,
    default: 2
  },
  lastActivityDate: {
    type: Date,
    default: Date.now
  }
});

export default User.discriminator('Admin', adminSchema);
