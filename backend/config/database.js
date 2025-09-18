// config/database.js - Final Fixed Version
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      // Debug environment variables
      console.log('🔍 ENV CHECK:');
      console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Found ✅' : 'Missing ❌');
      console.log('MONGODB_URI_PROD:', process.env.MONGODB_URI_PROD ? 'Found ✅' : 'Missing ❌');

      // Get URI directly from environment
      const uri = process.env.MONGODB_URI || process.env.MONGODB_URI_PROD;
      
      console.log(`🌾 Connecting to MongoDB...`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📍 URI Found: ${uri ? '✅ Yes' : '❌ No'}`);
      
      if (!uri) {
        console.log('🚨 No MongoDB URI found in environment variables');
        console.log('⚠️  Server will continue without database');
        return null;
      }
      
      this.connection = await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      
      console.log(`✅ MongoDB Connected: ${this.connection.connection.host}`);
      console.log(`📂 Database: ${this.connection.connection.name}`);
      
      return this.connection;
      
    } catch (error) {
      console.error('❌ MongoDB Connection Error:', error.message);
      console.log('⚠️  Server will continue without database');
      return null;
    }
  }

  isConnected() {
    return mongoose.connection.readyState === 1;
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect();
      console.log('✅ MongoDB disconnected');
    }
  }
}

// Export singleton instance
const database = new Database();
export default database;
