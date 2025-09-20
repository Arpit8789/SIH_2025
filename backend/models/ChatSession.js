// models/ChatSession.js - Chat Session Database Model
import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  language: {
    type: String,
    enum: ['en', 'hi', 'pa'],
    default: 'en'
  },
  isVoice: {
    type: Boolean,
    default: false
  }
});

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Allow anonymous sessions for non-logged users
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  messages: [chatMessageSchema],
  context: {
    currentPage: {
      type: String,
      default: 'landing'
    },
    userRole: {
      type: String,
      enum: ['farmer', 'buyer', 'admin', 'visitor'],
      default: 'visitor'
    },
    language: {
      type: String,
      enum: ['en', 'hi', 'pa'],
      default: 'en'
    },
    location: {
      state: String,
      district: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    }
  },
  metadata: {
    totalMessages: {
      type: Number,
      default: 0
    },
    totalVoiceMessages: {
      type: Number,
      default: 0
    },
    firstMessageAt: {
      type: Date,
      default: Date.now
    },
    lastMessageAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
chatSessionSchema.index({ sessionId: 1 });
chatSessionSchema.index({ userId: 1 });
chatSessionSchema.index({ 'metadata.lastMessageAt': -1 });

// Methods
chatSessionSchema.methods.addMessage = function(role, content, language = 'en', isVoice = false) {
  this.messages.push({
    role,
    content,
    language,
    isVoice,
    timestamp: new Date()
  });
  
  this.metadata.totalMessages += 1;
  if (isVoice) this.metadata.totalVoiceMessages += 1;
  this.metadata.lastMessageAt = new Date();
  
  // Keep only last 20 messages for performance
  if (this.messages.length > 20) {
    this.messages = this.messages.slice(-20);
  }
  
  return this.save();
};

chatSessionSchema.methods.updateContext = function(contextData) {
  this.context = { ...this.context, ...contextData };
  return this.save();
};

chatSessionSchema.methods.getRecentMessages = function(limit = 10) {
  return this.messages.slice(-limit);
};

// Auto-expire old sessions after 24 hours of inactivity
chatSessionSchema.index(
  { 'metadata.lastMessageAt': 1 }, 
  { expireAfterSeconds: 24 * 60 * 60 } // 24 hours
);

export default mongoose.model('ChatSession', chatSessionSchema);
