const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const defaultLocalUri = 'mongodb://127.0.0.1:27017/nepaladvocate';
    const mongoUri = process.env.MONGODB_URI || defaultLocalUri;

    console.log('🔌 Connecting to MongoDB...');
    console.log(`   URI: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    
    // Validate MONGODB_URI format (allow localhost in development)
    const isLocalUri = mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1');
    if (isLocalUri && process.env.NODE_ENV === 'production') {
      console.error('❌ MONGODB_URI points to localhost in production. Please use a hosted MongoDB (e.g., Atlas).');
      console.error('   Format: mongodb+srv://username:password@cluster.mongodb.net/nepaladvocate');
      process.exit(1);
    }
    
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout (increased for Render)
      socketTimeoutMS: 45000, // 45 seconds socket timeout
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    
    // Verify database and list collections
    try {
      const db = conn.connection.db;
      const collections = await db.listCollections().toArray();
      console.log(`   Collections found: ${collections.length}`);
      if (collections.length > 0) {
        console.log(`   Collections: ${collections.map(c => c.name).join(', ')}`);
      }
    } catch (err) {
      console.warn('   ⚠️ Could not list collections:', err.message);
    }
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
    // Ensure indexes are created
    mongoose.connection.once('open', async () => {
      console.log('📊 Ensuring database indexes are created...');
      try {
        // Import models to ensure they're registered and indexes are created
        require('../models/User');
        require('../models/Appointment');
        require('../models/Conversation');
        require('../models/Message');
        require('../models/Document');
        require('../models/LawyerProfile');
        require('../models/LegalTemplate');
        require('../models/Notification');
        require('../models/Review');
        require('../models/VerificationRequest');
        console.log('✅ All models loaded and indexes ready');
      } catch (err) {
        console.warn('⚠️ Error loading models:', err.message);
      }
    });
    
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:');
    console.error(`   Error: ${error.message}`);
    
    // Provide helpful error messages
    if (error.message.includes('authentication failed')) {
      console.error('   💡 Check your MongoDB username and password');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('   💡 Check your MongoDB connection string format');
      console.error('   💡 Verify network access in MongoDB Atlas');
    } else if (error.message.includes('timeout')) {
      console.error('   💡 Check MongoDB Atlas IP whitelist');
      console.error('   💡 For Render, allow 0.0.0.0/0 or specific Render IPs');
    } else if (error.message.includes('bad auth')) {
      console.error('   💡 Authentication failed - check username/password');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;

